"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RelationshipType } from "@kbnet/db";

interface NodeCardProps {
  node: NodeData;
  variant: "focus" | "preview";
  direction?: "up" | "down" | "left" | "right";
  onClick?: () => void;
  className?: string;
  relationshipType?:
    | RelationshipType
    | "DEEP"
    | "RELATED"
    | "ALTERNATIVE"
    | "SIBLING"
    | "BACK"
    | "PARENT"
    | null
    | undefined;
  isBackDirection?: boolean;
}

export default function NodeCard({
  node,
  variant,
  direction,
  onClick,
  className,
  relationshipType,
  isBackDirection = false,
}: NodeCardProps) {
  // Use passed relationshipType or node's relationshipType or determine from direction
  const effectiveRelationshipType =
    relationshipType ||
    node.relationshipType ||
    getRelationshipFromDirection(direction, isBackDirection);

  const relationshipStyle = getRelationshipStyle(effectiveRelationshipType);
  const isGenerated = node.generated;

  return (
    <Card
      className={cn(
        "transition-all duration-300 cursor-pointer border-2 h-[88vh] rounded-lg shadow-sm hover:shadow-md py-2",
        relationshipStyle.borderColor,
        relationshipStyle.bgColor,
        variant === "focus" ? "w-full max-w-2xl" : "w-48",
        variant === "preview" && "hover:scale-105 opacity-80 hover:opacity-100",
        !isGenerated && "border-dashed opacity-60",
        isBackDirection && "ring-2 ring-yellow-400 ring-opacity-50",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className={cn(variant === "focus" ? "pb-3" : "pb-2")}>
        {variant === "preview" && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{relationshipStyle.icon}</span>
            <span className="text-xs font-medium text-muted-foreground">
              {isBackDirection ? "Back" : relationshipStyle.label}
            </span>
          </div>
        )}
        <CardTitle
          className={cn(
            variant === "focus" ? "text-xl" : "text-sm",
            !isGenerated && "text-muted-foreground"
          )}
        >
          {isGenerated
            ? node.title
            : getPlaceholderTitle(effectiveRelationshipType, isBackDirection)}
        </CardTitle>
      </CardHeader>

      <CardContent className={cn(variant === "preview" && "text-xs")}>
        {isGenerated ? (
          <>
            {node.summary && (
              <p className="text-muted-foreground mb-2">
                {variant === "focus"
                  ? node.summary
                  : node.summary.substring(0, 100) + "..."}
              </p>
            )}
            {variant === "focus" && node.content && (
              <div className="prose prose-sm max-w-none text-sm">
                <p>{node.content.substring(0, 200)}...</p>
              </div>
            )}
          </>
        ) : (
          <p className="text-muted-foreground text-sm">
            {getPlaceholderText(effectiveRelationshipType, isBackDirection)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function getRelationshipFromDirection(
  direction?: string,
  isBack?: boolean
): "DEEP" | "RELATED" | "ALTERNATIVE" | "SIBLING" | "BACK" {
  if (isBack) return "BACK";

  switch (direction) {
    case "up":
      return "DEEP";
    case "left":
      return "RELATED";
    case "right":
      return "ALTERNATIVE";
    case "down":
      return "SIBLING";
    default:
      return "SIBLING";
  }
}

const getRelationshipStyle = (type?: string) => {
  switch (type) {
    case "DEEP":
      return {
        borderColor: "border-blue-500",
        bgColor: "bg-blue-50/50 dark:bg-blue-900/20",
        icon: "🔍",
        label: "Deep Dive",
      };
    case "RELATED":
      return {
        borderColor: "border-green-500",
        bgColor: "bg-green-50/50 dark:bg-green-900/20",
        icon: "🔗",
        label: "Related",
      };
    case "ALTERNATIVE":
      return {
        borderColor: "border-orange-500",
        bgColor: "bg-orange-50/50 dark:bg-orange-900/20",
        icon: "🔄",
        label: "Alternative",
      };
    case "BACK":
      return {
        borderColor: "border-yellow-500",
        bgColor: "bg-yellow-50/50 dark:bg-yellow-900/20",
        icon: "↩️",
        label: "Back",
      };
    case "SIBLING":
      return {
        borderColor: "border-gray-500",
        bgColor: "bg-gray-50/50 dark:bg-gray-900/20",
        icon: "↩️",
        label: "Parent",
      };
    default:
      return {
        borderColor: "border-gray-300",
        bgColor: "bg-white/50 dark:bg-gray-800/50",
        icon: "📄",
        label: "Topic",
      };
  }
};

function getPlaceholderTitle(
  relationshipType?: string,
  isBackDirection?: boolean
): string {
  if (isBackDirection) return "Go Back";

  switch (relationshipType) {
    case "DEEP":
      return "Explore Deeper...";
    case "RELATED":
      return "Related Topic...";
    case "ALTERNATIVE":
      return "Alternative Approach...";
    case "BACK":
      return "Go Back...";
    case "SIBLING":
      return "Previous Level...";
    default:
      return "New Topic...";
  }
}

function getPlaceholderText(
  relationshipType?: string,
  isBackDirection?: boolean
): string {
  if (isBackDirection) return "Return to where you came from...";

  switch (relationshipType) {
    case "DEEP":
      return "Dive deeper into technical details and advanced concepts...";
    case "RELATED":
      return "Explore related topics and connected concepts...";
    case "ALTERNATIVE":
      return "Discover alternative approaches and perspectives...";
    case "BACK":
      return "Return to previous location...";
    case "SIBLING":
      return "Return to the parent level...";
    default:
      return "Loading content...";
  }
}
