"use client";

import React, { useCallback, useEffect } from "react";
import { sessionHelpers } from "@/lib/session";
import { useGlobal } from "@/store/global-state";

import { Node } from "@kbnet/db";
import { AlertCircle, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function ExplorationView({ id }: { id: string }) {
  const {
    connectionStatus,
    currentNode,
    deepNode,
    error,
    map,
    relatedNode,
    similarNode,
    state,
    ...global
  } = useGlobal();

  // Animation for the main card
  useEffect(() => {
    if (id && id !== map.id) {
      sessionHelpers.resumeMap(id);
    }
  }, [id, map.id]);

  const isLoading = state === "loading" || state === "navigating";

  // Handle navigation to a new node
  const handleNavigate = useCallback(
    (targetNode: Node | null, direction: "LEFT" | "RIGHT" | "UP") => {
      if (isLoading || !map.id || !map.currentNavigationStepId || !targetNode) {
        return;
      }

      sessionHelpers.navigate(
        targetNode.id,
        direction,
        map.currentNavigationStepId,
        map.currentPathBranchId
      );
    },
    [isLoading, map.id, map.currentNavigationStepId, map.currentPathBranchId]
  );

  // Handle go back action
  const handleGoBack = useCallback(() => {
    if (
      isLoading ||
      !map.id ||
      !map.currentNavigationStepId ||
      map.currentStepIndex <= 0
    ) {
      return;
    }

    sessionHelpers.navigateBack(
      map.currentNavigationStepId,
      map.currentPathBranchId
    );
  }, [
    isLoading,
    map.id,
    map.currentNavigationStepId,
    map.currentPathBranchId,
    map.currentStepIndex,
  ]);

  // Show loading state if we're still waiting for the initial data
  if (!currentNode && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <h2 className="text-xl font-medium">Loading your knowledge map...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans flex flex-col items-center p-4">
      <h1 className="text-2xl md:text-3xl font-bold text-primary mb-6 mt-4">
        Knowledge Explorer
      </h1>

      {/* Error notification */}
      {error && (
        <div className="w-full max-w-md mb-6 p-3 bg-destructive/10 border border-destructive rounded-lg flex items-center gap-3">
          <AlertCircle className="text-destructive h-5 w-5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Loading indicator during navigation */}
      {isLoading && currentNode && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center gap-3 p-6 bg-card rounded-lg shadow-lg">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground">Exploring connections...</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Similar Node (Left) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={similarNode?.id || "similar-placeholder"}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="md:col-span-1"
          >
            <TopicCard
              node={similarNode}
              type="SIMILAR"
              onClick={() => handleNavigate(similarNode, "LEFT")}
              disabled={isLoading}
            />
          </motion.div>
        </AnimatePresence>

        {/* Main Node (Center) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentNode?.id || "main-placeholder"}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="md:col-span-1"
          >
            <TopicCard
              node={currentNode}
              type="MAIN"
              isMain={true}
              onClick={() => {}}
              disabled={isLoading}
            />
          </motion.div>
        </AnimatePresence>

        {/* Related Node (Right) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={relatedNode?.id || "related-placeholder"}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="md:col-span-1"
          >
            <TopicCard
              node={relatedNode}
              type="RELATED"
              onClick={() => handleNavigate(relatedNode, "RIGHT")}
              disabled={isLoading}
            />
          </motion.div>
        </AnimatePresence>

        {/* Deep Node (Bottom) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={deepNode?.id || "deep-placeholder"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="md:col-start-2 md:col-span-1"
          >
            <TopicCard
              node={deepNode}
              type="DEEP"
              onClick={() => handleNavigate(deepNode, "UP")}
              disabled={isLoading}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="mt-6 mb-8">
        <button
          onClick={handleGoBack}
          disabled={isLoading || map.currentStepIndex <= 0}
          className="px-5 py-2 bg-secondary text-secondary-foreground font-medium rounded-lg shadow hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-secondary/50 disabled:opacity-50 transition-colors duration-200"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
          ) : null}
          Go Back
        </button>
      </div>

      {/* Debug Info (can be removed in production) */}
      <div className="mt-4 text-xs text-muted-foreground bg-muted p-3 rounded-md max-w-md absolute top-1 -right-32 transform -translate-x-1/2">
        <h3 className="font-semibold mb-1">Map Debug Info:</h3>
        <p>Map ID: {map.id || "None"}</p>
        <p>Current Step: {map.currentNavigationStepId || "None"}</p>
        <p>Branch: {map.currentPathBranchId || "None"}</p>
        <p>Step Index: {map.currentStepIndex}</p>
        <p>State: {state}</p>
      </div>
    </div>
  );
}

// Improved TopicCard component
const TopicCard = ({
  node,
  type,
  onClick,
  isMain = false,
  disabled = false,
}: {
  node: Node | null;
  type: "SIMILAR" | "RELATED" | "DEEP" | "MAIN";
  onClick: () => void;
  isMain?: boolean;
  disabled?: boolean;
}) => {
  // Determine card styling based on type
  const cardStyles = {
    MAIN: "bg-primary border-primary-foreground text-primary-foreground",
    SIMILAR:
      "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200",
    RELATED:
      "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-900 dark:text-green-200",
    DEEP: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200",
  };

  const titleByType = {
    MAIN: "Current Topic",
    SIMILAR: "Similar Topic",
    RELATED: "Related Topic",
    DEEP: "Deeper Dive",
  };

  return (
    <div
      className={`p-4 rounded-lg shadow-md border-2 ${cardStyles[type]}
                  ${!isMain && !disabled ? "cursor-pointer hover:shadow-lg transform hover:scale-[1.02] transition-all" : ""}
                  ${disabled ? "opacity-70 cursor-not-allowed" : ""}
                  h-full flex flex-col`}
      onClick={!disabled && !isMain ? onClick : undefined}
    >
      <div className="text-xs font-medium mb-2 opacity-80">
        {titleByType[type]}
      </div>
      <h3 className="text-lg font-semibold mb-2 line-clamp-2">
        {node?.title || `No ${type.toLowerCase()} topic available`}
      </h3>
      <p className="text-sm flex-grow line-clamp-4 opacity-90">
        {node?.summary || "Content will appear here when available."}
      </p>

      {!isMain && !disabled && (
        <div className="mt-3 text-xs font-medium">Click to navigate</div>
      )}
    </div>
  );
};
