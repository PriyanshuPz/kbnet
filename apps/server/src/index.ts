import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createNodeWebSocket } from "@hono/node-ws";
import { handler } from "./handler";
import { auth } from "@kbnet/shared";
import { config } from "dotenv";
import router from "./api";

config();

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
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
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return c.text("Unauthorized: Invalid session", 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

app.use(
  "/api/*",
  cors({
    origin: (origin, c) => {
      const envOrigins = process.env.CORS_ORIGIN;
      const envOrigin = envOrigins
        ? envOrigins.split(",").map((o) => o.trim())
        : null;
      if (Array.isArray(envOrigin) && envOrigin.length > 0) {
        return envOrigin.includes(origin) ? origin : envOrigin[0];
      }
      const knownOrigins = ["https://kbnet.diybuilds.tech"];
      if (knownOrigins.includes(origin) || !origin) {
        return origin;
      }
    },
  })
);

app.route("/api", router);

app.get(
  "/ws",
  upgradeWebSocket(async (c) => {
    const headers = c.req.raw.headers;
    const session = await auth.api.getSession({
      headers: headers,
    });

    if (!session) {
      throw new Error("Unauthorized: Invalid session");
    }

    c.set("user", session.user);
    c.set("session", session.session);

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
