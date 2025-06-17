import { NavigationStep, Node } from "@kbnet/db";
import { Branch, FlowMetadata, TimelineNode } from "@kbnet/shared";
import { create } from "zustand";

type MapState = {
  id: string | null;
  currentNavigationStepId: string | null;
  currentPathBranchId: string;
  currentStepIndex: number;
};

interface FlowData {
  nodes: Array<{
    id: string;
    data: {
      title: string;
      summary: string;
      direction?: "LEFT" | "RIGHT" | "UP" | "INITIAL";
      stepIndex: number;
      branchId: string;
      isCurrentStep: boolean;
    };
  }>;
  edges: Array<any>;
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

  flowData: {
    nodes: TimelineNode[];
    edges: any[];
  } | null;

  flowMetadata: {
    branches: Array<{
      id: string;
      isFork: boolean;
      forkInfo?: {
        fromBranchId: string;
        atStepTitle: string;
      };
      nodeCount: number;
    }>;
    branchColors: Record<string, string>;
    currentStepId: string | null;
    currentBranchId: string | null;
  } | null;
  setFlowData: (data: any) => void;

  setFlowMetadata: (metadata: any) => void;

  // Reset flow state
  resetFlowState: () => void;

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
  setConnectionStatus: (status: ConnectionStatus) =>
    set({ connectionStatus: status }),
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
      flowData: null,
      flowMetadata: null,
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

  // Flow state
  flowData: null,
  setFlowData: (data) => set({ flowData: data }),

  flowMetadata: null,
  setFlowMetadata: (metadata) => set({ flowMetadata: metadata }),

  resetFlowState: () =>
    set({
      flowData: null,
      flowMetadata: null,
    }),

  // Branches management
  branches: [],
  currentBranchId: null,
  setBranches: (branches) => set({ branches }),
  setCurrentBranchId: (branchId) => set({ currentBranchId: branchId }),
  navigateToBranch: (branchId, stepId) => {
    // Send message to server to navigate to this specific branch and step
    // const socket = get().socket;
    // if (socket && socket.readyState === WebSocket.OPEN) {
    //   socket.send(JSON.stringify({
    //     type: MessageType.NAVIGATE_TO_BRANCH_STEP,
    //     payload: { branchId, stepId }
    //   }));
    // }
  },
}));
