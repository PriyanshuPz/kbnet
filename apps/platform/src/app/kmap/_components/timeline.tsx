import React from "react";

type Stack = {
  node: KMapNode;
  swiped: "up" | "down" | "left" | "right";
  swipeToGoBack: "up" | "down" | "left" | "right";
};
interface ExplorationTimelineProps {
  // path: KMapNode[];
  // currentIndex: number;
  stack: Stack[];
}

export const ExplorationTimeline: React.FC<ExplorationTimelineProps> = ({
  stack,
  // path,
  // currentIndex,
}) => {
  return (
    <div className="absolute top-4 left-0 right-0 z-50 flex justify-center">
      <div className="flex items-center gap-2">
        {stack.map((item, index) => (
          <div key={index} className={`flex items-center gap-1`}>
            <span className="text-xs">
              {item.swiped == "up"
                ? "↑"
                : item.swiped == "down"
                  ? "↓"
                  : item.swiped == "left"
                    ? "←"
                    : item.swiped == "right"
                      ? "→"
                      : ""}
            </span>
            <span
              className={`h-1 w-1 rounded-full transition-all duration-300`}
            ></span>
          </div>
        ))}
      </div>
      {/* <div className="flex gap-1">
        {path.map((_, i) => (
          <div
            key={i}
            className={`h-1 w-6 rounded-full transition-all duration-300 ${i === currentIndex ? "bg-white scale-y-150" : "bg-white/40"}`}
          ></div>
        ))}
      </div> */}
    </div>
  );
};
