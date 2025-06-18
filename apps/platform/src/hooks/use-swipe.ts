import { useState, useCallback, useEffect } from "react";
import { useSwipeable } from "react-swipeable";

interface SwipeGestureProps {
  threshold?: number;
  onSwipedDown: () => void;
  onSwipedLeft: () => void;
  onSwipedRight: () => void;
  onSwipedUp: () => void;
  isExpanded?: boolean;
}

export const useSwipeGestures = ({
  onSwipedDown,
  onSwipedLeft,
  onSwipedRight,
  onSwipedUp,
  isExpanded = false,
}: SwipeGestureProps) => {
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [lastSwipeDirection, setLastSwipeDirection] = useState<string | null>(
    null
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastSwipeTime, setLastSwipeTime] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const SWIPE_COOLDOWN = 5000; // 5 seconds cooldown
  const canSwipe = useCallback(() => {
    const now = Date.now();
    return now - lastSwipeTime >= SWIPE_COOLDOWN;
  }, [lastSwipeTime]);

  // Add cooldown timer effect
  useEffect(() => {
    if (!lastSwipeTime) return;

    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        SWIPE_COOLDOWN - (Date.now() - lastSwipeTime)
      );
      setCooldownRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [lastSwipeTime]);

  const handleSwipe = useCallback(
    (dir: string, callback: () => void) => {
      if (!canSwipe()) {
        console.warn("Swipe cooldown active, ignoring swipe");
        return;
      }
      const now = Date.now();
      const MAX_SWIPE_DURATION = 500; // Maximum time in milliseconds for a swipe
      if (isExpanded) {
        // When expanded, require double swipe within 300ms
        if (
          lastSwipeDirection === dir &&
          now - lastSwipeTime < MAX_SWIPE_DURATION
        ) {
          callback();
          setLastSwipeTime(0);
          setLastSwipeDirection(null);
        } else {
          setLastSwipeTime(now);
          setLastSwipeDirection(dir);
        }
      } else {
        // When not expanded, single swipe is enough
        callback();
      }
    },
    [isExpanded, lastSwipeTime, lastSwipeDirection, canSwipe]
  );

  const handlers = useSwipeable({
    trackTouch: true,
    trackMouse: true,
    preventScrollOnSwipe: !isExpanded, // Allow scrolling when expanded
    delta: 10, // Minimum distance in pixels before a swipe starts
    swipeDuration: 500, // Maximum time in milliseconds for a swipe
    onSwiping: (eventData) => {
      if (isAnimating) return;
      setSwipeDirection(eventData.dir.toLowerCase() as any);
    },
    onSwiped: (eventData) => {
      if (isAnimating) return;

      switch (eventData.dir) {
        case "Up":
          handleSwipe("Up", onSwipedUp);
          break;
        case "Down":
          handleSwipe("Down", onSwipedDown);
          break;
        case "Left":
          handleSwipe("Left", onSwipedLeft);
          break;
        case "Right":
          handleSwipe("Right", onSwipedRight);
          break;
      }
    },
  });

  return {
    handlers,
    swipeDirection,
    isAnimating,
    lastSwipeDirection,
    canSwipe,
    cooldownRemaining,
  };
};
