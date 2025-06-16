import { useGlobal } from "@/store/global-state";
import { MessageType } from "@kbnet/shared";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export async function wsHandler(
  event: MessageEvent,
  socket: WebSocket,
  state = useGlobal.getState(),
  router: AppRouterInstance
): Promise<void> {
  try {
    const data = JSON.parse(event.data);
    const { type, payload } = data;
    switch (type) {
      case MessageType.PONG:
        console.log("Echo message received:", payload);
      case MessageType.SESSION_CREATED:
        // Store session ID and navigate to exploration page
        state.setSessionId(payload.sessionId);
        state.setCurrentNode({
          ...payload.rootNode,
          relationshipType: null, // Root node has no relationship
          direction: null,
        });
        state.setViewportNodes(payload.viewport);
        state.setNavigationHistory([]); // Reset navigation history for new session

        router.push(`/explore/${payload.sessionId}`);
        console.log("Session created:", payload.sessionId);
        state.setState("idle");
        break;

      case MessageType.NODE_GENERATED:
        // Update viewport with new node data
        state.setCurrentNode(payload.focusNode);
        state.setViewportNodes(payload.viewport);
        state.setState("idle");
        console.log("Node generated:", payload);
        break;

      case MessageType.NAVIGATION_COMPLETE:
        // Update current position after navigation and add to history
        const newNode = {
          ...payload.focusNode,
          relationshipType: payload.relationshipType,
          direction: payload.direction,
        };
        state.setCurrentNode(newNode);
        state.setViewportNodes(payload.viewport);

        // Add navigation step to history if provided
        if (payload.navigationStep) {
          state.addNavigationStep(payload.navigationStep);
        }

        state.setState("idle");
        console.log("Navigation complete:", payload);

        break;
      case MessageType.MINIMAP_DATA:
        // Update mini map data
        state.setMiniMapData(payload.miniMapData);
        state.setState("idle");
        console.log("Mini map data received:", payload.miniMapData);
        break;

      default:
        console.warn(`Unknown message type: ${type}`);
    }
  } catch (error) {
    console.error("Error handling WebSocket message:", error);
    state.setError("Failed to process server message");
    state.setState("error");
  }
}
