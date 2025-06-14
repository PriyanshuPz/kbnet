import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createNodeWebSocket } from "@hono/node-ws";
import WSMessageHandler from "./handler";

const app = new Hono();

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

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
    },
    onMessage: wsHandler.handle.bind(wsHandler),
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
