import { Hono } from "hono";
import { createNodeWebSocket } from "@hono/node-ws";
import { handler } from "./handler";
import { config } from "dotenv";
import router from "./api";
import { authClient, tokenToSession } from "./lib/auth-client";
import { createServer } from "http";
import { MessageType, pack } from "@kbnet/shared";
import { serve } from "@hono/node-server";
import { runMindsDBQuery } from "@kbnet/shared/mindsdb";
import { prisma } from "@kbnet/db";

config();

const app = new Hono<{
  Variables: {
    user: typeof authClient.$Infer.Session.user | null;
    session: typeof authClient.$Infer.Session.session | null;
  };
}>();

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

app.get("/", async (c) => {
  let isMindsDB = false;
  let isDB = false;
  try {
    const cell = await runMindsDBQuery(`SELECT 1`);
    console.log("MindsDB cell result:", cell.type);
    if (cell.type == "table") {
      isMindsDB = true;
    } else {
      isMindsDB = false;
    }
  } catch (error) {
    isMindsDB = false;
    console.error("Failed to connect to MindsDB");
  }

  try {
    isDB = await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    isDB = false;
    console.error("Failed to check DB connection.");
  }

  return c.json({
    message: "Welcome to the KBNet API server",
    version: "1.0.0",
    status: "running",
    mindsDB: isMindsDB ? "connected" : "not connected",
    database: isDB ? "connected" : "not connected",
    uptime: process.uptime().toFixed(2) + " seconds",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/*", async (c, next) => {
  try {
    const authorization = c.req.header("Authorization");
    if (!authorization) {
      c.set("user", null);
      c.set("session", null);
      throw new Error("Unauthorized: No authorization header provided");
    }
    const token = authorization.replace("Bearer ", "").trim();

    await tokenToSession(c, token);
    return next();
  } catch (error: any) {
    return c.json(
      { error: error.message || "Unauthorized: Invalid token or session" },
      401
    );
  }
});

app.route("/api", router);

app.get(
  "/ws",
  upgradeWebSocket(async (c) => {
    let pingInterval: NodeJS.Timeout;
    return {
      onOpen: async (evt, ws) => {
        const token = c.req.query("token");
        try {
          const { session, user } = await tokenToSession(c, token);

          c.set("user", user);
          c.set("session", session);
        } catch (error: any) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: error.message || "Authentication failed",
            })
          );
          clearInterval(pingInterval);
          ws.close(1008, error.message || "Authentication failed");
          return;
        }
        console.log("WebSocket connection opened", evt.type);
        ws.send(
          pack(MessageType.WELCOME, { message: "Welcome to KBNet WebSocket!" })
        );

        // Send ping every 30 seconds
        pingInterval = setInterval(() => {
          if (ws.readyState === 1) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 30000);
      },
      onClose(evt, ws) {
        console.log("WebSocket connection closed", evt.type);
        clearInterval(pingInterval);
        c.set("user", null);
        c.set("session", null);
        handler.cleanUpSocket(ws);
      },
      onMessage: (evt, ws) => {
        handler.handle(c, evt, ws);
      },
      onError(evt, ws) {
        console.error("WebSocket error:", evt.type, evt);

        // handler.handleError(evt, ws);
      },
    };
  })
);

const PORT = parseInt(process.env.PORT || "8000");

const server = serve(
  {
    fetch: app.fetch,
    port: PORT,
    hostname: "0.0.0.0",
    createServer,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

injectWebSocket(server);

// graceful shutdown
process.on("SIGINT", () => {
  server.close();
  process.exit(0);
});
process.on("SIGTERM", () => {
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});
