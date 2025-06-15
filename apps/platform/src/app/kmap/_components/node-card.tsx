import React from "react";
import { ArrowUp, ArrowLeft, ArrowRight, ArrowDown } from "lucide-react";

interface NodeCardProps {
  node: KMapNode;
  hint?: string;
  active: boolean;
  directToGoBack: "up" | "down" | "left" | "right";
}

export const NodeCard: React.FC<NodeCardProps> = ({
  node,
  hint,
  active,
  directToGoBack,
}) => {
  console.log("Direct to go back:", directToGoBack);
  // Define colors based on node depth
  const depthColors = [
    "bg-gradient-to-br from-blue-500 to-purple-600",
    "bg-gradient-to-br from-purple-500 to-pink-600",
    "bg-gradient-to-br from-indigo-500 to-blue-600",
    "bg-gradient-to-br from-green-500 to-teal-600",
    "bg-gradient-to-br from-amber-500 to-orange-600",
  ];

  const bgColor = depthColors[node.depth % depthColors.length];

  return (
    <div
      className={`w-full h-full ${active ? "z-10" : "z-0"} absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0"} select-none`}
    >
      <div
        className={`h-full w-full ${bgColor} flex flex-col items-center justify-center p-8 relative`}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30"></div>

        <div className="relative z-10 text-white flex flex-col items-center justify-center max-w-xl w-full">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs mb-3">
            Depth: {node.depth}
          </span>

          <h2 className="text-3xl font-bold mb-6 text-center">{node.label}</h2>

          <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 w-full">
            <p className="text-white text-lg leading-relaxed">{node.content}</p>
            <div className="mt-3 text-xs text-white/70">
              Source: {node.source}
            </div>
          </div>

          {hint && (
            <div className="mt-8 bg-white/20 backdrop-blur-sm rounded-lg py-3 px-5 max-w-md text-center">
              {hint}
            </div>
          )}
        </div>

        {/* Swipe indicators that consider schema relationships */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {/* {node.deepNode && (
            <div className="absolute top-4 left-4">
              <ArrowUp className="text-white/70 w-8 h-8" />
            </div>
          )}
          {node.connectedNodeA && (
            <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
              <ArrowLeft className="text-white/70 w-8 h-8" />
            </div>
          )}
          {node.connectedNodeB && (
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
              <ArrowRight className="text-white/70 w-8 h-8" />
            </div>
          )} */}
          {directToGoBack && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              {directToGoBack === "up" && (
                <ArrowUp className="text-white/70 w-8 h-8" />
              )}
              {directToGoBack === "down" && (
                <ArrowDown className="text-white/70 w-8 h-8" />
              )}
              {directToGoBack === "left" && (
                <ArrowLeft className="text-white/70 w-8 h-8" />
              )}
              {directToGoBack === "right" && (
                <ArrowRight className="text-white/70 w-8 h-8" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
