import { useGlobal } from "@/store/global-state";
import { MessageType, pack } from "@kbnet/shared";

export const sessionHelpers = {
  // Start new exploration session
  startSearch: (query: string) => {
    const state = useGlobal.getState();
    state.setState("searching");
    state.send(pack(MessageType.START_SEARCH, { query }));
  },

  // Navigate in current session
  navigate: (direction: "up" | "down" | "left" | "right") => {
    const state = useGlobal.getState();
    if (!state.sessionId) {
      console.error("No active session for navigation");
      return;
    }

    state.setState("navigating");

    state.send(
      pack(MessageType.NAVIGATE, {
        sessionId: state.sessionId,
        direction,
      })
    );
  },

  // Resume existing session
  resumeSession: (sessionId: string) => {
    const state = useGlobal.getState();
    state.setState("loading");

    state.send(pack(MessageType.RESUME_SESSION, { sessionId }));
  },

  // Get current viewport
  getViewport: () => {
    const state = useGlobal.getState();
    if (!state.sessionId) return;

    state.send(pack(MessageType.GET_VIEWPORT, { sessionId: state.sessionId }));
  },
};
