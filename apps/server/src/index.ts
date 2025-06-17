import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createNodeWebSocket } from "@hono/node-ws";
import WSMessageHandler from "./handler";
import { auth } from "@kbnet/shared";
import dotenv from "dotenv";

dotenv.config();

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const wsHandler = new WSMessageHandler();

app.get(
  "/ws",
  upgradeWebSocket(async (c) => {
    const url = new URL(c.req.url);
    const authToken = url.searchParams.get("token");
    if (!authToken) {
      throw new Error("Unauthorized: No token provided");
    }
    const headers = c.req.raw.headers;
    headers.set("Authorization", `Bearer ${authToken}`);

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
        wsHandler.cleanUpSocket(ws);
      },
      onMessage: (evt, ws) => {
        const session = c.get("session");
        const user = c.get("user");
        if (!session || !user) {
          console.warn("Session or user not found on message");
          return;
        }
        wsHandler.handle(c, evt, ws);
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
