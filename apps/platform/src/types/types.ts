interface KMapNode {
  id: string;
  kmapId: string;
  label: string;
  content: string;
  source: string;

  deepNodeId?: string | null;
  connectedNodeAId?: string | null;
  connectedNodeBId?: string | null;

  deepNode?: KMapNode | null;
  connectedNodeA?: KMapNode;
  connectedNodeB?: KMapNode;

  depth: number;
  createdAt: Date;
}
interface SwipeDirection {
  up: boolean;
  right: boolean;
  left: boolean;
  down: boolean;
}
