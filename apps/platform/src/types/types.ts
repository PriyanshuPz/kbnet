type Direction = "left" | "right" | "up" | "down";

// Enhanced node interface with relationship context
interface NodeData {
  id: string;
  sessionId: string;
  title: string;
  summary?: string | null;
  content?: string | null;
  generated: boolean;
  depth: number;
  x: number;
  y: number;
  createdAt: Date;
  updatedAt: Date;
  parentId?: string | null;
  relationshipType?:
    | "DEEP"
    | "RELATED"
    | "ALTERNATIVE"
    | "SIBLING"
    | "BACK"
    | null;
  direction?: "up" | "down" | "left" | "right";
}

interface ViewportNodes {
  up?: NodeData | null;
  down?: NodeData | null;
  left?: NodeData | null;
  right?: NodeData | null;
}

interface MiniMapNode {
  id: string;
  depth: number;
  x: number;
  y: number;
  generated: boolean;
  title: string;
  isCurrent: boolean;
  relationshipType?: string;
}

interface MiniMapConnection {
  fromNodeId: string;
  toNodeId: string;
  type: string;
}

interface MiniMapData {
  nodes: MiniMapNode[];
  connections: MiniMapConnection[];
  navigationPath: Array<{
    fromDepth: number;
    fromX: number;
    toDepth: number;
    toX: number;
    direction: string;
  }>;
  bounds: {
    minX: number;
    maxX: number;
    minDepth: number;
    maxDepth: number;
  };
}
