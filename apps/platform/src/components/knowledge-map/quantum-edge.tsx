import React from "react";
import { EdgeProps, getBezierPath } from "reactflow";
import { motion } from "framer-motion";

export function QuantumEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
  label,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />

      {/* Animated particle effect */}
      <svg>
        <defs>
          <motion.linearGradient
            id={`particle-gradient-${id}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
            animate={{
              x1: ["0%", "100%"],
              x2: ["0%", "100%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0)" />
            <stop offset="50%" stopColor="rgba(139, 92, 246, 0.8)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
          </motion.linearGradient>
        </defs>
      </svg>

      <path
        d={edgePath}
        strokeWidth={4}
        stroke={`url(#particle-gradient-${id})`}
        fill="none"
        strokeLinecap="round"
        strokeDasharray="1 30"
        className="react-flow__edge-path"
        style={{ pointerEvents: "none" }}
      />

      {label && (
        <foreignObject
          width={80}
          height={30}
          x={labelX - 40}
          y={labelY - 15}
          className="overflow-visible"
          style={{ pointerEvents: "none" }}
        >
          <div className="flex items-center justify-center">
            <div className="px-2 py-1 text-xs bg-card/80 backdrop-blur-sm border border-border shadow-sm text-muted-foreground rounded-md whitespace-nowrap">
              {label}
            </div>
          </div>
        </foreignObject>
      )}
    </>
  );
}
