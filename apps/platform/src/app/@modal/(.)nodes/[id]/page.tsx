import NodeModal from "@/components/modals/node-modal";
import { getNodeData } from "@/lib/data";
import { notFound } from "next/navigation";

export default async function NodeModalPop({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const nodeId = (await params).id;
  const node = await getNodeData(nodeId);

  if (!node) {
    notFound();
  }

  return <NodeModal node={node} />;
}
