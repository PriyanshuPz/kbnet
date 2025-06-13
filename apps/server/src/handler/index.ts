import { MessageType, MindsDBConfig, unpack } from "@kbnet/shared";
import type { WSContext, WSMessageReceive } from "hono/ws";
import MindsDB from "mindsdb-js-sdk";
import { connectMindsDB } from "../lib/mindsdb.js";

export default class WSMessageHandler {
  async handle(
    evt: MessageEvent<WSMessageReceive>,
    ws: WSContext<WebSocket>
  ): Promise<void> {
    try {
      const { payload, type } = unpack(evt.data);
      // Connect to MindsDB instance
      await connectMindsDB();
      switch (type) {
        case MessageType.START_SEARCH: {
          await this.handleStartSearch(payload, ws);
          break;
        }
        default:
          console.log("WebSocket message received:", type, payload);
          ws.send(
            JSON.stringify({
              type: MessageType.PONG,
              payload: { message: "Pong!" },
            })
          );
          break;
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  }
  async handleStartSearch(
    payload: Record<string, any>,
    ws: WSContext<WebSocket>
  ): Promise<void> {
    console.log("Handling start search with payload:", payload.query);
    const res = await MindsDB.SQL.runQuery(
      `SELECT * FROM ${MindsDBConfig.KB_NAME} WHERE content LIKE '${payload.query}'`
    );

    console.log("Search results:", res);
    // For example, you might want to send a response back to the client
    ws.send(
      JSON.stringify({
        type: MessageType.SEARCH_RESULT,
        payload: { results: [] }, // Replace with actual search results
      })
    );
  }
}
