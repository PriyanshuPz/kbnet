import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Badge } from "@/components/ui/badge";
import { BookOpen, LucideIcon } from "lucide-react";

interface NodeData {
  title: string;
  content?: string;
  source: string;
  relevance?: string;
  isMain?: boolean;
  kmapId?: string;
  icon?: LucideIcon;
}

export const KnowledgeNode = memo<NodeProps<NodeData>>(
  ({ data, isConnectable }) => {
    const Icon = data.icon || BookOpen;

    return (
      <div className="relative p-4 rounded-xl border-2 border-primary/40 bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-slate-900 shadow-lg max-w-[280px]">
        {/* Quantum particles decoration */}
        <div className="absolute -inset-1 blur-sm opacity-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl pointer-events-none z-[-1]"></div>

        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="text-primary p-1 rounded-md bg-primary/10">
              <Icon size={16} />
            </div>
            <span className="text-xs text-muted-foreground capitalize">
              {data.source || "Source"}
            </span>
          </div>

          <Badge
            variant="outline"
            className="bg-primary/10 text-primary font-medium"
          >
            {data.relevance || "Medium"}
          </Badge>
        </div>

        <h3 className="font-semibold text-foreground leading-tight mb-2">
          {data.title}
        </h3>

        {data.content && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-1">
            {data.content}
          </p>
        )}

        {/* Subtle quantum visualization */}
        <div className="absolute -z-10 bottom-0 left-0 right-0 h-12 opacity-10 bg-gradient-to-t from-blue-500 to-transparent rounded-b-xl pointer-events-none"></div>

        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 border-2 border-background bg-primary bottom-[-8px]"
          isConnectable={isConnectable}
        />

        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 border-2 border-background bg-primary top-[-8px]"
          isConnectable={isConnectable}
        />
      </div>
    );
  }
);

KnowledgeNode.displayName = "KnowledgeNode";
