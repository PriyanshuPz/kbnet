import { MessageType, pack } from "@kbnet/shared";
import { handler } from "../handler";
import { prisma } from "@kbnet/db";
import type { WSContext } from "hono/ws";

interface BasePayload {
  userId: string;
  ws: WSContext<WebSocket>;
}

export async function getMapBranches({
  userId,
  data,
  ws,
}: BasePayload & { data: { mapId: string } }) {
  const { mapId } = data;

  try {
    // Get all navigation steps for this map
    const steps = await prisma.navigationStep.findMany({
      where: { mapId },
      include: {
        node: {
          select: {
            id: true,
            title: true,
          },
        },
        parentStep: {
          select: {
            id: true,
            pathBranchId: true,
          },
        },
      },
      orderBy: [{ pathBranchId: "asc" }, { stepIndex: "asc" }],
    });

    // Group steps by branch
    const branchesByIdMap = new Map();

    // First pass: collect all branches and their steps
    steps.forEach((step) => {
      if (!branchesByIdMap.has(step.pathBranchId)) {
        branchesByIdMap.set(step.pathBranchId, {
          id: step.pathBranchId,
          steps: [],
          parentBranchId: step.parentStep?.pathBranchId || null,
          forkPoint: step.parentStepId || null,
        });
      }

      branchesByIdMap.get(step.pathBranchId).steps.push({
        id: step.id,
        nodeId: step.nodeId,
        title: step.node.title,
        stepIndex: step.stepIndex,
        direction: step.direction,
        parentStepId: step.parentStepId,
      });
    });

    // Convert Map to array for client consumption
    const branches = Array.from(branchesByIdMap.values());

    // Get current active branch and step
    const map = await prisma.map.findUnique({
      where: { id: mapId },
      select: { currentNavigationStepId: true },
    });

    // Find the current step and its branch
    const currentStep = map?.currentNavigationStepId
      ? await prisma.navigationStep.findUnique({
          where: { id: map.currentNavigationStepId },
          select: { pathBranchId: true, stepIndex: true },
        })
      : null;

    const result = {
      mapId,
      branches,
      currentBranchId: currentStep?.pathBranchId || null,
      currentStepIndex: currentStep?.stepIndex || 0,
    };

    handler.sendToSession(mapId, MessageType.MAP_BRANCHES, result);
  } catch (error) {
    console.error("Error fetching map branches:", error);
    ws.send(
      pack(MessageType.ERROR, {
        message: "Failed to fetch map branches",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    );
  }
}
