import { useGlobal } from "@/store/global-state";
import { MapBranchesResponse, MessageType, NewMapResult } from "@kbnet/shared";
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

    // First set loading state for all messages except ERROR
    if (type !== MessageType.ERROR) {
      state.setState("loading");
    }

    switch (type) {
      case MessageType.PONG:
        console.log("Echo message received:", payload);
      case MessageType.MAP_CREATED:
        // Store session ID and navigate to exploration page
        const data = payload as NewMapResult;
        setMapData(data, state);
        router.push(`/explore/${data.mapId}`);

        console.log("Map created:", data.mapId);
        state.setState("idle");
        break;

      case MessageType.MAP_DATA: {
        const data = payload as NewMapResult;
        setMapData(data, state);
        state.setState("idle");
        break;
      }

      case MessageType.MAP_BRANCHES: {
        const branchData = payload as MapBranchesResponse;
        state.setFlowData(branchData.flowData);
        state.setFlowMetadata(branchData.metadata);
        state.setState("idle");
        break;
      }

      case MessageType.ERROR: {
        const errorMessage = payload.error || "An unknown error occurred";
        state.setError(errorMessage);
        state.setState("error");
        break;
      }

      default:
        console.warn(`Unknown message type: ${type}`);
    }
  } catch (error) {
    console.error("Error handling WebSocket message:", error);
    state.setError("Failed to process server message");
    state.setState("error");
  }
}

function setMapData(data: NewMapResult, state = useGlobal.getState()): void {
  // Clear any previous errors
  state.setError(null);

  state.setMap({
    id: data.mapId,
    currentNavigationStepId: data.currentNavigationStepId,
    currentPathBranchId: data.currentPathBranchId,
    currentStepIndex: data.currentStepIndex,
  });
  state.setCurrentNode(data.mainNode);
  state.setDeepNode(data.deepNode);
  state.setRelatedNode(data.relatedNode);
  state.setSimilarNode(data.similarNode);
}
