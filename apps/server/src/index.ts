import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createNodeWebSocket } from "@hono/node-ws";
import { handler } from "./handler";
import { config } from "dotenv";
import router from "./api";
import { authClient, tokenToSession } from "./lib/auth-client";

config();

const app = new Hono<{
  Variables: {
    user: typeof authClient.$Infer.Session.user | null;
    session: typeof authClient.$Infer.Session.session | null;
  };
}>();

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

app.get("/", (c) => {
  return c.json({
    message: "Welcome to the KBNet API server",
    version: "1.0.0",
    status: "running",
    uptime: process.uptime().toFixed(2) + " seconds",
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("*", async (c, next) => {
  if (c.req.path.startsWith("/ws")) {
    return next();
  }

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

app.use(
  "/api/*",
  cors({
    origin: "*", // Allow all origins for API routes
  })
);

app.route("/api", router);

app.get(
  "/ws",
  upgradeWebSocket(async (c) => {
    const token = c.req.query("token");
    await tokenToSession(c, token);

    return {
      onOpen(evt, ws) {
        console.log("WebSocket connection opened", evt.type);
      },
      onClose(evt, ws) {
        console.log("WebSocket connection closed", evt.type);
        handler.cleanUpSocket(ws);
      },
      onMessage: (evt, ws) => {
        const session = c.get("session");
        const user = c.get("user");
        if (!session || !user) {
          console.warn("Session or user not found on message");
          return;
        }
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
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

injectWebSocket(server);
