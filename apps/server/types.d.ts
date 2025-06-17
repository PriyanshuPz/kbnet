// Type definitions
interface RoomManager {
  socketRooms: Map<string, Set<WSContext<WebSocket>>>;
  socketToSessions: Map<WSContext<WebSocket>, Set<string>>;
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
