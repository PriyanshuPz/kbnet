import { NavigationStep } from "@kbnet/db";
import { MessageType, pack } from "@kbnet/shared";
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

  // Session management
  sessionId: string | null;
  setSessionId: (sessionId: string | null) => void;
  currentNode: NodeData | null;
  setCurrentNode: (node: NodeData | null) => void;
  viewportNodes: ViewportNodes | null;
  setViewportNodes: (nodes: ViewportNodes | null) => void;

  // Navigation history management
  navigationHistory: NavigationStep[] | null;
  setNavigationHistory: (history: NavigationStep[]) => void;

  // Add individual navigation step
  addNavigationStep: (step: NavigationStep) => void;

  // Get last navigation direction
  getLastDirection: () => "up" | "down" | "left" | "right" | null;

  // Get back direction based on history
  getBackDirection: () => "up" | "down" | "left" | "right" | null;

  // Global state for the application error handling
  error: string | null;
  setError: (error: string | null) => void;

  // Global state for managing the application state
  state: "loading" | "error" | "idle" | "searching" | "navigating";
  setState: (
    state: "loading" | "error" | "idle" | "searching" | "navigating"
  ) => void;

  // Mini map data
  miniMapData: MiniMapData | null;
  setMiniMapData: (data: MiniMapData | null) => void;
  requestMiniMap: () => void;
}

export const useGlobal = create<WSState>((set, get) => ({
  // Initial state for WebSocket connection
  socket: null,
  setSocket: (socket) => {
    set({ socket });
  },
  connectionStatus: "connecting",
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

  // Session management
  sessionId: null,
  setSessionId: (sessionId) => set({ sessionId }),
  currentNode: null,
  setCurrentNode: (node) => set({ currentNode: node }),
  viewportNodes: null,
  setViewportNodes: (nodes) => set({ viewportNodes: nodes }),

  // Navigation history management
  navigationHistory: null,
  setNavigationHistory: (history) => set({ navigationHistory: history }),

  addNavigationStep: (step) => {
    const currentHistory = get().navigationHistory || [];
    set({ navigationHistory: [...currentHistory, step] });
  },

  getLastDirection: () => {
    const history = get().navigationHistory;
    if (!history || history.length === 0) return null;

    const lastStep = history[history.length - 1];
    return lastStep.direction.toLowerCase() as "up" | "down" | "left" | "right";
  },

  getBackDirection: () => {
    const lastDirection = get().getLastDirection();
    if (!lastDirection) return null;

    // Return opposite direction
    switch (lastDirection) {
      case "up":
        return "down";
      case "down":
        return "up";
      case "left":
        return "right";
      case "right":
        return "left";
      default:
        return null;
    }
  },

  // Global state for error handling
  error: null,
  setError: (error) => set({ error }),

  // Global state management
  setState: (state) => set({ state }),
  state: "idle",

  // Mini map management
  miniMapData: null,
  setMiniMapData: (data) => set({ miniMapData: data }),

  requestMiniMap: () => {
    const { sessionId, send } = get();
    if (sessionId) {
      send(pack(MessageType.GET_MINIMAP, { sessionId }));
    }
  },
}));
