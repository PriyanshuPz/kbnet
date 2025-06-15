"use client";

import { KnowledgeNode } from "@/components/knowledge-map/knowledge-node";
import { useGlobal } from "@/store/global-state";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  EdgeChange,
  NodeChange,
  NodeTypes,
  EdgeTypes,
  Panel,
  MiniMap,
  useReactFlow,
  ConnectionMode,
  MarkerType,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, RefreshCcw, Book } from "lucide-react";
import { QuantumEdge } from "@/components/knowledge-map/quantum-edge";
import { BubbleNode } from "@/components/knowledge-map/bubble-node";
import { MysteryNode } from "@/components/knowledge-map/mystery-node";
import "reactflow/dist/style.css";
// Define custom node types
const nodeTypes: NodeTypes = {
  Main: KnowledgeNode,
  Bubble: BubbleNode,
  Mystery: MysteryNode,
};

// Define custom edge types
const edgeTypes: EdgeTypes = {
  quantum: QuantumEdge,
};

// Define custom edge style
const defaultEdgeOptions = {
  type: "quantum", // Use our custom edge type
  animated: true,
  style: {
    strokeWidth: 2,
    stroke: "url(#quantum-gradient)",
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "var(--primary)",
  },
};

function KMapFlow({ kmap }: { kmap: KMap }) {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const { setKmapId, edges, nodes, addEdge, addNode, updateNode } = useGlobal();
  const reactFlowInstance = useReactFlow();

  // Layout nodes in force-directed pattern
  const arrangeNodesInForceLayout = useCallback(() => {
    const centerX = 0; // Center at 0,0 instead of window dimensions
    const centerY = 0;
    const radius = 400; // Fixed radius instead of window-based

    // Find the main node
    const mainNodeIndex = nodes.findIndex((node) => node.isMain);

    // Position nodes
    nodes.forEach((node, i) => {
      if (node.isMain) {
        // Center the main node
        updateNode(node.id!, {
          ...node,
          positionX: centerX,
          positionY: centerY,
        });
      } else {
        // Calculate angle for surrounding nodes
        const totalNonMainNodes = nodes.length - (mainNodeIndex >= 0 ? 1 : 0);
        const angleStep = (2 * Math.PI) / totalNonMainNodes;

        // Adjust index to account for main node
        let angleIndex = i;
        if (mainNodeIndex >= 0 && i > mainNodeIndex) {
          angleIndex = i - 1;
        }

        // Add a small random offset for more natural placement
        const offsetX = Math.random() * 50 - 25;
        const offsetY = Math.random() * 50 - 25;

        const angle = angleStep * angleIndex;
        const x = centerX + radius * Math.cos(angle) + offsetX;
        const y = centerY + radius * Math.sin(angle) + offsetY;

        // Update node position
        updateNode(node.id!, {
          ...node,
          positionX: x,
          positionY: y,
        });
      }
    });
  }, [nodes, updateNode]);
  const convertEdgesToMysteryNodes = useCallback(() => {
    // Filter for main node and regular nodes
    const mainNode = nodes.find((node) => node.isMain);
    const regularNodes = nodes.filter(
      (node) => !node.isMain && !node.isMystery
    );

    if (mainNode && regularNodes.length > 0) {
      // For each regular node, create a mystery node as an edge representation
      regularNodes.forEach((node, idx) => {
        // Calculate position between main node and regular node
        const mainX = mainNode.positionX || 0;
        const mainY = mainNode.positionY || 0;
        const nodeX = node.positionX || 0;
        const nodeY = node.positionY || 0;

        // Place mystery node at 40% of the distance from main to connected node
        const mysteryX = mainX + (nodeX - mainX) * 0.4;
        const mysteryY = mainY + (nodeY - mainY) * 0.4;

        // Add some randomness for natural appearance
        const offsetX = Math.random() * 30 - 15;
        const offsetY = Math.random() * 30 - 15;

        // Add mystery node
        const mysteryId = `mystery-${mainNode.id}-${node.id}`;

        // Check if this mystery node already exists
        if (!nodes.some((n) => n.id === mysteryId)) {
          addNode({
            id: mysteryId,
            label: "Connection",
            positionX: mysteryX + offsetX,
            positionY: mysteryY + offsetY,
            isMystery: true,
            kmapId: kmap.id,
            // Store the connection info for reference
            connectsFrom: mainNode.id,
            connectsTo: node.id,
          });
        }

        // Remove direct edge between main and regular node if it exists
        useGlobal.setState((state) => ({
          edges: state.edges.filter(
            (e) =>
              !(e.fromNode === mainNode.id && e.toNode === node.id) &&
              !(e.fromNode === node.id && e.toNode === mainNode.id)
          ),
        }));

        // Add edges connecting main→mystery and mystery→node
        const edgeMainToMystery = `edge-main-to-mystery-${idx}`;
        const edgeMysteryToNode = `edge-mystery-to-node-${idx}`;

        if (!edges.some((e) => e.id === edgeMainToMystery)) {
          addEdge({
            id: edgeMainToMystery,
            fromNode: mainNode.id,
            toNode: mysteryId,
            label: "",
          });
        }

        if (!edges.some((e) => e.id === edgeMysteryToNode)) {
          addEdge({
            id: edgeMysteryToNode,
            fromNode: mysteryId,
            toNode: node.id,
            label: "",
          });
        }
      });
    }
  }, [nodes, edges, addNode, addEdge, kmap.id]);
  // Add this function to handle mystery node click
  const handleMysteryNodeClick = useCallback(
    (nodeId: string) => {
      const mysteryNode = nodes.find((node) => node.id === nodeId);

      if (mysteryNode && mysteryNode.isMystery) {
        // Get the nodes it connects
        const fromNode = nodes.find((n) => n.id === mysteryNode.connectsFrom);
        const toNode = nodes.find((n) => n.id === mysteryNode.connectsTo);

        if (fromNode && toNode) {
          // Create a direct edge
          addEdge({
            id: `edge-${fromNode.id}-${toNode.id}`,
            fromNode: fromNode.id,
            toNode: toNode.id,
            label: "connected", // You could customize this label
          });

          // Remove the mystery node and its edges
          useGlobal.setState((state) => ({
            nodes: state.nodes.filter((n) => n.id !== nodeId),
            edges: state.edges.filter(
              (e) => e.toNode !== nodeId && e.fromNode !== nodeId
            ),
          }));
        }
      }
    },
    [nodes, addEdge]
  );

  // Inside useEffect after node initialization, add:
  useEffect(() => {
    if (isInitialized && nodes.length > 0) {
      // First arrange nodes
      const timer = setTimeout(() => {
        arrangeNodesInForceLayout();

        // Then convert edges to mystery nodes
        setTimeout(() => {
          convertEdgesToMysteryNodes();

          // Finally fit view
          setTimeout(() => {
            reactFlowInstance.fitView({ padding: 0.5 });
          }, 50);
        }, 100);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [
    isInitialized,
    nodes.length,
    arrangeNodesInForceLayout,
    convertEdgesToMysteryNodes,
    reactFlowInstance,
  ]);

  // Arrange nodes after initialization
  // useEffect(() => {
  //   if (isInitialized && nodes.length > 0) {
  //     // Add a slight delay to ensure ReactFlow is ready
  //     const timer = setTimeout(() => {
  //       arrangeNodesInForceLayout();

  //       // Fit view after arranging with a better zoom level
  //       setTimeout(() => {
  //         reactFlowInstance.setViewport({ x: 0, y: 0, zoom: 0.8 });
  //         reactFlowInstance.fitView({
  //           padding: 0.5, // More padding for better view
  //           minZoom: 0.2, // Decreased minimum zoom to allow zooming out more
  //           maxZoom: 4, // Increased maximum zoom
  //         });
  //       }, 100);
  //     }, 200);

  //     return () => clearTimeout(timer);
  //   }
  // }, [
  //   isInitialized,
  //   nodes.length,
  //   arrangeNodesInForceLayout,
  //   reactFlowInstance,
  // ]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    // Handle node changes if needed
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    // Handle edge changes if needed
  }, []);

  const handleResetView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({
        padding: 0.5,
        minZoom: 0.2,
        maxZoom: 4,
        duration: 800, // Animation duration
      });
    }
  }, [reactFlowInstance]);

  const handleRearrangeNodes = useCallback(() => {
    arrangeNodesInForceLayout();
    setTimeout(() => handleResetView(), 100);
  }, [arrangeNodesInForceLayout, handleResetView]);

  return (
    <div className="flex-1 relative">
      <div ref={reactFlowWrapper} className="w-full h-full absolute inset-0">
        {/* SVG Gradients for edges */}
        <svg style={{ width: 0, height: 0, position: "absolute" }}>
          <defs>
            <linearGradient
              id="quantum-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>

        <ReactFlow
          nodes={nodes.map((node) => ({
            id: node.id!,
            position: {
              x: node.positionX || 0,
              y: node.positionY || 0,
            },
            type: node.isMystery ? "Mystery" : node.isMain ? "Main" : "Bubble",
            data: {
              title: node.label || "Node Title",
              content: node.content || "No description available",
              source: node.source || "mediaWiki",
              isMain: node.isMain,
              isMystery: node.isMystery,
              relevance: node.isMain ? "High" : "Medium",
              kmapId: node.kmapId,
              icon: node.isMain ? Book : undefined,
              onClick: node.isMystery
                ? () => handleMysteryNodeClick(node.id!)
                : undefined,
            },
            // Let the node components handle styling
            draggable: true,
            selected: false,
          }))}
          edges={edges.map((edge) => ({
            id: edge.id!,
            source: edge.fromNode!,
            target: edge.toNode || "",
            type: "quantum", // Use our custom edge type
            label: edge.label || "relates to",
            data: {
              animated: true,
            },
          }))}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          defaultEdgeOptions={defaultEdgeOptions}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          // Critical zoom and pan settings
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          minZoom={0.5} // Allow zooming out further
          maxZoom={8} // Allow zooming in further
          fitView={true}
          fitViewOptions={{
            padding: 0.5,
            minZoom: 0.2,
            maxZoom: 4,
          }}
          // Important interactions
          panOnScroll={true} // Enable pan on scroll
          panOnDrag={true} // Enable pan on drag
          zoomOnScroll={true} // Enable zoom on scroll
          zoomOnPinch={true} // Enable zoom on pinch
          zoomOnDoubleClick={true} // Enable zoom on double click
          // Other settings for better experience
          selectionOnDrag={false} // Don't select on drag
          connectOnClick={false} // Don't connect on click
          connectionMode={ConnectionMode.Loose}
          attributionPosition="bottom-right"
          proOptions={{
            hideAttribution: true, // Hide attribution for cleaner UI
          }}
        >
          <Background color="rgba(59, 130, 246, 0.3)" gap={20} size={1} />

          <Controls
            showInteractive={false}
            className="bg-card/80 backdrop-blur-sm text-foreground border border-border rounded-md shadow-md p-1"
          />

          <Panel position="top-right" className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => reactFlowInstance.zoomIn()}
              className="bg-card/80 backdrop-blur-sm border border-border shadow-sm"
            >
              <ZoomIn size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => reactFlowInstance.zoomOut()}
              className="bg-card/80 backdrop-blur-sm border border-border shadow-sm"
            >
              <ZoomOut size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleResetView}
              className="bg-card/80 backdrop-blur-sm border border-border shadow-sm"
            >
              <Maximize2 size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRearrangeNodes}
              className="bg-card/80 backdrop-blur-sm border border-border shadow-sm"
            >
              <RefreshCcw size={16} />
            </Button>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}

export default function KMapContent({ kmap }: { kmap: KMap }) {
  return (
    <ReactFlowProvider>
      <KMapFlow kmap={kmap} />
    </ReactFlowProvider>
  );
}
