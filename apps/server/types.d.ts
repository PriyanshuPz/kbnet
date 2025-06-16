// Type definitions
interface RoomManager {
  socketRooms: Map<string, Set<WSContext<WebSocket>>>;
  socketToSessions: Map<WSContext<WebSocket>, Set<string>>;
}

interface NodePosition {
  depth: number;
  x: number;
  y: number;
}

interface SessionData {
  id: string;
  userId?: string | null;
  initialQuery: string;
  startedAt: Date;
  lastActiveAt: Date;
  isActive: boolean;
  currentNodeId?: string | null;
  currentDepth: number;
  currentX: number;
  currentY: number;
  currentNode?: Node | null;
}

// In your global state or types file
interface NodeWithRelationship {
  id: string;
  title: string;
  summary?: string | null;
  content?: string | null;
  generated: boolean;
  depth: number;
  x: number;
  y: number;
  relationshipType?: "DEEP" | "RELATED" | "ALTERNATIVE" | "SIBLING";
  direction?: "up" | "down" | "left" | "right";
}

interface ViewportNodes {
  up?: NodeWithRelationship | null;
  down?: NodeWithRelationship | null;
  left?: NodeWithRelationship | null;
  right?: NodeWithRelationship | null;
}
interface StartSearchPayload {
  query: string;
}

interface NavigatePayload {
  sessionId: string;
  direction: "up" | "down" | "left" | "right";
}

interface ResumeSessionPayload {
  sessionId: string;
}

interface GetViewportPayload {
  sessionId: string;
}

interface GeneratedContent {
  title: string;
  summary: string;
  content: string;
}

interface AINodeResponse {
  node: {
    label: string;
    content: string;
  };
  edges: Array<{
    label: string;
    hint: string;
  }>;
}
interface GetMiniMapPayload {
  sessionId: string;
}

interface MiniMapData {
  nodes: Array<{
    id: string;
    depth: number;
    x: number;
    y: number;
    generated: boolean;
    title: string;
    isCurrent: boolean;
    relationshipType?: string;
  }>;
  connections: Array<{
    fromNodeId: string;
    toNodeId: string;
    type: string;
  }>;
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
