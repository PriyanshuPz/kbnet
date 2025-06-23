import ExplorationView from "../_components/exploration-view";
import { BranchMinimap } from "../_components/branch-map";
import { AssistantProvider } from "@/providers/assistant-runtime";
import { AssistantModal } from "@/components/assistant-ui/assistant-modal";

export default function ExplorePage() {
  return (
    <div className="w-full h-screen flex flex-col overflow-hidden antialiased text-foreground dark:text-foreground-dark">
      <AssistantProvider>
        <BranchMinimap />
        <ExplorationView />
        <AssistantModal />
      </AssistantProvider>
    </div>
  );
}
