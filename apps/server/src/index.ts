import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createNodeWebSocket } from "@hono/node-ws";
import { handler } from "./handler";
import { auth } from "@kbnet/shared";
import dotenv from "dotenv";
import router from "./api";

dotenv.config();

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

app.use(
  "/api/*",
  cors({
    origin: ["http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

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

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

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
