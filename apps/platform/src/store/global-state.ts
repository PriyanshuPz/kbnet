import { create } from "zustand";

interface WSState {
  // WebSocket connection state
  socket: WebSocket | null;
  setSocket: (socket: WebSocket | null) => void;
  connectionStatus: "connecting" | "connected" | "disconnected";
  setConnectionStatus: (
    status: "connecting" | "connected" | "disconnected"
  ) => void;
  send: (msg: any) => void;

  // Global state for the application error handling
  error: string | null;
  setError: (error: string | null) => void;

  // Global state for managing the application state
  state: "loading" | "error" | "idle";
  setState: (state: "loading" | "error" | "idle") => void;
  kmapId: string | null;
  setKmapId: (id: string | null) => void;
}

export const useGlobal = create<WSState>((set, get) => ({
  // Initial state for WebSocket connection
  socket: null,
  setSocket: (socket) => {
    set({ socket });
  },
  connectionStatus: "connected",
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  send: (msg) => {
    const socket = get().socket;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(msg);
      set({
        state: "loading",
        error: null,
      });
    }
  },

  // Global state for error handling
  error: null,
  setError: (error) => set({ error }),

  // Global state for kmapId
  setState: (state) => set({ state }),
  state: "idle",
  kmapId: null,
  setKmapId: (id) => set({ kmapId: id }),
}));
