import { useCallback } from "react";
import { Node } from "@kbnet/db";
import { useGlobal } from "@/store/global-state";
import { sessionHelpers } from "@/lib/session";

export const useMapNavigation = () => {
  const {
    map,
    currentNode,
    deepNode,
    similarNode,
    relatedNode,
    setCurrentNode,
    setDeepNode,
    setRelatedNode,
    setSimilarNode,
    setCurrentNavigationStepId,
    setCurrentStepIndex,
  } = useGlobal();

  const updateClientSideState = (
    targetNode: Node,
    direction: "LEFT" | "RIGHT" | "UP"
  ) => {
    switch (direction) {
      case "LEFT":
        setCurrentNode(similarNode);
        setSimilarNode(null);
        break;
      case "RIGHT":
        setCurrentNode(relatedNode);
        setRelatedNode(null);
        break;
      case "UP":
        setCurrentNode(deepNode);
        setDeepNode(null);
        break;
    }
  };

  const handleNavigate = useCallback(
    (targetNode: Node | null, direction: "LEFT" | "RIGHT" | "UP") => {
      if (!map.id || !map.currentNavigationStepId || !targetNode) return;
      updateClientSideState(targetNode, direction);
      sessionHelpers.navigate(
        targetNode.id,
        direction,
        map.currentNavigationStepId,
        map.currentPathBranchId
      );
    },
    [map.id, map.currentNavigationStepId, map.currentPathBranchId]
  );

  const handleGoBack = useCallback(() => {
    if (!map.id || !map.currentNavigationStepId || map.currentStepIndex <= 0)
      return;
    sessionHelpers.navigateBack(
      map.currentNavigationStepId,
      map.currentPathBranchId
    );
  }, [map]);

  return {
    handleNavigate,
    handleGoBack,
    canGoBack: map.currentStepIndex > 0,
    nodes: {
      current: currentNode,
      deep: deepNode,
      similar: similarNode,
      related: relatedNode,
    },
  };
};
