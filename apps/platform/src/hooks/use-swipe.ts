import { useGlobal } from "@/store/global-state";
import { useState, useCallback, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import { toast } from "sonner";

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
  const { similarNode, relatedNode, deepNode } = useGlobal();
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const [lastSwipeDirection, setLastSwipeDirection] = useState<string | null>(
    null
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastSwipeTime, setLastSwipeTime] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const SWIPE_COOLDOWN = 5000;

  // Simple function to check cooldown
  const canSwipe = () => {
    return Date.now() - lastSwipeTime >= SWIPE_COOLDOWN;
  };

  // Cooldown timer effect
  useEffect(() => {
    if (!lastSwipeTime) return;

    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        SWIPE_COOLDOWN - (Date.now() - lastSwipeTime)
      );
      setCooldownRemaining(remaining);

      if (remaining === 0) clearInterval(interval);
    }, 100);

    return () => clearInterval(interval);
  }, [lastSwipeTime]);

  const handleSwipe = (dir: string, callback: () => void) => {
    if (!canSwipe()) {
      toast("Relax a bit, please wait before swiping again.", {
        position: "bottom-center",
      });
      return;
    }

    const WAIT_MESSAGE = "Chill, You read too fast, please wait a bit...";

    // Check node generation state directly from current values
    if (dir === "Left" && !similarNode?.generated) {
      toast(WAIT_MESSAGE, {
        position: "bottom-center",
      });
      return;
    }
    if (dir === "Right" && !relatedNode?.generated) {
      toast(WAIT_MESSAGE, {
        position: "bottom-center",
      });
      return;
    }
    if (dir === "Up" && !deepNode?.generated) {
      toast(WAIT_MESSAGE, {
        position: "bottom-center",
      });
      return;
    }

    const now = Date.now();
    if (isExpanded) {
      // Double swipe check for expanded mode
      if (lastSwipeDirection === dir && now - lastSwipeTime < 500) {
        callback();
        setLastSwipeTime(0);
        setLastSwipeDirection(null);
      } else {
        setLastSwipeTime(now);
        setLastSwipeDirection(dir);
      }
    } else {
      // Single swipe for non-expanded mode
      setLastSwipeTime(now);
      callback();
    }
  };

  const handlers = useSwipeable({
    trackTouch: true,
    trackMouse: true,
    preventScrollOnSwipe: !isExpanded,
    delta: 10,
    swipeDuration: 500,
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
