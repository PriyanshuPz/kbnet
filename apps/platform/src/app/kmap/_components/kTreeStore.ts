import { create } from "zustand";
import { simpleMLData } from "../_components/_data";

interface KTreeState {
  currentNode: KMapNode;
  explorationPath: KMapNode[];
  visitedIds: Set<string>;

  navigateUp: (node: KMapNode) => void;
  navigateRight: (node: KMapNode) => void;
  navigateLeft: (node: KMapNode) => void;
  navigateBack: () => void;
  resetExploration: () => void;
}

export const useKTreeStore = create<KTreeState>((set) => ({
  currentNode: simpleMLData, // Use the simpler data structure by default
  explorationPath: [simpleMLData],
  visitedIds: new Set([simpleMLData.id]),
  navigateUp: (node: KMapNode) =>
    set((state) => {
      const newPath = [...state.explorationPath, node];
      const newVisited = new Set(state.visitedIds);
      newVisited.add(node.id);
      return {
        currentNode: node,
        explorationPath: newPath,
        visitedIds: newVisited,
      };
    }),

  navigateRight: (node: KMapNode) =>
    set((state) => {
      const newPath = [...state.explorationPath, node];
      const newVisited = new Set(state.visitedIds);
      newVisited.add(node.id);
      return {
        currentNode: node,
        explorationPath: newPath,
        visitedIds: newVisited,
      };
    }),

  navigateLeft: (node: KMapNode) =>
    set((state) => {
      const newPath = [...state.explorationPath, node];
      const newVisited = new Set(state.visitedIds);
      newVisited.add(node.id);
      return {
        currentNode: node,
        explorationPath: newPath,
        visitedIds: newVisited,
      };
    }),

  navigateBack: () =>
    set((state) => {
      if (state.explorationPath.length <= 1) return state;
      const newPath = state.explorationPath.slice(0, -1);
      return {
        currentNode: newPath[newPath.length - 1],
        explorationPath: newPath,
      };
    }),

  resetExploration: () =>
    set((state) => {
      let rootNode = simpleMLData;
      return {
        currentNode: rootNode,
        explorationPath: [rootNode],
        visitedIds: new Set([rootNode.id]),
      };
    }),
}));
