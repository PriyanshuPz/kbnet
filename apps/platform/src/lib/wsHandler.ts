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
      case MessageType.NEW_KMAP:
        const kmap = payload.id;
        router.push(`/kmap/${kmap}`);
        state.setState("idle"); // Reset state to idle after handling message
        console.log("Search result received:", payload);
        break;

      default:
        console.warn(`Unknown message type: ${type}`);
    }
  } catch (error) {
    console.error("Error handling WebSocket message:", error);
  }
}
