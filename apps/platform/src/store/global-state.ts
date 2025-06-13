import { WS_SERVER_URL } from "@/lib/utils";
import { wsHandler } from "@/lib/wsHandler";
import { create } from "zustand";

type Node = { id: string; label: string };
type Edge = { id: string; source: string; target: string };

interface WSState {
  socket: WebSocket | null;
  nodes: Node[];
  edges: Edge[];
  connectionStatus: "connecting" | "connected" | "disconnected";
  state: "loading" | "error" | "idle";
  setState: (state: "loading" | "error" | "idle") => void;
  error: string | null;
  setConnectionStatus: (
    status: "connecting" | "connected" | "disconnected"
  ) => void;
  setError: (error: string | null) => void;
  send: (msg: any) => void;
  setSocket: (socket: WebSocket | null) => void;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
}

export const useGlobal = create<WSState>((set, get) => ({
  socket: null,
  nodes: [],
  edges: [],
  connectionStatus: "connecting",
  state: "idle",
  setState: (state) => set({ state }),
  error: null,
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setError: (error) => set({ error }),
  setSocket: (socket) => {
    set({ socket });
  },
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
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
}));
