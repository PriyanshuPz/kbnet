"use client";

import React, { useEffect, useState } from "react";
import { useGlobal } from "@/store/global-state";

export default function MiniMap() {
  const { miniMapData, requestMiniMap, sessionId } = useGlobal();
  const [collapsed, setCollapsed] = useState(true);

  // Request mini map data on mount and periodically
  useEffect(() => {
    if (sessionId && miniMapData === null) {
      requestMiniMap();
    }
  }, [sessionId]);

  if (!miniMapData) {
    return (
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-4 shadow-lg">
          <div className="text-sm text-muted-foreground">Loading map...</div>
        </div>
      </div>
    );
  }

  const { nodes, connections, navigationPath, bounds } = miniMapData;

  // Calculate grid size
  const gridWidth = bounds.maxX - bounds.minX + 3; // +3 for padding
  const gridHeight = bounds.maxDepth - bounds.minDepth + 3;
  const cellSize = 20;
  const svgWidth = Math.max(gridWidth * cellSize, 200);
  const svgHeight = Math.max(gridHeight * cellSize, 120);

  // Convert coordinates to SVG positions
  const getNodePosition = (node: any) => ({
    x: (node.x - bounds.minX + 1) * cellSize + cellSize / 2,
    y: (node.depth - bounds.minDepth + 1) * cellSize + cellSize / 2,
  });

  return (
    <div className="absolute top-4 right-4 z-20">
      {collapsed ? (
        <button
          onClick={() => setCollapsed(false)}
          className="bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg"
          title="Expand Mini Map"
        >
          <span className="text-xs text-muted-foreground">🗺️</span>
        </button>
      ) : (
        <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-4 shadow-lg max-w-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Knowledge Plane</h3>
            <div>
              <button
                onClick={requestMiniMap}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                🔄
              </button>
              <button
                onClick={() => setCollapsed(true)}
                className="text-xs text-muted-foreground hover:text-foreground"
                title="Collapse Mini Map"
              >
                🗕
              </button>
            </div>
          </div>

          {/* Grid Visualization */}
          <div className="border rounded bg-background/50 p-2">
            <svg
              width={svgWidth}
              height={svgHeight}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="overflow-visible"
            >
              {/* Grid background */}
              <defs>
                <pattern
                  id="minimap-grid"
                  width={cellSize}
                  height={cellSize}
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    opacity="0.2"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#minimap-grid)" />

              {/* Axis labels */}
              {/* X-axis labels */}
              {Array.from({ length: gridWidth - 2 }, (_, i) => (
                <text
                  key={`x-label-${i}`}
                  x={(i + 1) * cellSize + cellSize / 2}
                  y={15}
                  fontSize="10"
                  fill="currentColor"
                  textAnchor="middle"
                  className="text-muted-foreground"
                >
                  {bounds.minX + i}
                </text>
              ))}

              {/* Depth labels */}
              {Array.from({ length: gridHeight - 2 }, (_, i) => (
                <text
                  key={`depth-label-${i}`}
                  x={10}
                  y={(i + 1) * cellSize + cellSize / 2 + 3}
                  fontSize="10"
                  fill="currentColor"
                  textAnchor="middle"
                  className="text-muted-foreground"
                >
                  {bounds.minDepth + i}
                </text>
              ))}

              {/* Connection lines */}
              {connections.map((conn, index) => {
                const fromNode = nodes.find((n) => n.id === conn.fromNodeId);
                const toNode = nodes.find((n) => n.id === conn.toNodeId);

                if (!fromNode || !toNode) return null;

                const fromPos = getNodePosition(fromNode);
                const toPos = getNodePosition(toNode);

                return (
                  <line
                    key={`connection-${index}`}
                    x1={fromPos.x}
                    y1={fromPos.y}
                    x2={toPos.x}
                    y2={toPos.y}
                    stroke={getConnectionColor(conn.type)}
                    strokeWidth="1.5"
                    opacity="0.6"
                    strokeDasharray={conn.type === "RELATED" ? "3,3" : "none"}
                  />
                );
              })}

              {/* Navigation path */}
              {navigationPath.map((step, index) => {
                const fromPos = {
                  x: (step.fromX - bounds.minX + 1) * cellSize + cellSize / 2,
                  y:
                    (step.fromDepth - bounds.minDepth + 1) * cellSize +
                    cellSize / 2,
                };
                const toPos = {
                  x: (step.toX - bounds.minX + 1) * cellSize + cellSize / 2,
                  y:
                    (step.toDepth - bounds.minDepth + 1) * cellSize +
                    cellSize / 2,
                };

                return (
                  <line
                    key={`nav-path-${index}`}
                    x1={fromPos.x}
                    y1={fromPos.y}
                    x2={toPos.x}
                    y2={toPos.y}
                    stroke="rgb(239, 68, 68)"
                    strokeWidth="2"
                    opacity="0.8"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}

              {/* Arrow marker for navigation path */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="rgb(239, 68, 68)" />
                </marker>
              </defs>

              {/* Nodes */}
              {nodes.map((node) => {
                const pos = getNodePosition(node);
                const nodeStyle = getNodeStyle(node);

                return (
                  <g key={node.id}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={nodeStyle.radius}
                      fill={nodeStyle.color}
                      stroke={nodeStyle.stroke}
                      strokeWidth={nodeStyle.strokeWidth}
                      opacity={node.generated ? 1 : 0.5}
                    />

                    {/* Current node indicator */}
                    {node.isCurrent && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={nodeStyle.radius + 4}
                        fill="none"
                        stroke="rgb(239, 68, 68)"
                        strokeWidth="2"
                        opacity="0.7"
                      >
                        <animate
                          attributeName="r"
                          values={`${nodeStyle.radius + 2};${nodeStyle.radius + 6};${nodeStyle.radius + 2}`}
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}

                    {/* Node type indicator */}
                    {!node.generated && (
                      <text
                        x={pos.x}
                        y={pos.y - nodeStyle.radius - 8}
                        fontSize="8"
                        fill="currentColor"
                        textAnchor="middle"
                        className="text-muted-foreground"
                      >
                        ?
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Stats and Legend */}
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <span>Total Nodes:</span>
              <span className="font-mono">{nodes.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Generated:</span>
              <span className="font-mono">
                {nodes.filter((n) => n.generated).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Connections:</span>
              <span className="font-mono">{connections.length}</span>
            </div>

            {/* Legend */}
            <div className="pt-2 border-t space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Root</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Generated</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 opacity-50"></div>
                <span>Placeholder</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getNodeStyle(node: any) {
  if (node.depth === 0 && node.x === 0 && node.y === 0) {
    // Root node
    return {
      color: "rgb(34, 197, 94)",
      stroke: "white",
      strokeWidth: 2,
      radius: 6,
    };
  }

  if (node.isCurrent) {
    // Current node
    return {
      color: "rgb(239, 68, 68)",
      stroke: "white",
      strokeWidth: 2,
      radius: 7,
    };
  }

  if (node.generated) {
    // Generated node
    return {
      color: "rgb(59, 130, 246)",
      stroke: "white",
      strokeWidth: 1,
      radius: 5,
    };
  }

  // Placeholder node
  return {
    color: "rgb(156, 163, 175)",
    stroke: "white",
    strokeWidth: 1,
    radius: 4,
  };
}

function getConnectionColor(type: string) {
  switch (type) {
    case "DEEP":
      return "rgb(59, 130, 246)"; // Blue
    case "RELATED":
      return "rgb(34, 197, 94)"; // Green
    case "ALTERNATIVE":
      return "rgb(249, 115, 22)"; // Orange
    default:
      return "rgb(156, 163, 175)"; // Gray
  }
}
