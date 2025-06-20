import { useEffect, useCallback, useState } from "react";
import { sessionHelpers } from "@/lib/session";
import { useGlobal } from "@/store/global-state";
import { Node } from "@kbnet/db/types";

export function useNavigation() {
  const { map, currentNode, deepNode, relatedNode, similarNode, state } =
    useGlobal();

  const [lastDirection, setLastDirection] = useState<string | null>(null);

  // Handle navigation in a specific direction
  const onNavigate = useCallback(
    (direction: "LEFT" | "RIGHT" | "UP") => {
      if (state === "loading" || state === "navigating") return;

      let targetNode: Node | null = null;

      // Map direction to the correct node
      switch (direction) {
        case "LEFT":
          targetNode = similarNode;
          break;
        case "RIGHT":
          targetNode = relatedNode;
          break;
        case "UP":
          targetNode = deepNode;
          break;
        default:
          return;
      }

      if (!targetNode || !map.id || !map.currentNavigationStepId) {
        console.warn(`No node available for direction: ${direction}`);
        return;
      }

      setLastDirection(direction);

      sessionHelpers.navigate(
        targetNode.id,
        direction,
        map.currentNavigationStepId,
        map.currentPathBranchId
      );
    },
    [
      similarNode,
      relatedNode,
      deepNode,
      map.id,
      map.currentNavigationStepId,
      map.currentPathBranchId,
      state,
    ]
  );

  // Handle going back in navigation history
  const onNavigateBack = useCallback(() => {
    if (state === "loading" || state === "navigating") return;

    if (!map.id || !map.currentNavigationStepId || map.currentStepIndex <= 0) {
      console.warn("Cannot navigate back: no previous step available");
      return;
    }

    sessionHelpers.navigateBack(
      map.currentNavigationStepId,
      map.currentPathBranchId
    );
  }, [
    map.id,
    map.currentNavigationStepId,
    map.currentPathBranchId,
    map.currentStepIndex,
    state,
  ]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state === "loading" || state === "navigating") return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          onNavigate("LEFT");
          break;
        case "ArrowRight":
          e.preventDefault();
          onNavigate("RIGHT");
          break;
        case "ArrowUp":
          e.preventDefault();
          onNavigate("UP");
          break;
        case "Backspace":
        case "ArrowDown":
          e.preventDefault();
          onNavigateBack();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNavigate, onNavigateBack, state]);

  return {
    onNavigate,
    onNavigateBack,
    lastDirection,
    isNavigating: state === "navigating" || state === "loading",
  };
}
