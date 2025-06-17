import { Node } from "@kbnet/db";
import { create } from "zustand";

type MapState = {
  id: string | null;
  currentNavigationStepId: string | null;
  currentPathBranchId: string;
  currentStepIndex: number;
};

interface Branch {
  id: string;
  steps: {
    id: string;
    nodeId: string;
    title: string;
    stepIndex: number;
    direction: string;
    parentStepId: string | null;
  }[];
  parentBranchId: string | null;
  forkPoint: string | null;
}

type AppState =
  | "loading" // Initial loading or general loading
  | "error" // Error state
  | "idle" // Ready for user interaction
  | "searching" // Searching for new topics
  | "navigating"; // Actively navigating between nodes

type ConnectionStatus = "connecting" | "connected" | "disconnected";

interface WSState {
  // WebSocket connection state
  socket: WebSocket | null;
  setSocket: (socket: WebSocket | null) => void;
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;
  send: (msg: any) => void;

  // Global state for the application error handling
  error: string | null;
  setError: (error: string | null) => void;

  // Global state for managing the application state
  state: AppState;
  setState: (state: AppState) => void;

  // Map
  map: MapState;
  setMap: (map: MapState) => void;
  setMapId: (id: string | null) => void;
  setCurrentNavigationStepId: (stepId: string | null) => void;
  setCurrentPathBranchId: (branchId: string) => void;
  setCurrentStepIndex: (index: number) => void;
  resetMap: () => void;

  // current nodes state
  currentNode: Node | null;
  setCurrentNode: (node: Node | null) => void;

  deepNode: Node | null;
  setDeepNode: (node: Node | null) => void;

  relatedNode: Node | null;
  setRelatedNode: (node: Node | null) => void;

  similarNode: Node | null;
  setSimilarNode: (node: Node | null) => void;

  // Helper for checking if a specific node direction is available
  hasNodeInDirection: (direction: "UP" | "LEFT" | "RIGHT") => boolean;

  // Branches management
  branches: Branch[];
  currentBranchId: string | null;

  setBranches: (branches: Branch[]) => void;
  setCurrentBranchId: (branchId: string | null) => void;
  navigateToBranch: (branchId: string, stepId: string) => void;
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

      // Don't set loading state for certain message types if needed
      set({
        state: "loading",
        error: null,
      });
    } else {
      console.error("Cannot send message: WebSocket not connected");
      set({
        error: "Connection lost. Please refresh the page.",
        state: "error",
      });
    }
  },

  // Global state for error handling
  error: null,
  setError: (error) => set({ error }),

  // Global state management
  setState: (state) => set({ state }),
  state: "idle",

  // Map state management
  map: {
    id: null,
    currentNavigationStepId: null,
    currentPathBranchId: "",
    currentStepIndex: 0,
  },
  setMap: (map) => set({ map }),
  setMapId: (id) => {
    set((state) => ({
      map: {
        ...state.map,
        id,
      },
    }));
  },
  setCurrentNavigationStepId: (stepId) => {
    set((state) => ({
      map: {
        ...state.map,
        currentNavigationStepId: stepId,
      },
    }));
  },
  setCurrentPathBranchId: (branchId) => {
    set((state) => ({
      map: {
        ...state.map,
        currentPathBranchId: branchId,
      },
    }));
  },
  setCurrentStepIndex: (index) => {
    set((state) => ({
      map: {
        ...state.map,
        currentStepIndex: index,
      },
    }));
  },
  resetMap: () => {
    set({
      map: {
        id: null,
        currentNavigationStepId: null,
        currentPathBranchId: "",
        currentStepIndex: 0,
      },
      currentNode: null,
      deepNode: null,
      relatedNode: null,
      similarNode: null,
      error: null,
      state: "idle",
    });
  },

  // Current nodes state
  currentNode: null,
  setCurrentNode: (node) => set({ currentNode: node }),
  deepNode: null,
  setDeepNode: (node) => set({ deepNode: node }),
  relatedNode: null,
  setRelatedNode: (node) => set({ relatedNode: node }),
  similarNode: null,
  setSimilarNode: (node) => set({ similarNode: node }),

  // Helper function to check if a direction has an available node
  hasNodeInDirection: (direction) => {
    const state = get();
    switch (direction) {
      case "UP":
        return !!state.deepNode;
      case "LEFT":
        return !!state.similarNode;
      case "RIGHT":
        return !!state.relatedNode;
      default:
        return false;
    }
  },

  // Branches management
  branches: [],
  currentBranchId: null,

  navigateToBranch: (branchId, stepId) => {
    // set({
    //   currentBranchId: branchId,
    //   map: {
    //     ...get().map,
    //     currentNavigationStepId: stepId,
    //     currentPathBranchId: branchId,
    //   },
    // });
  },

  setBranches: (branches) => set({ branches }),
  setCurrentBranchId: (branchId) => set({ currentBranchId: branchId }),
}));
