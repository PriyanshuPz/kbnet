import { MessageType, MindsDBConfig, unpack } from "@kbnet/shared";
import type { WSContext, WSMessageReceive } from "hono/ws";
import { prisma, RelationshipType, type Node } from "@kbnet/db";
import { connectMindsDB, runMindsDBQuery } from "../lib/mindsdb";
import { generateId, sanitizeSQLValue } from "../lib/util";
import { ingestArxiv, ingestMediawiki } from "../lib/ingests";
import { generateObject } from "ai";
import { google } from "../lib/ai";
import { z } from "zod";

export default class WSMessageHandler {
  async handle(
    evt: MessageEvent<WSMessageReceive>,
    ws: WSContext<WebSocket>,
    roomManager: RoomManager
  ): Promise<void> {
    try {
      const { payload, type } = unpack(evt.data);
      // Connect to MindsDB instance
      await connectMindsDB();

      switch (type) {
        case MessageType.START_SEARCH: {
          await this.handleStartSearch(
            payload as StartSearchPayload,
            ws,
            roomManager
          );
          break;
        }
        case MessageType.NAVIGATE: {
          await this.handleNavigate(
            payload as NavigatePayload,
            ws,
            roomManager
          );
          break;
        }
        case MessageType.GET_MINIMAP: {
          await this.handleGetMiniMap(
            payload as GetMiniMapPayload,
            ws,
            roomManager
          );
          break;
        }
        case MessageType.RESUME_SESSION: {
          await this.handleResumeSession(
            payload as ResumeSessionPayload,
            ws,
            roomManager
          );
          break;
        }
        case MessageType.GET_VIEWPORT: {
          await this.handleGetViewport(
            payload as GetViewportPayload,
            ws,
            roomManager
          );
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
  private getNodeRelationshipType(
    node: any,
    relationships: any[]
  ): string | undefined {
    // Find relationship where this node is the target
    const incomingRel = relationships.find(
      (rel) => rel.targetNodeId === node.id
    );
    return incomingRel?.type;
  }
  private async handleGetMiniMap(
    payload: GetMiniMapPayload,
    ws: WSContext<WebSocket>,
    roomManager: RoomManager
  ): Promise<void> {
    const { sessionId } = payload;

    try {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { currentNode: true },
      });

      if (!session) {
        throw new Error("Session not found");
      }

      // Get all nodes in this session
      const allNodes = await prisma.node.findMany({
        where: { sessionId },
        orderBy: [{ depth: "asc" }, { x: "asc" }, { y: "asc" }],
      });

      // Get all relationships between nodes
      const relationships = await prisma.nodeRelationship.findMany({
        where: {
          OR: [{ sourceNode: { sessionId } }, { targetNode: { sessionId } }],
        },
        include: {
          sourceNode: true,
          targetNode: true,
        },
      });

      // Get navigation path
      const navigationSteps = await prisma.navigationStep.findMany({
        where: { sessionId },
        orderBy: { stepIndex: "asc" },
      });

      // Calculate bounds
      const bounds = {
        minX: Math.min(...allNodes.map((n) => n.x), 0),
        maxX: Math.max(...allNodes.map((n) => n.x), 0),
        minDepth: 0,
        maxDepth: Math.max(...allNodes.map((n) => n.depth), 0),
      };

      // Format mini map data
      const miniMapData: MiniMapData = {
        nodes: allNodes.map((node) => ({
          id: node.id,
          depth: node.depth,
          x: node.x,
          y: node.y,
          generated: node.generated,
          title: node.title,
          isCurrent: session.currentNodeId === node.id,
          relationshipType: this.getNodeRelationshipType(node, relationships),
        })),
        connections: relationships.map((rel) => ({
          fromNodeId: rel.sourceNodeId,
          toNodeId: rel.targetNodeId,
          type: rel.type,
        })),
        navigationPath: navigationSteps.map((step) => ({
          fromDepth: step.fromDepth,
          fromX: step.fromX,
          toDepth: step.toDepth,
          toX: step.toX,
          direction: step.direction,
        })),
        bounds,
      };

      this.sendToSession(sessionId, roomManager, {
        type: MessageType.MINIMAP_DATA,
        payload: {
          sessionId,
          miniMapData,
        },
      });
    } catch (error) {
      console.error("Error getting mini map:", error);
      this.sendToSession(sessionId, roomManager, {
        type: MessageType.SESSION_ERROR,
        payload: { message: "Failed to get mini map data" },
      });
    }
  }
  private async handleStartSearch(
    payload: StartSearchPayload,
    ws: WSContext<WebSocket>,
    roomManager: RoomManager
  ): Promise<void> {
    console.log("Handling start search with payload:", payload.query);

    try {
      // Start background ingestion (don't await)
      ingestArxiv(payload.query);
      ingestMediawiki(payload.query);

      const kbdata = await runMindsDBQuery(`
        SELECT * FROM ${MindsDBConfig.KB_NAME}
        WHERE content = ${sanitizeSQLValue(payload.query)}
        LIMIT 10;
      `);

      const { object }: { object: AINodeResponse } = await generateObject({
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

      // Create session in database
      const session = await prisma.session.create({
        data: {
          id: generateId("ssn"),
          initialQuery: payload.query,
          currentDepth: 0,
          currentX: 0,
          currentY: 0,
        },
      });

      const nodeId = generateId("node");

      // Create root node
      const rootNode = await prisma.node.create({
        data: {
          id: nodeId,
          sessionId: session.id,
          title: object.node.label,
          summary: object.node.content.substring(0, 200),
          content: object.node.content,
          generated: true,
          depth: 0,
          x: 0,
          y: 0,
        },
      });

      // Update session with current node
      await prisma.session.update({
        where: { id: session.id },
        data: { currentNodeId: rootNode.id },
      });

      // Create placeholder neighbors
      const neighbors = await this.createPlaceholderNeighbors(session.id, {
        depth: 0,
        x: 0,
        y: 0,
      });

      // Add socket to session room
      this.joinSessionRoom(ws, session.id, roomManager);

      // Send response only to this session
      this.sendToSession(session.id, roomManager, {
        type: MessageType.SESSION_CREATED,
        payload: {
          sessionId: session.id,
          rootNode: {
            id: rootNode.id,
            title: rootNode.title,
            summary: rootNode.summary,
            content: rootNode.content,
          },
          viewport: {
            focus: rootNode,
            neighbors,
          },
        },
      });

      await this.handleGetMiniMap({ sessionId: session.id }, ws, roomManager);
    } catch (error) {
      console.error("Error creating session:", error);
      this.sendErrorToSocket(ws, "Failed to create session");
    }
  }

  private async handleNavigate(
    payload: NavigatePayload,
    ws: WSContext<WebSocket>,
    roomManager: RoomManager
  ): Promise<void> {
    const { sessionId, direction } = payload;

    try {
      // Get current session state
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { currentNode: true },
      });

      if (!session) {
        throw new Error("Session not found");
      }

      // Calculate new position
      const newPosition = this.calculateNewPosition(
        {
          depth: session.currentDepth,
          x: session.currentX,
          y: session.currentY,
        },
        direction
      );

      // Find or create target node
      let targetNode = await prisma.node.findFirst({
        where: {
          sessionId,
          depth: newPosition.depth,
          x: newPosition.x,
          y: newPosition.y,
        },
      });

      if (!targetNode) {
        targetNode = await this.createPlaceholderNode(
          sessionId,
          newPosition,
          direction
        );
      }

      // Generate content if placeholder
      if (!targetNode.generated) {
        targetNode = await this.generateNodeContent(
          targetNode,
          direction,
          session.currentNode
        );
      }

      // Update session position
      await prisma.session.update({
        where: { id: sessionId },
        data: {
          currentNodeId: targetNode.id,
          currentDepth: newPosition.depth,
          currentX: newPosition.x,
          currentY: newPosition.y,
        },
      });

      // Save navigation step
      await this.saveNavigationStep(
        sessionId,
        session,
        newPosition,
        direction,
        targetNode.id
      );

      // Get viewport nodes
      const viewport = await this.getViewportNodes(sessionId, newPosition);

      // Send to session room only
      this.sendToSession(sessionId, roomManager, {
        type: MessageType.NAVIGATION_COMPLETE,
        payload: {
          sessionId,
          focusNode: targetNode,
          viewport,
        },
      });
      await this.handleGetMiniMap({ sessionId }, ws, roomManager);
    } catch (error) {
      console.error("Navigation error:", error);
      this.sendToSession(sessionId, roomManager, {
        type: MessageType.SESSION_ERROR,
        payload: { message: "Navigation failed" },
      });
    }
  }

  private async handleResumeSession(
    payload: ResumeSessionPayload,
    ws: WSContext<WebSocket>,
    roomManager: RoomManager
  ): Promise<void> {
    const { sessionId } = payload;

    try {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: { currentNode: true },
      });

      if (!session) {
        throw new Error("Session not found");
      }

      // Add socket to session room
      this.joinSessionRoom(ws, sessionId, roomManager);

      // Get current viewport
      const position: NodePosition = {
        depth: session.currentDepth,
        x: session.currentX,
        y: session.currentY,
      };
      const viewport = await this.getViewportNodes(sessionId, position);

      this.sendToSession(sessionId, roomManager, {
        type: MessageType.SESSION_CREATED,
        payload: {
          sessionId,
          rootNode: session.currentNode,
          viewport,
        },
      });
    } catch (error) {
      this.sendErrorToSocket(ws, "Failed to resume session");
    }
  }

