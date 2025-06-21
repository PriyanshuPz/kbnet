import { useGlobal } from "@/store/global-state";
import { MessageType, pack } from "@kbnet/shared";

export const sessionHelpers = {
  // Start new exploration session
  startSearch: (query: string) => {
    const state = useGlobal.getState();
    state.setState("searching");
    state.send(pack(MessageType.START_SEARCH, { query }));
  },

  resumeMap: (id: string) => {
    const state = useGlobal.getState();
    state.setState("searching");
    state.setError(null);
    state.send(pack(MessageType.RESUME_MAP, { mapId: id }));
  },

  navigate: (
    nextNodeId: string,
    direction: "LEFT" | "RIGHT" | "UP",
    currentPathNodeId: string,
    currentPathBranchId: string
  ) => {
    const state = useGlobal.getState();

    state.setState("navigating");
    state.setError(null);

    console.log(`Navigating ${direction} to node ${nextNodeId}`);
    state.send(
      pack(MessageType.NAVIGATE, {
        nextNodeId,
        direction,
        currentPathNodeId,
        currentPathBranchId,
      })
    );
  },

  navigateBack: (currentPathNodeId: string, currentPathBranchId: string) => {
    const state = useGlobal.getState();
    state.setState("navigating");
    state.setError(null);
    state.send(
      pack(MessageType.NAVIGATE_BACK, {
        currentPathNodeId,
        currentPathBranchId,
      })
    );
  },

  getMapBranches: (mapId: string) => {
    const socket = useGlobal.getState().socket;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.error("Socket not connected");
      // useGlobal.getState().
      return;
    }
    socket.send(
      JSON.stringify({
        type: MessageType.GET_MAP_BRANCHES,
        payload: { mapId },
      })
    );
  },
};
