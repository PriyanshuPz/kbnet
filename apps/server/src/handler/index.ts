import { MessageType, MindsDBConfig, unpack } from "@kbnet/shared";
import type { WSContext, WSMessageReceive } from "hono/ws";
import { prisma } from "@kbnet/db";
import { connectMindsDB, runMindsDBQuery } from "../lib/mindsdb";
import { generateId, sanitizeSQLValue } from "../lib/util";
import { ingestArxiv, ingestMediawiki } from "../lib/ingests";
import { generateObject } from "ai";
import { google } from "../lib/ai";
import { z } from "zod";

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

    ingestArxiv(payload.query);
    ingestMediawiki(payload.query);

    const kbdata = await runMindsDBQuery(`
      SELECT * FROM ${MindsDBConfig.KB_NAME}
      WHERE content = ${sanitizeSQLValue(payload.query)}
      LIMIT 10;
    `);

    const { object } = await generateObject({
      model: google("gemini-2.0-flash"),
      system: MindsDBConfig.MAIN_NODE_GEN_MODEL_PROMPT(
        payload.query,
        kbdata.rows
      ),
      schema: z.object({
        node: z.object({
          label: z.string().describe("Title or concept of the node."),
          content: z.string().describe("Detailed explanation of the node."),
        }),
        edges: z.array(
          z.object({
            label: z.string().describe("Question or related topic."),
            hint: z.string().describe("Short description of the topic."),
          })
        ),
      }),
      prompt: payload.query,
    });

    console.log("Generated object:", JSON.stringify(object, null, 2));

    const nodeId = generateId("node");
    const kmap = await prisma.kMap.create({
      data: {
        id: generateId("kmap"),
        query: payload.query,
        nodes: {
          create: {
            id: nodeId,
            label: object.node.label,
            content: object.node.content,
            isMain: true,
            source: "AI",
            positionX: 0,
            positionY: 0,
          },
        },
        edges: {
          createMany: {
            data: object.edges.map((edge, index) => ({
              id: generateId("edge"),
              fromNode: nodeId,
              label: edge.label,
              type: "default",
              hint: edge.hint,
            })),
          },
        },
      },
    });

    ws.send(
      JSON.stringify({
        type: MessageType.NEW_KMAP,
        payload: { id: kmap.id },
      })
    );
  }
}