  private async handleGetViewport(
    payload: GetViewportPayload,
    ws: WSContext<WebSocket>,
    roomManager: RoomManager
  ): Promise<void> {
    const { sessionId } = payload;

    try {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        throw new Error("Session not found");
      }

      const position: NodePosition = {
        depth: session.currentDepth,
        x: session.currentX,
        y: session.currentY,
      };
      const viewport = await this.getViewportNodes(sessionId, position);

      this.sendToSession(sessionId, roomManager, {
        type: MessageType.NODE_GENERATED,
        payload: {
          sessionId,
          viewport,
        },
      });
    } catch (error) {
      this.sendToSession(sessionId, roomManager, {
        type: MessageType.SESSION_ERROR,
        payload: { message: "Failed to get viewport" },
      });
    }
  }

  // Helper methods
  private joinSessionRoom(
    ws: WSContext<WebSocket>,
    sessionId: string,
    roomManager: RoomManager
  ): void {
    // Add session to socket's session set
    if (!roomManager.socketToSessions.has(ws)) {
      roomManager.socketToSessions.set(ws, new Set());
    }
    roomManager.socketToSessions.get(ws)!.add(sessionId);

    // Add socket to session room
    if (!roomManager.socketRooms.has(sessionId)) {
      roomManager.socketRooms.set(sessionId, new Set());
    }
    roomManager.socketRooms.get(sessionId)!.add(ws);
  }

  private sendToSession(
    sessionId: string,
    roomManager: RoomManager,
    message: Record<string, any>
  ): void {
    const room = roomManager.socketRooms.get(sessionId);
    if (room) {
      room.forEach((socket: WSContext<WebSocket>) => {
        socket.send(JSON.stringify(message));
      });
    }
  }

  private sendErrorToSocket(ws: WSContext<WebSocket>, message: string): void {
    ws.send(
      JSON.stringify({
        type: MessageType.SESSION_ERROR,
        payload: { message },
      })
    );
  }

  private calculateNewPosition(
    current: NodePosition,
    direction: "up" | "down" | "left" | "right"
  ): NodePosition {
    switch (direction) {
      case "up":
        return { ...current, depth: current.depth + 1 };
      case "down":
        return { ...current, depth: Math.max(0, current.depth - 1) };
      case "left":
        return { ...current, x: current.x - 1 };
      case "right":
        return { ...current, x: current.x + 1 };
      default:
        return current;
    }
  }

  private async createPlaceholderNode(
    sessionId: string,
    position: NodePosition,
    direction: string,
    parentNode?: Node
  ): Promise<Node> {
    // Determine relationship type
    const relationshipType = this.getRelationshipFromDirection(direction);

    // Create contextual title based on relationship
    const title = this.generatePlaceholderTitle(
      direction,
      relationshipType,
      parentNode
    );

    return await prisma.node.create({
      data: {
        sessionId,
        title,
        generated: false,
        depth: position.depth,
        x: position.x,
        y: position.y,
      },
    });
  }
  private getRelationshipFromDirection(direction: string): RelationshipType {
    switch (direction) {
      case "up":
        return RelationshipType.DEEP;
      case "left":
        return RelationshipType.RELATED;
      case "right":
        return RelationshipType.ALTERNATIVE;
      case "down":
        return RelationshipType.SIBLING; // Going back to parent level
      default:
        return RelationshipType.SIBLING;
    }
  }
  private generatePlaceholderTitle(
    direction: string,
    relationshipType: RelationshipType,
    parentNode?: Node
  ): string {
    const baseTopic = parentNode?.title || "Topic";

    switch (relationshipType) {
      case RelationshipType.DEEP:
        return `Deep dive into ${baseTopic}`;
      case RelationshipType.RELATED:
        return `Related to ${baseTopic}`;
      case RelationshipType.ALTERNATIVE:
        return `Alternative to ${baseTopic}`;
      default:
        return `${direction.toUpperCase()} Topic`;
    }
  }

  private async generateNodeContent(
    node: Node,
    direction: string,
    parentNode: Node | null
  ): Promise<Node> {
    const relationshipType = this.getRelationshipFromDirection(direction);
    const prompt = this.createContentPrompt(relationshipType, parentNode);

    const { object }: { object: GeneratedContent } = await generateObject({
      model: google("gemini-2.0-flash"),
      system: this.getSystemPromptForRelationship(relationshipType),
      schema: z.object({
        title: z.string(),
        summary: z.string(),
        content: z.string(),
      }),
      prompt,
    });

    // Save relationship in database
    if (parentNode) {
      await this.createNodeRelationship(
        parentNode.id,
        node.id,
        relationshipType
      );
    }

    return await prisma.node.update({
      where: { id: node.id },
      data: {
        title: object.title,
        summary: object.summary,
        content: object.content,
        generated: true,
      },
    });
  }

  private async createPlaceholderNeighbors(
    sessionId: string,
    position: NodePosition
  ): Promise<ViewportNodes> {
    const neighbors: ViewportNodes = {
      up: null,
      down: null,
      left: null,
      right: null,
    };

    // Create up neighbor (deeper)
    neighbors.up = await this.createPlaceholderNode(
      sessionId,
      { depth: position.depth + 1, x: position.x, y: position.y },
      "up"
    );

    // Create down neighbor (if not at root)
    if (position.depth > 0) {
      neighbors.down = await this.createPlaceholderNode(
        sessionId,
        { depth: position.depth - 1, x: position.x, y: position.y },
        "down"
      );
    }

    // Create left neighbor
    neighbors.left = await this.createPlaceholderNode(
      sessionId,
      { depth: position.depth, x: position.x - 1, y: position.y },
      "left"
    );

    // Create right neighbor
    neighbors.right = await this.createPlaceholderNode(
      sessionId,
      { depth: position.depth, x: position.x + 1, y: position.y },
      "right"
    );

    return neighbors;
  }

  private async getViewportNodes(
    sessionId: string,
    position: NodePosition
  ): Promise<ViewportNodes> {
    const neighbors: ViewportNodes = {
      up: null,
      down: null,
      left: null,
      right: null,
    };

    // Load existing neighbors or create placeholders
    const positions = [
      {
        key: "up" as const,
        depth: position.depth + 1,
        x: position.x,
        y: position.y,
      },
      {
        key: "down" as const,
        depth: position.depth - 1,
        x: position.x,
        y: position.y,
      },
      {
        key: "left" as const,
        depth: position.depth,
        x: position.x - 1,
        y: position.y,
      },
      {
        key: "right" as const,
        depth: position.depth,
        x: position.x + 1,
        y: position.y,
      },
    ];

    for (const pos of positions) {
      if (pos.key === "down" && pos.depth < 0) continue;

      let node = await prisma.node.findFirst({
        where: {
          sessionId,
          depth: pos.depth,
          x: pos.x,
          y: pos.y,
        },
      });

      if (!node) {
        node = await this.createPlaceholderNode(sessionId, pos, pos.key);
      }

      neighbors[pos.key] = {
        ...node,
        relationshipType: this.getRelationshipFromDirection(pos.key),
        direction: pos.key,
      };
    }

    return neighbors;
  }

  private async saveNavigationStep(
    sessionId: string,
    session: SessionData,
    newPosition: NodePosition,
    direction: string,
    nodeId: string
  ): Promise<void> {
    const stepCount = await prisma.navigationStep.count({
      where: { sessionId },
    });

    await prisma.navigationStep.create({
      data: {
        sessionId,
        nodeId,
        direction: direction.toUpperCase() as "UP" | "DOWN" | "LEFT" | "RIGHT",
        fromDepth: session.currentDepth,
        fromX: session.currentX,
        fromY: session.currentY,
        toDepth: newPosition.depth,
        toX: newPosition.x,
        toY: newPosition.y,
        stepIndex: stepCount + 1,
      },
    });
  }

  private createContentPrompt(
    relationshipType: RelationshipType,
    parentNode: Node | null
  ): string {
    const baseTopic = parentNode?.title || "the current topic";

    switch (relationshipType) {
      case RelationshipType.DEEP:
        return `Provide a deeper, more detailed exploration of a specific aspect of "${baseTopic}". Focus on technical details, mechanisms, or advanced concepts.`;

      case RelationshipType.RELATED:
        return `Suggest a topic that is related to "${baseTopic}" but explores a different angle or connected concept. Should be in the same domain but distinct.`;

      case RelationshipType.ALTERNATIVE:
        return `Provide an alternative approach, method, or perspective to "${baseTopic}". This could be a competing theory, different methodology, or contrasting viewpoint.`;

      default:
        return `Provide relevant content related to "${baseTopic}".`;
    }
  }

  private getSystemPromptForRelationship(
    relationshipType: RelationshipType
  ): string {
    switch (relationshipType) {
      case RelationshipType.DEEP:
        return "You are an expert educator providing in-depth, detailed explanations of complex topics. Focus on depth, technical accuracy, and comprehensive coverage.";

      case RelationshipType.RELATED:
        return "You are a knowledge connector, helping users discover related topics and concepts. Focus on finding meaningful connections and expanding understanding.";

      case RelationshipType.ALTERNATIVE:
        return "You are a critical thinker presenting alternative viewpoints and approaches. Focus on different perspectives, competing theories, or alternative methods.";

      default:
        return "You are a knowledgeable educator providing clear, informative content.";
    }
  }
  private async createNodeRelationship(
    sourceNodeId: string,
    targetNodeId: string,
    relationshipType: RelationshipType
  ): Promise<void> {
    await prisma.nodeRelationship.create({
      data: {
        sourceNodeId,
        targetNodeId,
        type: relationshipType,
      },
    });
  }
}
