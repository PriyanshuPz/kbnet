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
    // Get only necessary fields
    const steps = await prisma.navigationStep.findMany({
      where: { mapId },
      select: {
        id: true,
        pathBranchId: true,
        stepIndex: true,
        nodeId: true,
        parentStepId: true,
        node: {
          select: {
            title: true,
          },
        },
      },
      orderBy: [{ pathBranchId: "asc" }, { stepIndex: "asc" }],
    });

    const branchColors: Record<string, string> = {};
    const uniqueBranches = [...new Set(steps.map((step) => step.pathBranchId))];

    // Assign colors to branches
    uniqueBranches.forEach((branchId, idx) => {
      const hue = (idx * 137.5) % 360;
      branchColors[branchId] = `hsl(${hue}, 70%, 50%)`;
    });

    // Process branches
    const branchInfo = uniqueBranches.map((branchId) => {
      const branchSteps = steps.filter((s) => s.pathBranchId === branchId);
      const firstStep = branchSteps[0];

      let forkInfo = null;
      if (firstStep?.parentStepId) {
        const parentStep = steps.find((s) => s.id === firstStep.parentStepId);
        if (parentStep && parentStep.pathBranchId !== branchId) {
          forkInfo = {
            fromBranchId: parentStep.pathBranchId,
            atStepTitle: parentStep.node.title,
            atStepIndex: parentStep.stepIndex,
          };
        }
      }

      return {
        id: branchId,
        isFork: !!forkInfo,
        forkInfo,
      };
    });

    // Get current step
    const map = await prisma.map.findUnique({
      where: { id: mapId },
      select: { currentNavigationStepId: true },
    });

    // Prepare minimal node data
    const nodes = steps.map((step) => ({
      id: step.id,
      data: {
        title: step.node.title,
        stepIndex: step.stepIndex,
        branchId: step.pathBranchId,
      },
    }));

    const result = {
      mapId,
      flowData: { nodes },
      metadata: {
        branches: branchInfo,
        branchColors,
        currentStepId: map?.currentNavigationStepId,
      },
    };

    handler.sendToSession(mapId, MessageType.MAP_BRANCHES, result);
  } catch (error) {
    console.error("Error fetching map branches:", error);
    ws.send(
      pack(MessageType.ERROR, {
        error: error instanceof Error ? error.message : "Unknown error",
      })
    );
  }
}
