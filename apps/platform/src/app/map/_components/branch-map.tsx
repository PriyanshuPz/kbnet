"use client";

import React, { useEffect, useState, useRef } from "react";
import { useGlobal } from "@/store/global-state";
import { sessionHelpers } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  GitBranch,
  X,
  Maximize2,
  Minimize2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";

export const BranchMinimap = () => {
  const { branches, currentBranchId, map, navigateToBranch } = useGlobal();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [hoveredBranch, setHoveredBranch] = useState<string | null>(null);
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);

  // Fetch branches on component mount
  useEffect(() => {
    refetchBranches();
  }, [map.id]);

  async function refetchBranches() {
    if (map.id) {
      sessionHelpers.getMapBranches(map.id);
    }
  }
  // Track branch diversion information
  const branchDivergenceInfo = branches.reduce(
    (acc, branch) => {
      if (branch.parentBranchId) {
        const parentBranch = branches.find(
          (b) => b.id === branch.parentBranchId
        );
        if (parentBranch) {
          const forkStep = parentBranch.steps.find(
            (s) => s.id === branch.forkPoint
          );
          if (forkStep) {
            acc[branch.id] = {
              fromBranch: parentBranch.id,
              atStep: forkStep.title,
              stepIndex: parentBranch.steps.findIndex(
                (s) => s.id === branch.forkPoint
              ),
            };
          }
        }
      }
      return acc;
    },
    {} as Record<
      string,
      { fromBranch: string; atStep: string; stepIndex: number }
    >
  );

  // Color scheme for branches
  const branchColors = [
    "hsl(var(--primary))",
    "#e11d48", // rose
    "#0ea5e9", // sky
    "#84cc16", // lime
    "#8b5cf6", // violet
    "#f97316", // orange
    "#06b6d4", // cyan
  ];

  // For the git-like visualization
  const TimelineNode = ({
    step,
    idx,
    branchId,
    branchIdx,
    isCurrentStep,
  }: {
    step: any;
    idx: number;
    branchId: string;
    branchIdx: number;
    isCurrentStep: boolean;
  }) => {
    const color = branchColors[branchIdx % branchColors.length];
    const isHovered = hoveredStep === step.id || hoveredBranch === branchId;

    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn("group flex items-center my-3 transition-all")}
              onMouseEnter={() => setHoveredStep(step.id)}
              onMouseLeave={() => setHoveredStep(null)}
            >
              {/* Commit dot */}
              <div
                className={cn(
                  "relative flex-shrink-0 w-4 h-4 rounded-full border-2 z-10 transition-all",
                  isCurrentStep
                    ? "bg-primary border-primary-foreground"
                    : "bg-background"
                )}
                style={{ borderColor: color }}
                onClick={() => navigateToBranch(branchId, step.id)}
              >
                {isCurrentStep && (
                  <div className="absolute -inset-1 rounded-full bg-primary/20 animate-pulse" />
                )}
              </div>

              {/* Direction indicator */}
              {step.direction && (
                <div
                  className={cn(
                    "ml-2 flex items-center justify-center w-5 h-5 rounded-full border"
                  )}
                >
                  {step.direction === "LEFT" && (
                    <ChevronLeft className="h-3 w-3 text-blue-500" />
                  )}
                  {step.direction === "RIGHT" && (
                    <ChevronRight className="h-3 w-3 text-green-500" />
                  )}
                  {step.direction === "UP" && (
                    <ChevronUp className="h-3 w-3 text-purple-500" />
                  )}
                  {step.direction === "INITIAL" && (
                    <div className="h-3 w-3 bg-gray-300 rounded-full" />
                  )}
                </div>
              )}

              {/* Step info */}
              <div
                className={cn(
                  "ml-2 text-xs transition-all truncate max-w-[150px]",
                  isCurrentStep ? "font-semibold" : "text-muted-foreground",
                  isHovered ? "text-foreground" : ""
                )}
              >
                {idx}: {step.title}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">{step.title}</p>
              <p className="text-xs text-muted-foreground">
                Step {idx} in{" "}
                {branchId === currentBranchId ? "current branch" : "branch"}
              </p>
              {step.direction && (
                <p className="text-xs flex items-center gap-1">
                  Direction:
                  {step.direction === "LEFT" && (
                    <span className="text-blue-500">Similar</span>
                  )}
                  {step.direction === "RIGHT" && (
                    <span className="text-green-500">Related</span>
                  )}
                  {step.direction === "UP" && (
                    <span className="text-purple-500">Deeper</span>
                  )}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  if (branches.length === 0 && isCollapsed) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 left-4 shadow-md z-50"
        onClick={() => setIsCollapsed(false)}
      >
        <GitBranch className="h-4 w-4 mr-1" />
        History
      </Button>
    );
  }

  // Determine dimensions based on state
  const containerClass = cn(
    "fixed shadow-lg z-50 bg-card border rounded-lg overflow-hidden transition-all duration-200",
    isCollapsed
      ? "bottom-4 left-4 p-0 w-auto"
      : isMaximized
        ? "inset-4 w-auto"
        : "bottom-4 left-4 w-[320px]"
  );

  return (
    <motion.div
      className={containerClass}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {isCollapsed ? (
        <Button
          variant="outline"
          size="sm"
          className="shadow-md flex items-center gap-1"
          onClick={() => setIsCollapsed(false)}
        >
          <GitBranch className="h-4 w-4" />
          <span>History</span>
          {branches.length > 0 && (
            <Badge className="ml-1 h-5 px-1">{branches.length}</Badge>
          )}
        </Button>
      ) : (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-muted p-2 flex items-center justify-between border-b">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              <h3 className="text-sm font-medium">Timeline</h3>
              {branches.length > 0 && (
                <Badge variant="outline" className="ml-1 h-5 px-1">
                  {branches.length}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => refetchBranches()}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsMaximized(!isMaximized)}
              >
                {isMaximized ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsCollapsed(true)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Git timeline visualization */}
          <div
            className={cn(
              "p-4 overflow-auto",
              isMaximized ? "flex-1" : "max-h-[500px]"
            )}
          >
            {branches.length === 0 ? (
              <div className="text-sm text-muted-foreground flex items-center justify-center h-20">
                No exploration history yet
              </div>
            ) : (
              <div className="relative">
                <div className="relative pt-2 pb-4">
                  {branches.map((branch, branchIdx) => {
                    const color = branchColors[branchIdx % branchColors.length];
                    const divInfo = branchDivergenceInfo[branch.id];

                    return (
                      <div
                        key={branch.id}
                        className="mb-6"
                        onMouseEnter={() => setHoveredBranch(branch.id)}
                        onMouseLeave={() => setHoveredBranch(null)}
                      >
                        {/* Branch header */}
                        <div
                          className="flex items-center mb-1 ml-12"
                          style={{ marginLeft: 50 + branchIdx * 30 }}
                        >
                          <Badge
                            variant={
                              branch.id === currentBranchId
                                ? "default"
                                : "outline"
                            }
                            className="px-2 py-0.5 text-xs"
                            style={{
                              backgroundColor:
                                branch.id === currentBranchId
                                  ? color
                                  : "transparent",
                              borderColor: color,
                              color:
                                branch.id === currentBranchId ? "white" : color,
                            }}
                          >
                            {branch.id === currentBranchId ? "HEAD" : "Branch"}
                          </Badge>

                          {divInfo && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant="outline"
                                    className="ml-2 px-1.5 py-0.5 text-xs cursor-help"
                                  >
                                    forked
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="space-y-1 max-w-xs">
                                    <p className="text-xs">
                                      Forked from "{divInfo.atStep}"
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      This branch diverged at step{" "}
                                      {divInfo.stepIndex} of another branch
                                    </p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>

                        {/* Timeline nodes */}
                        <div
                          className="relative"
                          style={{ marginLeft: branchIdx * 30 }}
                        >
                          {branch.steps.map((step, idx) => (
                            <div
                              key={step.id}
                              className="flex items-start"
                              style={{
                                marginLeft: `${15}px`,
                                height:
                                  idx < branch.steps.length - 1
                                    ? "40px"
                                    : "auto",
                              }}
                            >
                              <TimelineNode
                                step={step}
                                idx={idx}
                                branchId={branch.id}
                                branchIdx={branchIdx}
                                isCurrentStep={
                                  map.currentNavigationStepId === step.id
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};
