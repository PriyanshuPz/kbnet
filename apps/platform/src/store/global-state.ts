import { Node } from "@kbnet/db/types";
import { UserStats } from "@kbnet/shared";
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

type AppState = "loading" | "error" | "idle" | "searching" | "navigating";

type ConnectionStatus = "connecting" | "connected" | "disconnected";

interface GlobalState {
  // WebSocket
  socket: WebSocket | null;
  setSocket: (socket: WebSocket | null) => void;
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;
  send: (msg: any) => void;

  // App State
  error: string | null;
  setError: (error: string | null) => void;
  state: AppState;
  setState: (state: AppState) => void;

  // Map State
  map: MapState;
  setMap: (map: MapState) => void;
  setMapId: (id: string | null) => void;
  setCurrentNavigationStepId: (stepId: string | null) => void;
  setCurrentPathBranchId: (branchId: string) => void;
  setCurrentStepIndex: (index: number) => void;
  resetMap: () => void;

  // Nodes
  currentNode: Node | null;
  setCurrentNode: (node: Node | null) => void;
  deepNode: Node | null;
  setDeepNode: (node: Node | null) => void;
  relatedNode: Node | null;
  setRelatedNode: (node: Node | null) => void;
  similarNode: Node | null;
  setSimilarNode: (node: Node | null) => void;
  hasNodeInDirection: (direction: "UP" | "LEFT" | "RIGHT") => boolean;
  getNodeInDirection: (direction: "UP" | "LEFT" | "RIGHT") => Node | null;
  // Branches
  branches: Branch[];
  currentBranchId: string | null;
  setBranches: (branches: Branch[]) => void;
  setCurrentBranchId: (branchId: string | null) => void;
  navigateToBranch: (branchId: string, stepId: string) => void;

  // User Stats
  userStats: UserStats | null;
  setUserStats: (stats: UserStats) => void;
  updateXp: (xp: number) => void;
  updateLevel: (level: number) => void;
  updateStreak: (currentStreak: number, longestStreak: number) => void;
  addBadge: (badge: string) => void;
}

export const useGlobal = create<GlobalState>((set, get) => ({
  // WebSocket
  socket: null,
  setSocket: (socket) => set({ socket }),
  connectionStatus: "connecting",
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  retryConnection: () => {
    const socket = get().socket;
    if (socket) {
      socket.close();
      set({ socket: null, connectionStatus: "connecting" });
    }

    // Logic to re-establish the WebSocket connection
    // This could be a function that creates a new WebSocket instance
  },
  send: (msg) => {
    const socket = get().socket;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(msg);
      set({ state: "loading", error: null });
    } else {
      console.error("Cannot send message: WebSocket not connected");
      set({
        error: "Connection lost. Please refresh the page.",
        state: "error",
      });
    }
  },

  // App State
  error: null,
  setError: (error) => set({ error }),
  state: "idle",
  setState: (state) => set({ state }),

  // Map State
  map: {
    id: null,
    currentNavigationStepId: null,
    currentPathBranchId: "",
    currentStepIndex: 0,
  },
  setMap: (map) => set({ map }),
  setMapId: (id) =>
    set((state) => ({
      map: { ...state.map, id },
    })),
  setCurrentNavigationStepId: (stepId) =>
    set((state) => ({
      map: { ...state.map, currentNavigationStepId: stepId },
    })),
  setCurrentPathBranchId: (branchId) =>
    set((state) => ({
      map: { ...state.map, currentPathBranchId: branchId },
    })),
  setCurrentStepIndex: (index) =>
    set((state) => ({
      map: { ...state.map, currentStepIndex: index },
    })),
  resetMap: () =>
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
    }),

  // Nodes
  currentNode: null,
  setCurrentNode: (node) => set({ currentNode: node }),
  deepNode: null,
  setDeepNode: (node) => set({ deepNode: node }),
  relatedNode: null,
  setRelatedNode: (node) => set({ relatedNode: node }),
  similarNode: null,
  setSimilarNode: (node) => set({ similarNode: node }),
  hasNodeInDirection: (direction) => {
    const state = get();
    switch (direction) {
      case "UP":
        return state.deepNode ? state.deepNode.generated : false;
      case "LEFT":
        return state.currentNode ? state.currentNode.generated : false;
      case "RIGHT":
        return state.relatedNode ? state.relatedNode.generated : false;
      default:
        return false;
    }
  },
  getNodeInDirection: (direction) => {
    const state = get();
    switch (direction) {
      case "UP":
        return state.deepNode;
      case "LEFT":
        return state.currentNode;
      case "RIGHT":
        return state.relatedNode;
      default:
        return null;
    }
  },

  // Branches
  branches: [],
  currentBranchId: null,
  setBranches: (branches) => set({ branches }),
  setCurrentBranchId: (branchId) => set({ currentBranchId: branchId }),
  navigateToBranch: (branchId, stepId) => {
    set((state) => ({
      currentBranchId: branchId,
      map: {
        ...state.map,
        currentNavigationStepId: stepId,
        currentPathBranchId: branchId,
      },
    }));
  },

  // User Stats
  userStats: null,
  setUserStats: (stats) => set({ userStats: stats }),
  updateXp: (xp) =>
    set((state) => ({
      userStats: state.userStats
        ? { ...state.userStats, xp }
        : {
            xp,
            level: 1,
            currentStreak: 0,
            longestStreak: 0,
            badges: [],
            xpNeededForNextLevel: 0,
          }, // Default values if userStats is null
    })),
  updateLevel: (level) =>
    set((state) => ({
      userStats: state.userStats ? { ...state.userStats, level } : null,
    })),
  updateStreak: (currentStreak, longestStreak) =>
    set((state) => ({
      userStats: state.userStats
        ? { ...state.userStats, currentStreak, longestStreak }
        : null,
    })),
  addBadge: (badge) =>
    set((state) => ({
      userStats: state.userStats
        ? {
            ...state.userStats,
            badges: state.userStats.badges.includes(badge)
              ? state.userStats.badges
              : [...state.userStats.badges, badge],
          }
        : null,
    })),
}));
