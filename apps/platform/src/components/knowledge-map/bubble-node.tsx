import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { BookOpen, LucideIcon } from "lucide-react";

interface NodeData {
  title: string;
  content?: string;
  source: string;
  isMain?: boolean;
  kmapId?: string;
  icon?: LucideIcon;
}

export const BubbleNode = memo<NodeProps<NodeData>>(
  ({ data, isConnectable }) => {
    const Icon = data.icon || BookOpen;

    return (
      <div className="relative p-3 rounded-lg border border-purple-200 dark:border-purple-900/40 bg-white/90 dark:bg-slate-900/90 shadow-sm max-w-[180px] backdrop-blur-sm">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="text-purple-500 dark:text-purple-400">
            <Icon size={14} />
          </div>
          <span className="text-xs text-muted-foreground font-medium truncate">
            {data.title}
          </span>
        </div>

        {data.content && (
          <p className="text-xs text-muted-foreground line-clamp-2 opacity-80">
            {data.content}
          </p>
        )}

        <Handle
          type="source"
          position={Position.Bottom}
          className="w-2 h-2 border-2 border-background bg-purple-500"
          isConnectable={isConnectable}
        />

        <Handle
          type="target"
          position={Position.Top}
          className="w-2 h-2 border-2 border-background bg-purple-500"
          isConnectable={isConnectable}
        />
      </div>
    );
  }
);

BubbleNode.displayName = "BubbleNode";
