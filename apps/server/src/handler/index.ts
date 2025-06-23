import { MessageType, pack, unpack } from "@kbnet/shared";
import type { WSContext, WSMessageReceive } from "hono/ws";
import type { Context } from "hono";
import {
  createNewMap,
  navigateBack,
  navigateMap,
  resumeMap,
} from "../controllers/map";
import { getMapBranches } from "../controllers/branch";
import { getUserStats } from "../controllers/user-stats";

export default class WSMessageHandler {
  roomManager: RoomManager;

  constructor(
    roomManager: RoomManager = {
      socketRooms: new Map<string, Set<WSContext<WebSocket>>>(),
      socketToSessions: new Map<WSContext<WebSocket>, Set<string>>(),
      socketToUser: new Map<WSContext<WebSocket>, string>(), // NEW
      userToSockets: new Map<string, Set<WSContext<WebSocket>>>(), // NEW
    }
  ) {
    this.roomManager = roomManager;
  }

  async handle(
    c: Context,
    evt: MessageEvent<WSMessageReceive>,
    ws: WSContext<WebSocket>
  ): Promise<void> {
    try {
      const user = c.get("user");
      if (!user) {
        this.sendErrorToSocket(ws, "User not authenticated");
        return;
      }

      const userId = user.id;

      // Register user connection (if not already registered)
      if (!this.roomManager.socketToUser.has(ws)) {
        this.connectUser(userId, ws);
      }

      const { payload, type } = unpack(evt.data);

      switch (type) {
        case MessageType.START_SEARCH: {
          await createNewMap({
            userId,
            data: { query: payload.query },
            ws,
          });
          break;
        }

        case MessageType.RESUME_MAP: {
          await resumeMap({
            userId,
            data: { mapId: payload.mapId },
            ws,
          });
          break;
        }

        case MessageType.NAVIGATE: {
          await navigateMap({
            userId,
            data: {
              nextNodeId: payload.nextNodeId,
              direction: payload.direction,
              currentPathNodeId: payload.currentPathNodeId,
              currentPathBranchId: payload.currentPathBranchId,
            },
            ws,
          });
          await getUserStats({
            userId,
            ws,
          });
          break;
        }

        case MessageType.NAVIGATE_BACK: {
          await navigateBack({
            userId,
            data: {
              currentPathNodeId: payload.currentPathNodeId,
              currentPathBranchId: payload.currentPathBranchId,
            },
            ws,
          });
          break;
        }
        case MessageType.GET_MAP_BRANCHES: {
          await getMapBranches({
            userId,
            data: { mapId: payload.mapId },
            ws,
          });
          break;
        }

        case MessageType.GET_USER_STAT: {
          await getUserStats({
            userId,
            ws,
          });
          break;
        }
        case MessageType.PING: {
          // Handle ping messages to keep the connection alive
          ws.send(pack(MessageType.SHOW_NOTIFICATION, { message: "pong" }));
          break;
        }
        default:
          console.log("WebSocket message received:", type, payload);
          break;
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
      this.sendErrorToSocket(ws, "Internal server error");
    }
  }

  // Helper methods
  public joinSessionRoom(
    userId: string,
    ws: WSContext<WebSocket>,
    sessionId: string
  ): void {
    if (!userId) {
      this.sendErrorToSocket(ws, "Session or user not found");
      return;
    }

    // Track user <-> socket
    this.roomManager.socketToUser.set(ws, userId);

    if (!this.roomManager.userToSockets.has(userId)) {
      this.roomManager.userToSockets.set(userId, new Set());
    }
    this.roomManager.userToSockets.get(userId)!.add(ws);

    // Add session to socket's session set
    if (!this.roomManager.socketToSessions.has(ws)) {
      this.roomManager.socketToSessions.set(ws, new Set());
    }
    this.roomManager.socketToSessions.get(ws)!.add(sessionId);

    // Add socket to session room
    if (!this.roomManager.socketRooms.has(sessionId)) {
      this.roomManager.socketRooms.set(sessionId, new Set());
    }
    this.roomManager.socketRooms.get(sessionId)!.add(ws);

    console.log(`Socket joined session room ${sessionId} for user ${userId}`);
  }

  public connectUser(userId: string, ws: WSContext<WebSocket>): void {
    // Track user <-> socket
    this.roomManager.socketToUser.set(ws, userId);

    if (!this.roomManager.userToSockets.has(userId)) {
      this.roomManager.userToSockets.set(userId, new Set());
    }

    this.roomManager.userToSockets.get(userId)!.add(ws);

    console.log(`User ${userId} connected (no session)`);
  }

  public sendToSession(
    sessionId: string,
    type: MessageType,
    payload: Record<string, any>
  ): void {
    const room = this.roomManager.socketRooms.get(sessionId);
    console.log(`Sending message of type ${type} to session ${sessionId}`);
    if (room) {
      room.forEach((socket: WSContext<WebSocket>) => {
        socket.send(pack(type, payload));
      });
      console.log(`Sent message of type ${type} to session ${sessionId}`);
    }
  }

  public sendToUser(
    userId: string,
    type: MessageType,
    payload: Record<string, any>
  ): void {
    const sockets = this.roomManager.userToSockets.get(userId);
    if (sockets) {
      sockets.forEach((socket: WSContext<WebSocket>) => {
        socket.send(pack(type, payload));
      });
      console.log(`Sent message of type ${type} to user ${userId}`);
    } else {
      console.log(`User ${userId} is not connected`);
    }
  }

  private sendErrorToSocket(ws: WSContext<WebSocket>, message: string): void {
    ws.send(pack(MessageType.ERROR, { message }));
  }

  public cleanUpSocket(ws: WSContext<WebSocket>): void {
    // Remove socket from all session rooms
    const sessions = this.roomManager.socketToSessions.get(ws);
    if (sessions) {
      sessions.forEach((sessionId) => {
        const room = this.roomManager.socketRooms.get(sessionId);
        if (room) {
          room.delete(ws);
          if (room.size === 0) {
            this.roomManager.socketRooms.delete(sessionId);
          }
        }
      });
      this.roomManager.socketToSessions.delete(ws);
    }

    // Clean user <-> socket mapping
    const userId = this.roomManager.socketToUser.get(ws);
    if (userId) {
      const sockets = this.roomManager.userToSockets.get(userId);
      if (sockets) {
        sockets.delete(ws);
        if (sockets.size === 0) {
          this.roomManager.userToSockets.delete(userId);
        }
      }
      this.roomManager.socketToUser.delete(ws);
    }
  }
}

const handler = new WSMessageHandler();
export { handler };
