import { useGlobal } from "@/store/global-state";
import {
  AchievementNotification,
  MessageType,
  NewMapResult,
  UserStats,
} from "@kbnet/shared";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "sonner";

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
        const data = payload as NewMapResult;
        setMapData(data, state);
        router.push(`/map/${data.mapId}`);

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
        state.setBranches(payload.branches);
        state.setCurrentBranchId(payload.currentBranchId);
        state.setState("idle");
        break;
      }

      case MessageType.ERROR: {
        const errorMessage = payload.error || "An unknown error occurred";
        state.setError(errorMessage);
        state.setState("error");
        break;
      }

      case MessageType.SHOW_NOTIFICATION: {
        const { message, confetti, sound, badge, extra } =
          payload as AchievementNotification;
        state.setState("idle");
        state.setError(null);
        toast.info(message, {
          style: {
            maxWidth: "400px",
            whiteSpace: "normal",
            wordWrap: "break-word",
          },
          className: "bg-card text-card-foreground border-2 border-black",
          duration: 5000,
          icon: confetti ? "🎉" : undefined,
        });
        // state.showNotification({
        //   message,
        //   confetti: confetti || false,
        //   sound: sound || "default",
        //   badge: badge || null,
        //   extra: extra || {},
        // });
        break;
      }
      case MessageType.USER_STAT: {
        const userStats = payload as UserStats;
        state.setUserStats(userStats);
        state.setState("idle");
        break;
      }
      case MessageType.NODE_UPDATED: {
        const { node, currentNode } = payload as any;

        const { nodeId, title, summary, generated, updatedAt } = node;
        const state = useGlobal.getState();

        // Update the appropriate node in the state
        if (state.deepNode?.id === nodeId) {
          state.setDeepNode({
            ...state.deepNode,
            title,
            summary,
            generated,
            updatedAt: new Date(),
          } as any);
        } else if (state.relatedNode?.id === nodeId) {
          state.setRelatedNode({
            ...state.relatedNode,
            title,
            summary,
            generated,
            updatedAt: new Date(),
          } as any);
        } else if (state.similarNode?.id === nodeId) {
          state.setSimilarNode({
            ...state.similarNode,
            title,
            summary,
            generated,
            updatedAt: new Date(),
          } as any);
        }

        state.setCurrentNode({
          ...currentNode,
          title: currentNode.title,
          summary: currentNode.summary,
          generated: currentNode.generated,
          updatedAt: new Date(),
        } as any);
        // Show a subtle toast notification when content is ready
        if (generated) {
          toast.success(`Read ${title}`, {
            duration: 500,
          });
        }
        state.setState("idle");
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
