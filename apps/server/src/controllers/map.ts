import type { WSContext } from "hono/ws";
import { initiateIngestion } from "./ingestion";
import { runMindsDBQuery } from "../lib/mindsdb";
import { MessageType, MindsDBConfig, pack } from "@kbnet/shared";
import { generateId, sanitizeSQLValue } from "../lib/util";
import {
  DEEP_NODE_PROMPT,
  MAIN_NODE_GEN_MODEL_PROMPT,
  RELATED_NODE_PROMPT,
  SIMILAR_NODE_PROMPT,
} from "../lib/prompts";
import { prisma, type NavigationStep, type Node } from "@kbnet/db";
import { google } from "../lib/ai";
import { generateObject } from "ai";
import { z } from "zod";
import { handler } from "../handler";
import { applyUserStats } from "./user-stats";

interface BasePayload {
  userId: string;
  ws: WSContext<WebSocket>;
}

interface NewMapPayload extends BasePayload {
  data: { query: string };
}

export async function createNewMap({ userId, data, ws }: NewMapPayload) {
  // Ingest data in the background
  // Uncomment this line in production to enable ingestion
  // initiateIngestion(data.query);

  try {
    const kbdata = await runMindsDBQuery(`
      SELECT * FROM ${MindsDBConfig.KB_NAME}
      WHERE content = ${sanitizeSQLValue(data.query)}
      LIMIT 10;
      `);

    const system = MAIN_NODE_GEN_MODEL_PROMPT(data.query, kbdata.rows);

    const { object } = await generateObject({
      model: google("gemini-2.0-flash"),
      system: system,
      schema: z.object({
        mainNode: z.object({
          title: z
            .string()
            .describe(`Title or concept of the main topic: ${data.query}.`),
          summary: z
            .string()
            .describe(`Brief summary of the main node: ${data.query}.`),
        }),
        deepNode: z.object({
          label: z
            .string()
            .describe(`One of the little deep topic of ${data.query}.`),
          content: z.string().describe("Brief summary of the deep topic."),
        }),
        relatedNode: z.object({
          label: z.string().describe(`Question or related ${data.query}.`),
          hint: z.string().describe("Brief summary of the related topic."),
        }),
        similarNode: z.object({
          label: z
            .string()
            .describe(`Similar topic to the main node: ${data.query}.`),
          hint: z.string().describe("Brief summary of the similar topic."),
        }),
      }),
      prompt: `Create a beginner-friendly knowledge map starting point for: "${data.query}"`,
    });

    const result = await prisma.$transaction(async (tx) => {
      const newMap = await prisma.map.create({
        data: {
          id: generateId("map"),
          userId,
          initialQuery: data.query,
          isActive: true,
          startedAt: new Date(),
        },
      });

      const mainNodeId = generateId("node");
      const deepNodeId = generateId("node");
      const relatedNodeId = generateId("node");
      const similarNodeId = generateId("node");

      await tx.node.createMany({
        data: [
          {
            id: mainNodeId,
            title: object.mainNode.title,
            summary: object.mainNode.summary,
            generated: true,
          },
          {
            id: deepNodeId,
            title: object.deepNode.label,
            summary: object.deepNode.content,
            generated: true,
          },
          {
            id: relatedNodeId,
            title: object.relatedNode.label,
            summary: object.relatedNode.hint,
            generated: true,
          },
          {
            id: similarNodeId,
            title: object.similarNode.label,
            summary: object.similarNode.hint,
            generated: true,
          },
        ],
      });

      await tx.nodeRelationship.createMany({
        data: [
          {
            sourceNodeId: mainNodeId,
            targetNodeId: deepNodeId,
            type: "DEEP",
          },
          {
            sourceNodeId: mainNodeId,
            targetNodeId: relatedNodeId,
            type: "RELATED",
          },
          {
            sourceNodeId: mainNodeId,
            targetNodeId: similarNodeId,
            type: "SIMILAR",
          },
        ],
      });

      const firstStep = await tx.navigationStep.create({
        data: {
          mapId: newMap.id,
          nodeId: mainNodeId,
          direction: "INITIAL",
          stepIndex: 0,
          pathBranchId: generateId("branch"),
          timestamp: new Date(),
        },
      });

      await tx.map.update({
        where: { id: newMap.id },
        data: {
          currentNavigationStepId: firstStep.id,
        },
      });

      const [mainNodeWithDetails, relationships] = await Promise.all([
        tx.node.findUnique({
          where: { id: mainNodeId },
        }),
        tx.nodeRelationship.findMany({
          where: {
            sourceNodeId: mainNodeId,
          },
          include: {
            targetNode: true,
          },
        }),
      ]);

      const neighborsMap: {
        deep?: Node;
        related?: Node;
        similar?: Node;
      } = {};

      for (const rel of relationships) {
        if (rel.type === "DEEP") {
          neighborsMap.deep = rel.targetNode;
        } else if (rel.type === "RELATED") {
          neighborsMap.related = rel.targetNode;
        } else if (rel.type === "SIMILAR") {
          neighborsMap.similar = rel.targetNode;
        }
      }

      console.log("New map created with ID:", newMap.id);

      return {
        mapId: newMap.id,
        currentNavigationStepId: firstStep.id,
        currentPathBranchId: firstStep.pathBranchId,
        currentStepIndex: firstStep.stepIndex,
        mainNode: mainNodeWithDetails,
        similarNode: neighborsMap.similar || null,
        relatedNode: neighborsMap.related || null,
        deepNode: neighborsMap.deep || null,
      };
    });

    console.log("New map created successfully:", result.currentPathBranchId);
    handler.joinSessionRoom(userId, ws, result.mapId);

    await applyUserStats(userId, "START_MAP");

    handler.sendToSession(result.mapId, MessageType.MAP_CREATED, result);
  } catch (error) {
    console.error("Error creating new map:", error);
    ws.send(
      pack(MessageType.ERROR, {
        message: "Failed to create new map",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    );
  }
}

export async function resumeMap({
  userId,
  data,
  ws,
}: BasePayload & { data: { mapId: string } }) {
  const { mapId } = data;

  try {
    const map = await prisma.map.findUnique({
      where: { id: mapId },
    });

    if (!map) {
      throw new Error(`Map with ID ${mapId} not found`);
    }

    if (!map.currentNavigationStepId)
      throw new Error("No current navigation step found");

    const currentStep = await prisma.navigationStep.findUnique({
      where: { id: map.currentNavigationStepId },
      include: {
        node: true,
      },
    });

    if (!currentStep) throw new Error("Current step not found");
    const mainNode = currentStep.node;

    const relationships = await prisma.nodeRelationship.findMany({
      where: {
        sourceNodeId: mainNode.id,
      },
      include: {
        targetNode: true,
      },
    });
    const neighborsMap: {
      deep?: Node;
      related?: Node;
      similar?: Node;
    } = {};

    for (const rel of relationships) {
      if (rel.type === "DEEP") {
        neighborsMap.deep = rel.targetNode;
      } else if (rel.type === "RELATED") {
        neighborsMap.related = rel.targetNode;
      } else if (rel.type === "SIMILAR") {
        neighborsMap.similar = rel.targetNode;
      }
    }
    handler.joinSessionRoom(userId, ws, map.id);

    const result = {
      mapId: map.id,
      currentNavigationStepId: currentStep.id,
      currentPathBranchId: currentStep.pathBranchId,
      currentStepIndex: currentStep.stepIndex,
      mainNode: mainNode,
      similarNode: neighborsMap.similar || null,
      relatedNode: neighborsMap.related || null,
      deepNode: neighborsMap.deep || null,
    };

    handler.sendToSession(map.id, MessageType.MAP_DATA, result);
  } catch (error) {
    console.error("Error resuming map:", error);
    ws.send(
      pack(MessageType.ERROR, {
        message: "Failed to resume map",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    );
  }
}

export async function navigateMap({
  userId,
  data,
  ws,
}: BasePayload & {
  data: {
    nextNodeId: string;
    direction: "LEFT" | "RIGHT" | "UP";
    currentPathNodeId: string;
    currentPathBranchId: string;
  };
}) {
  const { nextNodeId, direction, currentPathNodeId, currentPathBranchId } =
    data;

  try {
    const currentStep = await prisma.navigationStep.findUnique({
      where: { id: currentPathNodeId },
    });

    if (!currentStep) {
      throw new Error("Current step not found");
    }

    const mapId = currentStep.mapId;

    // Check if user is navigating to a node they've already visited in this branch
    const existingStep = await prisma.navigationStep.findFirst({
      where: {
        mapId,
        nodeId: nextNodeId,
        pathBranchId: currentPathBranchId,
      },
    });

    // 2. Determine if this navigation creates a new branch
    // This happens if the user "went back" (i.e., currentStep.id != Session.currentNavigationStepId after a go-back)
    // AND they are now moving *forward* to a topic that isn't the direct child they came from.
    // Or, simpler for this specific architecture: a new branch is created if the 'parentStepId'
    // for this new step is NOT the immediate child of the previous parentStep.
    // However, given our schema with `pathBranchId`, the core branching logic is simpler:
    // A new branch ID is generated IF:
    //  a) The current `currentNavigationStepId` is NOT the `id` of the *last* step in its branch sequence (i.e., user went back)
    //  AND
    //  b) The `targetNodeId` is NOT the `nodeId` of the child they were originally at if they hadn't gone back.
    // This can be simplified. The frontend passes `currentPathBranchId` and `currentStepIndex`.
    // If the user navigates from a step that is *not* the latest step of the original branch, it's a new branch.
    let newStep: NavigationStep;
    let newPathBranchId = currentPathBranchId;
    let newStepIndex = currentStep.stepIndex + 1;

    // A branch starts when you move forward from a point that's not the "end" of the main linear path.
    // The `parentStepId` passed from the frontend is the ID of the step from which the user is moving.
    // If this `parentStepId` is NOT the `currentNavigationStepId` of the session, it means
    // the user has effectively "gone back" and is now moving forward *from that historical point*.
    // In this case, we create a new branch.

    if (existingStep) {
      // User is revisiting a node they've already explored - reuse existing step
      newStep = existingStep;
      newPathBranchId = existingStep.pathBranchId;
      newStepIndex = existingStep.stepIndex;

      // Just update the map's current navigation step without creating a new one
      await prisma.map.update({
        where: { id: mapId },
        data: {
          currentNavigationStepId: existingStep.id,
        },
      });
    } else {
      const lastestStepInBranch = await prisma.navigationStep.findFirst({
        where: { mapId },
        orderBy: { timestamp: "desc" },
        select: { id: true },
      });

      if (lastestStepInBranch && lastestStepInBranch.id !== currentPathNodeId) {
        // User has gone back, so we create a new branch
        newPathBranchId = generateId("branch");
        newStepIndex = 0; // Reset step index for the new branch

        await applyUserStats(userId, "DISCOVERED_NEW_BRANCH");
      }

      newStep = await prisma.$transaction(async (tx) => {
        const step = await tx.navigationStep.create({
          data: {
            mapId,
            nodeId: nextNodeId,
            direction,
            stepIndex: newStepIndex,
            pathBranchId: newPathBranchId,
            parentStepId: currentPathNodeId, // Link to the current step
            timestamp: new Date(),
          },
        });

        await tx.map.update({
          where: { id: mapId },
          data: {
            currentNavigationStepId: step.id,
          },
        });

        return step;
      });
    }

    const nodes = await generateNeighborsOnNavigate(
      nextNodeId,
      currentPathNodeId,
      newPathBranchId,
      newStepIndex
    );

    const result = {
      mapId,
      currentNavigationStepId: newStep.id,
      currentPathBranchId: newPathBranchId,
      currentStepIndex: newStepIndex,
      mainNode: nodes.mainNode,
      similarNode: nodes.similar,
      relatedNode: nodes.related,
      deepNode: nodes.deep,
    };

    handler.joinSessionRoom(userId, ws, mapId);
    handler.sendToSession(mapId, MessageType.MAP_DATA, result);
    // if it is new step, apply user stats
    if (!existingStep) {
      await applyUserStats(userId, "VISIT_NODE");
    }
  } catch (error) {
    console.error("Error naivgating map:", error);
    ws.send(
      pack(MessageType.ERROR, {
        message: "Failed to naivgating map",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    );
  }
}

export async function navigateBack({
  userId,
  data,
  ws,
}: BasePayload & {
  data: {
    currentPathNodeId: string;
    currentPathBranchId: string;
  };
}) {
  const { currentPathNodeId, currentPathBranchId } = data;
  try {
    const currentStep = await prisma.navigationStep.findUnique({
      where: { id: currentPathNodeId },
    });

    if (!currentStep || !currentStep.parentStepId) {
      throw new Error("No previous step to go back to.");
    }

    const parentStep = await prisma.navigationStep.findUnique({
      where: { id: currentStep.parentStepId },
      include: {
        node: true,
      },
    });

    if (!parentStep) {
      throw new Error("Parent step not found.");
    }

    await prisma.map.update({
      where: { id: parentStep.mapId },
      data: {
        currentNavigationStepId: parentStep.id,
      },
    });

    const relationships = await prisma.nodeRelationship.findMany({
      where: {
        sourceNodeId: parentStep.nodeId,
      },
      include: {
        targetNode: true,
      },
    });

    const nodes: {
      mainNode: Node;
      deep: Node | null;
      related: Node | null;
      similar: Node | null;
    } = {
      mainNode: parentStep.node,
      deep: null,
      related: null,
      similar: null,
    };

    for (const rel of relationships) {
      if (rel.type === "DEEP") {
        nodes.deep = rel.targetNode;
      } else if (rel.type === "RELATED") {
        nodes.related = rel.targetNode;
      } else if (rel.type === "SIMILAR") {
        nodes.similar = rel.targetNode;
      }
    }

    const result = {
      mapId: parentStep.mapId,
      currentNavigationStepId: parentStep.id,
      currentPathBranchId: parentStep.pathBranchId,
      currentStepIndex: currentStep.stepIndex - 1,
      mainNode: nodes.mainNode,
      similarNode: nodes.similar,
      relatedNode: nodes.related,
      deepNode: nodes.deep,
    };

    handler.joinSessionRoom(userId, ws, parentStep.mapId);
    handler.sendToSession(parentStep.mapId, MessageType.MAP_DATA, result);
  } catch (error) {
    console.error("Error naivgating map:", error);
    ws.send(
      pack(MessageType.ERROR, {
        message: "Failed to naivgating map",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    );
  }
}

// helpers
async function generateNeighborsOnNavigate(
  mainNodeId: string,
  currentStepId: string,
  currentPathBranchId: string,
  currentStepIndex: number
): Promise<{
  mainNode: Node;
  deep: Node;
  related: Node;
  similar: Node;
}> {
  const mainNode = await prisma.node.findUnique({
    where: { id: mainNodeId },
  });
  if (!mainNode) {
    throw new Error(`Main node with ID ${mainNodeId} not found`);
  }

  const relationships = await prisma.nodeRelationship.findMany({
    where: {
      sourceNodeId: mainNodeId,
    },
    include: {
      targetNode: true,
    },
  });

  let deepNode: Node | null = null;
  let relatedNode: Node | null = null;
  let similarNode: Node | null = null;

  for (const rel of relationships) {
    if (rel.type === "DEEP") {
      deepNode = rel.targetNode;
    } else if (rel.type === "RELATED") {
      relatedNode = rel.targetNode;
    } else if (rel.type === "SIMILAR") {
      similarNode = rel.targetNode;
    }
  }
  const [deepNodeResult, relatedNodeResult, similarNodeResult] =
    await Promise.all([
      deepNode || generateNode(mainNode, "DEEP", currentStepIndex),
      relatedNode || generateNode(mainNode, "RELATED", currentStepIndex),
      similarNode || generateNode(mainNode, "SIMILAR", currentStepIndex),
    ]);

  return {
    mainNode,
    deep: deepNodeResult || deepNode,
    related: relatedNodeResult || relatedNode,
    similar: similarNodeResult || similarNode,
  };
}

async function generateNode(
  mainNode: Node,
  type: "DEEP" | "RELATED" | "SIMILAR",
  currentStepIndex: number
) {
  try {
    const kbdata = await runMindsDBQuery(`
      SELECT * FROM ${MindsDBConfig.KB_NAME}
      WHERE content = ${sanitizeSQLValue(mainNode.title)}
      LIMIT 10;
      `);

    let system = "";
    if (type === "DEEP") {
      system = DEEP_NODE_PROMPT(
        mainNode.title,
        mainNode.summary || "",
        kbdata,
        currentStepIndex + 1
      );
    } else if (type === "RELATED") {
      system = RELATED_NODE_PROMPT(
        mainNode.title,
        mainNode.summary || "",
        kbdata,
        currentStepIndex + 1
      );
    } else if (type === "SIMILAR") {
      system = SIMILAR_NODE_PROMPT(
        mainNode.title,
        mainNode.summary || "",
        kbdata,
        currentStepIndex + 1
      );
    } else {
      throw new Error(`Unsupported node type: ${type}`);
    }

    const { object } = await generateObject({
      model: google("gemini-2.0-flash"),
      system,
      schema: z.object({
        label: z.string().describe(`Label for the ${type} node.`),
        content: z.string().describe(`Content for the ${type} node.`),
      }),
      prompt: `Generate a ${type.toLowerCase()} node based on the main node "${mainNode.title}"`,
    });

    const newNode = await prisma.node.create({
      data: {
        id: generateId("node"),
        title: object.label,
        summary: object.content,
        generated: true,
      },
    });

    const newRelationship = await prisma.nodeRelationship.create({
      data: {
        sourceNodeId: mainNode.id,
        targetNodeId: newNode.id,
        type,
      },
    });

    console.log(`Generated ${type} node:`, newNode.id);
    return newNode;
  } catch (error) {
    console.error(`Error generating ${type} node:`, error);
    throw new Error(`Failed to generate ${type} node`);
  }
}
