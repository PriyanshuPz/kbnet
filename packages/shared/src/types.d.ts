import type { Node } from "../../database/generated/prisma";

export interface NewMapResult {
  mapId: string;
  currentNavigationStepId: string;
  currentPathBranchId: string;
  currentStepIndex: number;
  mainNode: Node;
  similarNode: Node | null;
  relatedNode: Node | null;
  deepNode: Node | null;
}

export interface UserStats {
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  badges: string[];
  xpNeededForNextLevel: number;
}

export interface AchievementNotification {
  type: "LEVEL_UP" | "STREAK_MAINTAINED" | "BADGE_UNLOCKED";
  message: string;
  confetti?: boolean;
  sound?: string;
  badge?: string;
  extra?: Record<string, any>;
}

export interface FlowNode {
  id: string;
  type: "stepNode";
  position: {
    x: number;
    y: number;
  };
  data: {
    label: number;
    title: string;
    summary: string;
    direction?: "LEFT" | "RIGHT" | "UP" | "INITIAL";
    nodeId: string;
    stepIndex: number;
    branchId: string;
    isCurrentStep: boolean;
    parentStepId?: string | null;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  animated: boolean;
  style: {
    stroke: string;
    strokeWidth: number;
  };
  type: "smoothstep" | "straight";
  data: {
    isBranchingPoint: boolean;
  };
}

export interface FlowData {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface BranchInfo {
  id: string;
  color: string;
  nodeCount: number;
  isFork: boolean;
  forkInfo?: {
    fromBranchId: string;
    atStepId: string;
    atStepTitle: string;
    atStepIndex: number;
  } | null;
  firstStepId: string;
  firstNodeId: string;
}

export interface FlowMetadata {
  branches: BranchInfo[];
  branchColors: Record<string, string>;
  currentStepId: string | null;
  currentBranchId: string | null;
  currentStepIndex: number;
  currentNodeId: string | null;
}

export interface MapBranchesResponse {
  mapId: string;
  flowData: FlowData;
  metadata: FlowMetadata;
}

export interface TimelineNode {
  id: string;
  data: {
    title: string;
    summary: string;
    direction?: "LEFT" | "RIGHT" | "UP" | "INITIAL";
    stepIndex: number;
    branchId: string;
  };
}

export interface Branch {
  id: string;
  isFork: boolean;
  color: string;
  nodes: TimelineNode[];
  forkInfo?: {
    fromBranchId: string;
    atStepTitle: string;
  };
}
