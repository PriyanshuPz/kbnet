import ExplorationView from "../_components/exploration-view";
import { BranchMinimap } from "../_components/branch-map";

export default function ExplorePage() {
  return (
    <div className="w-full h-screen flex flex-col overflow-hidden antialiased text-foreground dark:text-foreground-dark">
      <div className="flex items-center px-4 h-14 mt-3"></div>
      <BranchMinimap />
      <ExplorationView />
    </div>
  );
}
