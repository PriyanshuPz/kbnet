import { useEffect } from "react";
import { sessionHelpers } from "@/lib/session";
import { useGlobal } from "@/store/global-state";
import { useSwipeGestures } from "@/hooks/use-swipe";

export function useNavigation() {
  const { navigationHistory, currentNode } = useGlobal();

  const onNavigate = (direction: "up" | "down" | "left" | "right") => {
    sessionHelpers.navigate(direction);
  };

  const getBackDirection = (): "down" | "left" | "right" | "up" | null => {
    if (!navigationHistory || navigationHistory.length === 0) {
      return null;
    }

    const lastMove = navigationHistory[navigationHistory.length - 1];

    switch (lastMove.direction) {
      case "UP":
        return "down";
      case "LEFT":
        return "left";
      case "RIGHT":
        return "right";
      case "DOWN":
        return "up";
      default:
        return "down";
    }
  };

  const getAvailableDirections = () => {
    const backDirection = getBackDirection();
    const currentDepth = currentNode?.depth || 0;

    return {
      up: true,
      down: backDirection === "down" || currentDepth > 0,
      left: true,
      right: true,
      backDirection,
    };
  };

  const { handlers, swipeDirection } = useSwipeGestures({
    onSwipedDown: () => onNavigate("down"),
    onSwipedLeft: () => onNavigate("left"),
    onSwipedRight: () => onNavigate("right"),
    onSwipedUp: () => onNavigate("up"),
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const directions = getAvailableDirections();

      switch (e.key) {
        case "ArrowDown":
        case "s":
          e.preventDefault();
          onNavigate("up");
          break;
        case "ArrowUp":
        case "w":
          e.preventDefault();
          onNavigate("down");
          break;
        case "ArrowRight":
        case "d":
          e.preventDefault();
          onNavigate("right");
          break;
        case "ArrowLeft":
        case "a":
          e.preventDefault();
          onNavigate("left");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return {
    onNavigate,
    getAvailableDirections,
    handlers,
    swipeDirection,
  };
}
