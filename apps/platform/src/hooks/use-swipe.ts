import { useState } from "react";

interface SwipeGestureProps {
  threshold: number;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

export const useSwipeGestures = ({
  threshold = 50,
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
}: SwipeGestureProps) => {
  const [startY, setStartY] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
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

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return;
    setStartY(e.touches[0].clientY);
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  // Handle touch end
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isAnimating || !isDragging) {
      setIsDragging(false);
      return;
    }

    const deltaY = startY - e.changedTouches[0].clientY;
    const deltaX = startX - e.changedTouches[0].clientX;
    const touchThreshold = threshold * 2; // Higher threshold for touch

    // Determine swipe direction based on greater delta
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      // Vertical swipe
      if (deltaY > touchThreshold) {
        // Swipe up
        animateTransition(onSwipeUp, "up");
      } else if (deltaY < -touchThreshold) {
        // Swipe down
        animateTransition(onSwipeDown, "down");
      }
    } else {
      // Horizontal swipe
      if (deltaX > touchThreshold) {
        // Swipe left
        animateTransition(onSwipeLeft, "left");
      } else if (deltaX < -touchThreshold) {
        // Swipe right
        animateTransition(onSwipeRight, "right");
      }
    }

    setIsDragging(false);
  };

  // Mouse events for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || isAnimating) return; // Only handle left mouse button
    setStartY(e.clientY);
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      // Prevent text selection during drag
      e.preventDefault();
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || isAnimating) {
      setIsDragging(false);
      return;
    }

    const deltaY = startY - e.clientY;
    const deltaX = startX - e.clientX;

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      if (deltaY > threshold) {
        animateTransition(onSwipeUp, "up");
      } else if (deltaY < -threshold) {
        animateTransition(onSwipeDown, "down");
      }
    } else {
      if (deltaX > threshold) {
        animateTransition(onSwipeLeft, "left");
      } else if (deltaX < -threshold) {
        animateTransition(onSwipeRight, "right");
      }
    }

    setIsDragging(false);
  };

  return {
    handleTouchStart,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isAnimating,
    isDragging,
    swipeDirection,
  };
};

export const getContextualHint = (
  node: KMapNode,
  hasHistory: boolean
): string | null => {
  if (node.deepNode) {
    return `⬆️ Swipe UP to explore ${node.deepNode.label}`;
  }
  if (node.connectedNodeA) {
    return `➡️ Swipe RIGHT to discover ${node.connectedNodeA.label}`;
  }
  if (node.connectedNodeB) {
    return `⬅️ Swipe LEFT for alternative: ${node.connectedNodeB.label}`;
  }
  return hasHistory ? "⬇️ Swipe DOWN to go back" : null;
};
