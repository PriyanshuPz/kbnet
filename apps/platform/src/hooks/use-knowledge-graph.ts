import {
  useState,
  useCallback,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { MarkerType, Node, Edge, NodeChange, EdgeChange } from "reactflow";

// Define types for node data, breadcrumbs, etc.
interface NodeData {
  title: string;
  content: string;
  source: string;
  sourceName: string;
  relevance: string;
  tags: string[];
  publishedAt: string;
  url: string;
  relatedNodes: RelatedNode[];
}

interface RelatedNode {
  id: string;
  title: string;
  source: string;
  sourceName: string;
}

interface Breadcrumb {
  nodeId: string;
  label: string;
}

interface KnowledgeGraphProps {
  setNodes: Dispatch<SetStateAction<Array<Node<NodeData>>>>;
  setEdges: Dispatch<SetStateAction<Edge[]>>;
  setSelectedNode: Dispatch<SetStateAction<Node<NodeData> | null>>;
  setBreadcrumbs: Dispatch<SetStateAction<Breadcrumb[]>>;
}

// Mock API response for demonstration
const mockKnowledgeResponse = (
  query: string
): { nodes: Array<Node<NodeData>>; edges: Edge[] } => {
  const baseNode: Node<NodeData> = {
    id: "base-1",
    type: "knowledge", // Optional, specify node type if needed
    data: {
      title: query || "Knowledge Graph",
      content: "This is the main knowledge node for the graph exploration.",
      source: "mediaWiki",
      sourceName: "Wikipedia",
      relevance: "High",
      tags: ["knowledge", "graph"],
      publishedAt: new Date().toISOString(),
      url: "https://example.com/knowledge",
      relatedNodes: [],
    },
    position: { x: 0, y: 0 }, // Position will be set later
  };

  // Generate mock nodes
  const nodes: Array<Node<NodeData>> = Array.from({ length: 8 }, (_, i) => ({
    id: `node-${i + 1}`,
    type: "knowledge", // Optional, specify node type if needed
    position: { x: 0, y: 0 }, // Position will be set later
    data: {
      title: `Related Knowledge ${i + 1}`,
      content: `This is related content ${i + 1} for the knowledge graph exploration. It contains information that is relevant to the search query.`,
      source: ["hackerNews", "mediaWiki", "youtube", "webCrawler"][i % 4],
      sourceName: ["Hacker News", "Wikipedia", "YouTube", "Web"][i % 4],
      relevance: ["High", "Medium", "Low"][i % 3],
      tags: ["knowledge", "graph", "ai", "data"][i % 4]
        ? ["knowledge", "graph", "ai", "data"].slice(0, (i % 3) + 1)
        : [],
      publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
      url: `https://example.com/knowledge/${i + 1}`,
      relatedNodes: [],
    },
  }));

  // Generate mock edges
  const edges: Edge[] = nodes.map((node) => ({
    id: `edge-base-${node.id}`,
    source: "base-1",
    target: node.id,
    animated: false,
    style: { stroke: "var(--border)" },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 15,
      height: 15,
      color: "var(--border)",
    },
  }));

  return { nodes: [baseNode, ...nodes], edges };
  // return { nodes: [], edges: [] };
};

// Position nodes in a force-directed layout
const positionNodes = (
  nodes: Array<Node<NodeData>>,
  edges: Edge[]
): { nodes: Array<Node<NodeData>>; edges: Edge[] } => {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const radius = Math.min(window.innerWidth, window.innerHeight) * 0.3;

  // Position main node at center
  const positionedNodes = nodes.map((node, i) => {
    if (i === 0) {
      return {
        ...node,
        position: { x: centerX, y: centerY },
        style: { width: 180 },
      };
    }

    // Position other nodes in a circle
    const angle = ((Math.PI * 2) / (nodes.length - 1)) * (i - 1);
    return {
      ...node,
      position: {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      },
      style: { width: 160 },
    };
  });

  return { nodes: positionedNodes, edges };
};

export const useKnowledgeGraph = ({
  setNodes,
  setEdges,
  setSelectedNode,
  setBreadcrumbs,
}: KnowledgeGraphProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchGraph = useCallback(
    async (query: string) => {
      setIsLoading(true);

      try {
        // const response = await api.fetchKnowledgeGraph(query);

        // Using mock data for demonstration
        const { nodes, edges } = mockKnowledgeResponse(query);
        const positioned = positionNodes(nodes, edges);

        setNodes(positioned.nodes);
        setEdges(positioned.edges);

        if (query) {
          setBreadcrumbs((prev) => [
            ...prev,
            {
              nodeId: positioned.nodes[0].id,
              label: query,
            },
          ]);
        } else {
          setBreadcrumbs([]);
        }
      } catch (error) {
        console.error("Error fetching knowledge graph:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [setNodes, setEdges, setBreadcrumbs]
  );

  const expandNode = useCallback(
    async (nodeId: string) => {
      setIsLoading(true);

      try {
        // Find the node to expand
        const node: Partial<Node<NodeData>> = {};

        // In real app, this would be an API call to get related data
        // const response = await api.expandNode(nodeId);

        // Using mock data for demonstration
        const { nodes: newNodes, edges: newEdges } = mockKnowledgeResponse(
          node.data?.title || "Expanded"
        );

        // Update nodes and edges with new data
        setNodes((prev) => [...prev, ...newNodes.slice(1)]);
        setEdges((prev) => [...prev, ...newEdges]);

        // Update breadcrumbs
        setBreadcrumbs((prev) => [
          ...prev,
          {
            nodeId: nodeId,
            label: node.data?.title || "Expanded Node",
          },
        ]);
      } catch (error) {
        console.error("Error expanding node:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [setNodes, setEdges, setBreadcrumbs]
  );

  const centerOnNode = useCallback(
    (nodeId: string) => {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === nodeId) {
            setSelectedNode(node);
            return {
              ...node,
              selected: true,
            };
          }
          return {
            ...node,
            selected: false,
          };
        })
      );
    },
    [setNodes, setSelectedNode]
  );

  useEffect(() => {
    // Load initial graph
    fetchGraph("");
  }, [fetchGraph]);

  return {
    isLoading,
    fetchGraph,
    expandNode,
    centerOnNode,
  };
};
