import Brand from "@/components/core/brand";
import Link from "next/link";
import ExplorationView from "../_components/exploration-view";
import { BranchMinimap } from "../_components/branch-map";

export default async function ExplorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden antialiased text-foreground dark:text-foreground-dark">
      <div className="flex items-center px-4 h-14 mt-3">
        <Link href="/pad" className="flex items-center gap-2">
          <Brand />
        </Link>
      </div>
      <BranchMinimap />
      <ExplorationView id={id} />
    </div>
  );
}
