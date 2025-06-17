"use client";

import React, { useEffect, useState } from "react";
import { useGlobal } from "@/store/global-state";
import { sessionHelpers } from "@/lib/session";
import { GitBranch, X, GitCommit, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PathNode {
  id: string;
  stepIndex: number;
  title: string;
  branchId: string;
  isCurrentStep: boolean;
}

interface BranchData {
  id: string;
  nodes: PathNode[];
  color: string;
  isFork: boolean;
  forkPoint?: {
    fromBranchId: string;
    atStepTitle: string;
    atStepIndex: number;
  };
}

const BranchPath: React.FC<{
  branch: BranchData;
  onNodeClick: (branchId: string, stepId: string) => void;
}> = ({ branch, onNodeClick }) => {
  return (
    <div className="relative mb-8">
      {/* Branch Label */}
      <div className="flex items-center gap-2 mb-4">
        <Badge
          variant="outline"
          className="h-6 px-2 flex items-center gap-1"
          style={{ backgroundColor: branch.color, color: "white" }}
        >
          <GitCommit className="h-3 w-3" />
          {branch.isFork ? `Branch ${branch.nodes[0]?.stepIndex}` : "Main"}
        </Badge>
        {branch.isFork && branch.forkPoint && (
          <span className="text-xs text-muted-foreground">
            from step {branch.forkPoint.atStepIndex}
          </span>
        )}
      </div>

      {/* Branch Path */}
      <div className="relative pl-4">
        {/* Vertical Branch Line */}
        <div
          className="absolute left-[11px] top-2 bottom-2 w-0.5"
          style={{ backgroundColor: branch.color }}
        />

        {/* Steps */}
        <div className="space-y-4">
          {branch.nodes.map((node, index) => (
            <TooltipProvider key={node.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onNodeClick(branch.id, node.id)}
                    className="group flex items-center gap-3"
                  >
                    {/* Step Circle */}
                    <div
                      className={cn(
                        "relative z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center",
                        node.isCurrentStep
                          ? "bg-primary border-primary"
                          : "bg-background border-current"
                      )}
                      style={{ borderColor: branch.color }}
                    >
                      <span className="text-xs">{node.stepIndex}</span>
                    </div>

                    {/* Step Title (only show on hover or if current) */}
                    <span
                      className={cn(
                        "text-sm opacity-0 group-hover:opacity-100 transition-opacity",
                        node.isCurrentStep && "opacity-100 font-medium"
                      )}
                    >
                      {node.title}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{node.title}</p>
                  {index === 0 && branch.isFork && branch.forkPoint && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Branched from: {branch.forkPoint.atStepTitle}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function BranchTimeline() {
  const { map, navigateToBranch } = useGlobal();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [branches, setBranches] = useState<BranchData[]>([]);

  useEffect(() => {
    if (map.id) {
      sessionHelpers.getMapBranches(map.id);
    }
  }, [map.id]);

  useEffect(() => {
    const unsubscribe = useGlobal.subscribe((state: any) => {
      if (state.flowData && state.flowMetadata) {
        const processedBranches = state.flowMetadata.branches.map((branch) => ({
          id: branch.id,
          nodes: state.flowData.nodes
            .filter((node) => node.data.branchId === branch.id)
            .map((node) => ({
              id: node.id,
              stepIndex: node.data.stepIndex,
              title: node.data.title,
              branchId: branch.id,
              isCurrentStep: node.id === state.flowMetadata.currentStepId,
            })),
          color: state.flowMetadata.branchColors[branch.id] || "#888",
          isFork: branch.isFork,
          forkPoint: branch.forkInfo,
        }));
        setBranches(processedBranches);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!map.id || isCollapsed) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 shadow-md z-50"
        onClick={() => setIsCollapsed(false)}
      >
        <GitBranch className="h-4 w-4 mr-1" />
        History
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-[300px] h-[400px] bg-card shadow-lg rounded-lg border z-50">
      <div className="flex items-center justify-between p-2 border-b bg-muted">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4" />
          <span className="text-sm font-medium">Journey</span>
          <Badge variant="outline" className="h-5">
            {branches.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsCollapsed(true)}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100%_-_40px)] p-4">
        <div className="space-y-6">
          {branches.map((branch) => (
            <BranchPath
              key={branch.id}
              branch={branch}
              onNodeClick={navigateToBranch}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
