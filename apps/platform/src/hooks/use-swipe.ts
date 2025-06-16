import { useState } from "react";
import { useSwipeable } from "react-swipeable";

interface SwipeGestureProps {
  threshold?: number;
  onSwipedDown: () => void;
  onSwipedLeft: () => void;
  onSwipedRight: () => void;
  onSwipedUp: () => void;
}

export const useSwipeGestures = ({
  onSwipedDown,
  onSwipedLeft,
  onSwipedRight,
  onSwipedUp,
}: SwipeGestureProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<
    "up" | "down" | "left" | "right" | null
  >(null);

  // Animation helper - now works better with Framer Motion
  const animateTransition = (
    callback: () => void,
    direction: "up" | "down" | "left" | "right"
  ) => {
    // Set the direction first so Framer Motion can use it for exit animation
    setSwipeDirection(direction);
    setIsAnimating(true);

    // Allow time for exit animation
    setTimeout(() => {
      // Execute navigation callback
      callback();

      // After a brief delay, clear animation state
      setTimeout(() => {
        setIsAnimating(false);
        // Don't clear swipeDirection immediately to let the entry animation complete
        // It will be reset on the next swipe
      }, 600);
    }, 100);
  };
  const handlers = useSwipeable({
    trackTouch: true,
    trackMouse: true,
    // onSwipedDown,
    // onSwipedLeft,
    // onSwipedRight,
    // onSwipedUp,
    onSwiping: (eventData) => {
      if (isAnimating) return;
      const { dir } = eventData;
      switch (dir) {
        case "Up":
          setSwipeDirection("up");
          break;
        case "Down":
          setSwipeDirection("down");
          break;
        case "Left":
          setSwipeDirection("left");
          break;
        case "Right":
          setSwipeDirection("right");
          break;
        default:
          setSwipeDirection(null);
          break;
      }
    },
    onSwiped: (eventData) => {
      if (isAnimating) return;

      const { dir } = eventData;
      switch (dir) {
        case "Up":
          animateTransition(onSwipedUp, "up");
          break;
        case "Down":
          animateTransition(onSwipedDown, "down");
          break;
        case "Left":
          animateTransition(onSwipedLeft, "left");
          break;
        case "Right":
          animateTransition(onSwipedRight, "right");
          break;
        default:
          break;
      }
    },
    preventScrollOnSwipe: true,
  });

  return {
    isAnimating,
    swipeDirection,
    handlers,
  };
};
