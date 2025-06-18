"use client";

import React, { useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { sessionHelpers } from "@/lib/session";
import { useGlobal } from "@/store/global-state";
import { useMapNavigation } from "@/hooks/use-map-navigation";
import { useSwipeGestures } from "@/hooks/use-swipe";
import { Node } from "@kbnet/db";
import { TopicCard } from "./topic-card";
import { NavigationHints } from "./navigation-controls";
import { Gamebar } from "./game-bar";
import { toast } from "sonner";

const slideVariants = {
  enter: (direction: "up" | "down" | "left" | "right") => ({
    x: direction === "left" ? 1000 : direction === "right" ? -1000 : 0,
    y: direction === "up" ? 1000 : direction === "down" ? -1000 : 0,
    opacity: 0,
  }),
  center: {
    x: 0,
    y: 0,
    opacity: 1,
  },
  exit: (direction: "up" | "down" | "left" | "right") => ({
    x: direction === "left" ? -1000 : direction === "right" ? 1000 : 0,
    y: direction === "up" ? -1000 : direction === "down" ? 1000 : 0,
    opacity: 0,
  }),
};

export default function ExplorationView() {
  const params = useParams();
  const id = params.id as string;
  const { error, map, state } = useGlobal();
  const { handleNavigate, handleGoBack, canGoBack, nodes } = useMapNavigation();

  const [isCardExpanded, setIsCardExpanded] = React.useState(false);
  const {
    handlers,
    swipeDirection,
    isAnimating,
    lastSwipeDirection,
    canSwipe,
    cooldownRemaining,
  } = useSwipeGestures({
    onSwipedLeft: () => handleSwipeNavigation(nodes.similar, "LEFT"),
    onSwipedRight: () => handleSwipeNavigation(nodes.related, "RIGHT"),
    onSwipedUp: () => handleSwipeNavigation(nodes.deep, "UP"),
    onSwipedDown: handleGoBack,
    isExpanded: isCardExpanded,
  });
  const handleSwipeNavigation = useCallback(
    (node: Node | null, direction: "UP" | "LEFT" | "RIGHT") => {
      if (!canSwipe()) {
        toast("Please wait before swiping again.");
        return;
      }
      if (!node) {
        toast("Loading next node...");
        return;
      }
      handleNavigate(node, direction);
    },
    [handleNavigate]
  );

  useEffect(() => {
    if (id && id !== map.id) {
      sessionHelpers.resumeMap(id);
    }
  }, [id, map.id]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background overflow-hidden">
      {cooldownRemaining > 0 && (
        <div className="absolute top-4 right-4 z-50">
          <div className="paper-effect px-3 py-1 rounded-lg">
            <span className="text-sm font-medium text-white">
              Cooldown: {`${Math.ceil(cooldownRemaining / 1000)}s`}
            </span>
          </div>
        </div>
      )}
      <Gamebar />
      <div
        {...handlers}
        className="w-full h-full flex items-center justify-center p-4"
      >
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 w-full max-w-md px-4 z-50"
          >
            <div className="paper-effect p-3 rounded-lg flex items-center gap-3">
              <AlertCircle className="text-destructive h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          </motion.div>
        )}

        <div className="noselect w-full max-w-xl relative">
          <AnimatePresence mode="wait" custom={swipeDirection}>
            <motion.div
              key={nodes.current?.id || "main-placeholder"}
              custom={swipeDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="w-full noselect"
            >
              <TopicCard
                key={`${nodes.current?.id}-${nodes.current?.updatedAt}`}
                node={nodes.current}
                isAnimating={isAnimating}
                isExpanded={isCardExpanded}
                onExpandChange={setIsCardExpanded}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Hints */}
        <NavigationHints
          isCardExpanded={isCardExpanded}
          lastSwipeDirection={lastSwipeDirection}
          nodes={{
            similar: nodes.similar,
            deep: nodes.deep,
            related: nodes.related,
          }}
          canGoBack={canGoBack}
        />
      </div>
    </div>
  );
}
