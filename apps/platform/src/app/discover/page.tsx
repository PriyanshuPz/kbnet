"use client";

import React from "react";
import { useSwipeable } from "react-swipeable";
import { motion } from "framer-motion";

const allDirections = ["left", "right", "up", "down"] as Direction[];

type Direction = "left" | "right" | "up" | "down";

export default function DiscoverPage() {
  const [currentPath, setCurrentPath] = React.useState<Direction[]>([]);

  const directionToGoBack = getReverseDirection(
    currentPath[currentPath.length - 1]
  );

  function navigate(toBack: Direction, toNext: Direction) {
    setCurrentPath((prev) => {
      // Go Back
      if (prev.length > 0 && prev[prev.length - 1] === toBack) {
        return prev.slice(0, -1);
      } else {
        // Go Forward
        return [...prev, toNext];
      }
    });
  }

  const handlers = useSwipeable({
    trackTouch: true,
    trackMouse: true,
    onSwipedDown: () => {
      navigate("up", "down");
    },
    onSwipedLeft: () => {
      navigate("right", "left");
    },
    onSwipedRight: () => {
      navigate("left", "right");
    },
    onSwipedUp: () => {
      navigate("down", "up");
    },
  });

  return (
    <div className="w-full h-screen flex flex-col  p-4">
      <div
        {...handlers}
        className="noselect flex-1 flex items-center justify-center rounded-3xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl cursor-grab active:cursor-grabbing transition-all duration-200 p-6"
      >
        <div className="flex flex-col items-center gap-6 text-center">
          <motion.div
            className="text-4xl font-semibold min-h-[50px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={currentPath.join("")}
          >
            {showDirection(currentPath)}
          </motion.div>

          <div className="text-base sm:text-lg text-gray-300">
            You can swipe in these directions to navigate:
          </div>
          <div className="flex gap-4 flex-wrap justify-center">
            {allDirections.map((direction) => (
              <span
                key={direction}
                className="px-3 py-1 bg-white/20 rounded-full text-white text-sm"
              >
                {direction.toUpperCase()}
              </span>
            ))}
          </div>

          <div className="text-base sm:text-lg text-gray-300 mt-4">
            Go back by swiping:
          </div>
          <div className="text-2xl text-blue-400 min-h-[36px]">
            {directionToGoBack ? directionToGoBack.toUpperCase() : "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
}

function getReverseDirection(direction?: Direction): Direction | null {
  if (!direction) return null;
  const reverseMap: Record<Direction, Direction> = {
    up: "down",
    down: "up",
    left: "right",
    right: "left",
  };
  return reverseMap[direction];
}

function showDirection(directions: Direction[]) {
  return directions
    .map((direction) => {
      switch (direction) {
        case "left":
          return "⬅️";
        case "right":
          return "➡️";
        case "up":
          return "⬆️";
        case "down":
          return "⬇️";
        default:
          return "";
      }
    })
    .join("");
}
