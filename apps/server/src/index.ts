import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createNodeWebSocket } from "@hono/node-ws";
import WSMessageHandler from "./handler";

const app = new Hono();

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

// Store socket connections for room management
const socketRooms = new Map<string, Set<any>>(); // sessionId -> Set<websockets>
const socketToSessions = new Map<any, Set<string>>(); // websocket -> Set<sessionIds>

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const wsHandler = new WSMessageHandler();

app.get(
  "/ws",
  upgradeWebSocket((c) => ({
    onOpen(evt, ws) {
      console.log("WebSocket connection opened", evt.type);
    },
    onClose(evt, ws) {
      console.log("WebSocket connection closed", evt.type);

      // Clean up socket from all rooms
      const sessions = socketToSessions.get(ws);
      if (sessions) {
        sessions.forEach((sessionId) => {
          const room = socketRooms.get(sessionId);
          if (room) {
            room.delete(ws);
            if (room.size === 0) {
              socketRooms.delete(sessionId);
            }
          }
        });
        socketToSessions.delete(ws);
      }
    },
    onMessage: (evt, ws) =>
      wsHandler.handle(evt, ws, { socketRooms, socketToSessions }),
  }))
);
const server = serve(
  {
    fetch: app.fetch,
    port: 8000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

injectWebSocket(server);
