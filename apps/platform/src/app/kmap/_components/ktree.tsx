"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGlobal } from "../../../store/global-state";
import { NodeCard } from "./node-card";
import { useKTreeStore } from "./kTreeStore";
import { getContextualHint, useSwipeGestures } from "@/hooks/use-swipe";
import { ExplorationTimeline } from "./timeline";
import { simpleMLData } from "./_data";

type Directions = "up" | "down" | "left" | "right";

function determineDirections(currentNode: KMapNode) {
  const nodes = [currentNode.connectedNodeA, currentNode.connectedNodeB].filter(
    Boolean
  );

  if (nodes.length === 0) return { leftNode: null, rightNode: null };

  // Example: pick random
  const shuffled = nodes.sort(() => 0.5 - Math.random());
  return {
    leftNode: shuffled[0] || null,
    rightNode: shuffled[1] || null,
  };
}

export default function KLinearTree() {
  const { setState } = useGlobal();

  const [currentNode, setCurrentNode] = useState<KMapNode>(simpleMLData);

  const containerRef = useRef<HTMLDivElement>(null);

  const [backDirection, setBackDirection] = useState<Directions>("up");
  const [directions, setDirections] = useState<{
    leftNode: KMapNode | null;
    rightNode: KMapNode | null;
  }>({
    leftNode: null,
    rightNode: null,
  });

  type Stack = {
    node: KMapNode;
    swiped: "up" | "down" | "left" | "right";
    swipeToGoBack: "up" | "down" | "left" | "right";
  };
  const [stack, setStack] = useState<Stack[]>([]);

  const navigateUp = (node: KMapNode) => {
    setBackDirection("up");
    stack.push({
      node: node,
      swiped: "up",
      swipeToGoBack: "down",
    });
    setCurrentNode(node);
    setStack([...stack]);
  };

  const navigateLeft = (node: KMapNode) => {
    setBackDirection("left");
    stack.push({
      node,
      swiped: "left",
      swipeToGoBack: "right",
    });
    setCurrentNode(node);
    setStack([...stack]);
  };

  const navigateRight = (node: KMapNode) => {
    setBackDirection("right");
    stack.push({
      node,
      swiped: "right",
      swipeToGoBack: "left",
    });
    setCurrentNode(node);
    setStack([...stack]);
  };
  const navigateBack = () => {
    setBackDirection("up");
    stack.length > 0 && setStack((prev) => prev.slice(0, -1));
    setCurrentNode(
      stack.length > 0 ? stack[stack.length - 1].node : simpleMLData
    );
  };

  const {
    handleTouchStart,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isAnimating,
    isDragging,
    swipeDirection,
  } = useSwipeGestures({
    threshold: 10,
    onSwipeUp: () => {
      if (currentNode.deepNode) {
        navigateUp(currentNode.deepNode);
        setStack((prev) => [
          ...prev,
          { node: currentNode.deepNode!, swiped: "up", swipeToGoBack: "down" },
        ]);
        setCurrentNode(currentNode.deepNode!);
      }
    },
    onSwipeDown: () => {
      const lastNode = stack[stack.length - 1];
      if (lastNode && lastNode.swipeToGoBack === "down") {
        navigateBack();
        setStack((prev) => prev.slice(0, -1));
      }
    },
    onSwipeLeft: () => {
      const lastNode = stack[stack.length - 1];
      if (lastNode && lastNode.swipeToGoBack === "left") {
        navigateBack();
        setStack((prev) => prev.slice(0, -1));
      } else {
        // If not going back, go to left node
        if (directions.leftNode) {
          navigateLeft(directions.leftNode);
          setStack((prev) => [
            ...prev,
            { node: currentNode, swiped: "left", swipeToGoBack: "right" },
          ]);
        }
      }
    },
    onSwipeRight: () => {
      const lastNode = stack[stack.length - 1];
      if (lastNode && lastNode.swipeToGoBack === "right") {
        navigateBack();
        setStack((prev) => prev.slice(0, -1));
      } else {
        // If not going back, go to right node
        if (directions.rightNode) {
          navigateRight(directions.rightNode);
          setStack((prev) => [
            ...prev,
            { node: currentNode, swiped: "right", swipeToGoBack: "left" },
          ]);
        }
      }
    },
  });

  useEffect(() => {
    setDirections(determineDirections(currentNode));
  }, [currentNode]);

  useEffect(() => {
    // Update global state when navigating
    setState("idle");

    // Ensure text is not selectable during animations
    if (isAnimating || isDragging) {
      document.body.classList.add("select-none");
    } else {
      document.body.classList.remove("select-none");
    }

    return () => {
      document.body.classList.remove("select-none");
    };
  }, [currentNode, setState, isAnimating, isDragging]);

  // Get animation variants based on swipe direction
  const getAnimationVariants = () => {
    // Default variants if no direction specified
    if (!swipeDirection) {
      return {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 },
      };
    }

    // Direction-specific animations
    switch (swipeDirection) {
      case "up":
        return {
          initial: { opacity: 0, y: "100%" },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: "-100%" },
        };
      case "down":
        return {
          initial: { opacity: 0, y: "-100%" },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: "100%" },
        };
      case "left":
        return {
          initial: { opacity: 0, x: "100%" },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: "-100%" },
        };
      case "right":
        return {
          initial: { opacity: 0, x: "-100%" },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: "100%" },
        };
      default:
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.8 },
        };
    }
  };

  const contextHint = getContextualHint(currentNode, stack.length > 1);
  const variants = getAnimationVariants();

  return (
    <div className="fixed inset-0 bg-black h-screen w-screen overflow-hidden">
      <ExplorationTimeline stack={stack} />

      <div
        ref={containerRef}
        className="h-full w-full select-none cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentNode.id}
            className="h-full w-full absolute inset-0"
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
              node={stack[stack.length - 1]?.node || currentNode}
              hint={contextHint || ""}
              directToGoBack={backDirection}
              active={true}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Optional: Debug panel for stack - remove in production */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute bottom-4 right-4 z-50 bg-black/70 backdrop-blur-sm rounded-lg p-2 text-white text-xs max-w-[200px] max-h-[100px] overflow-auto">
          <p>Stack ({stack.length}):</p>
          {stack.slice(-3).map((item, i) => (
            <div key={i} className="mt-1">
              [{item.swiped} ➡️ {item.swipeToGoBack}]
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
