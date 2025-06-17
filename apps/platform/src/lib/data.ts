"use server";

import { Node, prisma } from "@kbnet/db";

export async function fetchMapData(id: string) {
  try {
    const map = await prisma.map.findUnique({
      where: { id },
    });

    if (!map) throw new Error("Map not found");

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

    return {
      mapId: map.id,
      currentNavigationStepId: currentStep.id,
      currentPathBranchId: currentStep.pathBranchId,
      currentStepIndex: currentStep.stepIndex,
      mainNode: mainNode,
      similarNode: neighborsMap.similar || null,
      relatedNode: neighborsMap.related || null,
      deepNode: neighborsMap.deep || null,
    };
  } catch (error) {
    return null;
  }
}
