"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sessionHelpers } from "@/lib/session";
import { useGlobal } from "@/store/global-state";
import { getAnimationVariants } from "@/lib/utils";
import { useNavigation } from "@/hooks/use-navigation";
import { ErrorView, LoadingView } from "../_components/view-states";
import MiniMap from "../_components/mini-map";
import NodeCard from "../_components/node-card";
import { ViewportNodes } from "../_components/viewport-nodes";
import { NavigationHints } from "../_components/navigation-hints";

export default function ExplorationView({ id }: { id: string }) {
  const { sessionId, currentNode, viewportNodes, state, error } = useGlobal();

  const { onNavigate, getAvailableDirections, handlers, swipeDirection } =
    useNavigation();

  useEffect(() => {
    if (id && id !== sessionId) {
      sessionHelpers.resumeSession(id);
    }
  }, [id, sessionId]);

  const directions = getAvailableDirections();
  const variants = getAnimationVariants(swipeDirection);

  return (
    <div className="flex-1 relative overflow-hidden w-full h-full">
      <MiniMap />
      <div
        {...handlers}
        className="noselect w-full h-full relative flex flex-col max-w-md mx-auto overflow-hidden"
      >
        {!currentNode ? (
          <LoadingView />
        ) : error ? (
          <ErrorView error={error} />
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentNode.id}
                className="noselect h-full w-full absolute inset-0"
                initial={variants.initial}
                animate={variants.animate}
                exit={variants.exit}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 1,
                }}
              >
                <NodeCard
                  relationshipType={currentNode.relationshipType}
                  node={currentNode}
                  variant="focus"
                  className="max-w-md"
                />
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
      {viewportNodes && (
        <ViewportNodes
          viewportNodes={viewportNodes}
          directions={directions}
          onNavigate={onNavigate}
        />
      )}
      <NavigationHints
        backDirection={directions.backDirection}
        currentDepth={currentNode?.depth || 0}
      />
    </div>
  );
}
