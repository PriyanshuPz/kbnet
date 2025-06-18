// Type definitions
interface RoomManager {
  socketRooms: Map<string, Set<WSContext<WebSocket>>>;
  socketToSessions: Map<WSContext<WebSocket>, Set<string>>;
  socketToUser: Map<WSContext<WebSocket>, string>; // NEW
  userToSockets: Map<string, Set<WSContext<WebSocket>>>; // NEW
}

interface BasePayload {
  userId: string;
  ws: WSContext<WebSocket>;
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
