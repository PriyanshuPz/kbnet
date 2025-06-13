"use client";

import { useState, useCallback, useRef, MouseEvent } from "react";
import ReactFlow, {
  Background,
  Controls,
  Panel,
  useNodesState,
  useEdgesState,
  applyNodeChanges,
  applyEdgeChanges,
  MiniMap,
  NodeTypes,
  Node,
  NodeChange,
  EdgeChange,
  NodeMouseHandler,
} from "reactflow";
import "reactflow/dist/style.css";

import { KnowledgeNode } from "@/components/knowledge-map/knowledge-node";
import { FilterControls } from "@/components/knowledge-map/filter-controls";
import { NodeDetails } from "@/components/knowledge-map/node-details";
import { BreadcrumbTrail } from "@/components/knowledge-map/breadcrumb-trail";
import { LoadingState } from "@/components/knowledge-map/loading-state";
import { EmptyState } from "@/components/core/empty-state";
import { useKnowledgeGraph } from "@/hooks/use-knowledge-graph";
import { Waypoints } from "lucide-react";
import { cn, secondaryFonts } from "@/lib/utils";
import Brand from "@/components/core/brand";
import Link from "next/link";

interface Breadcrumb {
  nodeId: string;
  label: string;
}

// Define custom node types
const nodeTypes: NodeTypes = {
  knowledge: KnowledgeNode,
};

export default function Home() {
  const [nodes, setNodes] = useNodesState<NodeData>([]);
  const [edges, setEdges] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState({
    hackerNews: true,
    mediaWiki: true,
    youtube: true,
    webCrawler: true,
  });
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);

  const { isLoading, fetchGraph, expandNode, centerOnNode } = useKnowledgeGraph(
    {
      setNodes,
      setEdges,
      setSelectedNode,
      setBreadcrumbs,
    }
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const handleNodeClick: NodeMouseHandler = useCallback(
    (event: MouseEvent, node: Node<NodeData>) => {
      setSelectedNode(node);
      setIsDetailOpen(true);
      centerOnNode(node.id);
    },
    [centerOnNode]
  );

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      fetchGraph(query);
    },
    [fetchGraph]
  );

  const handleFilterChange = useCallback(
    (filterType: string, value: boolean) => {
      setActiveFilters((prev) => ({
        ...prev,
        [filterType]: value,
      }));

      // Apply filters to existing nodes
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.data.source === filterType) {
            return {
              ...node,
              hidden: !value,
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  const handleBreadcrumbClick = useCallback(
    (breadcrumb: Breadcrumb, index: number) => {
      // Trim breadcrumbs to this point
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(newBreadcrumbs);
      centerOnNode(breadcrumb.nodeId);
    },
    [breadcrumbs, setBreadcrumbs, centerOnNode]
  );

  return (
    <div className="w-full h-screen flex flex-col bg-background text-foreground">
      <div className="flex items-center px-4 h-14 mt-3">
        <Link href="/" className="flex items-center gap-2">
          <Brand />
        </Link>
      </div>

      <div className="flex-1 relative">
        {isLoading ? (
          <LoadingState />
        ) : nodes.length === 0 ? (
          <EmptyState onSearch={handleSearch} />
        ) : (
          <div ref={reactFlowWrapper} className="w-full h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={handleNodeClick}
              nodeTypes={nodeTypes}
              fitView
              minZoom={0.2}
              maxZoom={4}
            >
              <Background color="#aaa" />
              <Controls
                showInteractive={false}
                className="bg-card text-foreground rounded-md"
              />

              <Panel position="top-center">
                <BreadcrumbTrail
                  breadcrumbs={breadcrumbs}
                  onBreadcrumbClick={handleBreadcrumbClick}
                />
              </Panel>

              <Panel position="top-left">
                <FilterControls
                  filters={activeFilters}
                  onChange={handleFilterChange}
                />
              </Panel>
            </ReactFlow>
          </div>
        )}

        <NodeDetails
          node={selectedNode}
          open={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onExpandNode={(nodeId: string) => expandNode(nodeId)}
        />
      </div>
    </div>
  );
}
