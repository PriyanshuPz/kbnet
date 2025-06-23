import { prisma } from "@kbnet/db";
import { type MapSummary } from "@kbnet/db/types";
import { Hono } from "hono";
import { generateMapSummary } from "../controllers/summary";
import { authClient } from "../lib/auth-client";
import { userSettings } from "../controllers/user";
import { runMindsDBQuery } from "@kbnet/shared/mindsdb";
import { MindsDBConfig } from "@kbnet/shared";

const router = new Hono<{
  Variables: {
    user: typeof authClient.$Infer.Session.user | null;
    session: typeof authClient.$Infer.Session.session | null;
  };
}>();

router.post("/maps/trigger/summary", async (c) => {
  try {
    const { searchParams } = new URL(c.req.raw.url);
    const mapId = searchParams.get("mapId");
    if (!mapId) {
      return c.json({ error: "Map ID is required" }, 400);
    }

    const user = c.get("user");

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const map = await prisma.map.findUnique({
      where: { id: mapId },
      include: { latestSummary: true },
    });

    if (!map) {
      return c.json({ error: "Map not found" }, 404);
    }

    if (map.userId !== user.id) {
      return c.json(
        { error: "Forbidden: You do not have permission to use this map" },
        403
      );
    }

    // limit it to one summary generation one time in 24 hours
    const lastGenerated = map.latestSummary?.requestedAt;
    if (lastGenerated) {
      const now = new Date();
      const hoursSinceLast =
        (now.getTime() - lastGenerated.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLast < 24) {
        return c.json(
          { error: "You can only generate a summary once every 24 hours" },
          429
        );
      }
    }

    let latestSummary: MapSummary;

    if (!map.latestSummary) {
      latestSummary = await prisma.mapSummary.create({
        data: {
          mapId: map.id,
          status: "PENDING",
          generatedBy: "USER",
        },
      });
    } else {
      latestSummary = map.latestSummary;
    }

    if (
      latestSummary.status !== "PENDING" &&
      latestSummary.status !== "FAILED"
    ) {
      return c.json(
        {
          error: "Map summary is already being generated",
          summary: latestSummary.summary,
        },
        400
      );
    }

    // Trigger the async summary generation
    await prisma.mapSummary.update({
      where: { id: latestSummary.id },
      data: { status: "IN_PROGRESS", requestedAt: new Date() },
    });

    // Start the generation process in the background
    generateMapSummary(mapId).catch((error) => {
      console.error("Background summary generation failed:", error);
    });

    return c.json({
      message: "Summary generation started",
      summaryId: latestSummary.id,
    });
  } catch (error) {
    console.error("Error in /maps/trigger/summary:", error);
    return c.json({ error: "Failed to trigger map summary" }, 500);
  }
});

router.post("/assistant", async (c) => {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const settings = await userSettings(user.id);

    if (!settings.useMindsDB) {
      return c.json(
        { error: "MindsDB needs to be enabled for this action." },
        403
      );
    }

    const { messages, currentNodeId } = await c.req.json();
    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: "Invalid messages format" }, 400);
    }

    const node = await prisma.node.findUnique({
      where: { id: currentNodeId },
      include: {
        navigationSteps: {
          include: {
            parentStep: {
              include: {
                node: true,
              },
            },
          },
        },
      },
    });

    const currentNode = node || null;
    const previousNodes =
      node?.navigationSteps.map((step) => step.parentStep?.node)[0] || null;

    const prompt = `
      You are an AI assistant designed to help users with their knowledge base.
      Your task is to provide helpful and accurate responses based on the provided messages and context.
      Current Node:
      - ${currentNode ? `ID: ${currentNode.id}, Title: ${currentNode.title}, Summary: ${currentNode.summary}` : "None"}
      Previous Node:
      - ${previousNodes ? `ID: ${previousNodes.id}, Title: ${previousNodes.title}, Summary: ${previousNodes.summary}` : "None"}
      Messages:
      ${messages.map((msg, index) => `Message ${index + 1} from ${msg.role}: ${msg.content[0].text}`).join("\n")}
      `;

    // FROM ${MindsDBConfig.MAIN_NODE_GEN_MODEL}
    const query = await runMindsDBQuery(`
      SELECT answer
      FROM gen_main_node_model
      WHERE question = '${prompt.replace(/'/g, "''")}';
      `);

    if (query.type != "table") {
      return c.json({ error: "Failed to get response from MindsDB" }, 500);
    }

    const answer =
      query.rows[0]?.answer ||
      "I'm sorry, I don't have an answer for that at the moment.";

    return c.json({ text: answer });
  } catch (error) {
    console.error("Error in /assistant:", error);
    return c.json({ error: "Failed to get status" }, 500);
  }
});

export default router;
