import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Badge } from "@/components/ui/badge";
import { Newspaper, BookOpen, Youtube, Globe, LucideIcon } from "lucide-react";

// Define the shape of the data passed to the node
interface NodeData {
  title: string;
  content?: string;
  source: string;
  sourceName?: string;
  relevance?: string;
  tags?: string[];
  publishedAt?: string;
  url?: string;
  relatedNodes?: Array<{
    id: string;
    title: string;
    source: string;
    sourceName?: string;
  }>;
}

// Define a map of source types to their icons
const sourceIcons: Record<string, LucideIcon> = {
  hackerNews: Newspaper,
  mediaWiki: BookOpen,
  youtube: Youtube,
  webCrawler: Globe,
};

export const KnowledgeNode = memo<NodeProps<NodeData>>(
  ({ data, isConnectable }) => {
    const Icon = sourceIcons[data.source] || Globe;

    return (
      <div className="px-4 py-3 rounded-lg border border-border bg-card shadow-sm hover:shadow-md transition-shadow group">
        <div className="flex justify-between items-start mb-1">
          <Icon size={16} className="text-muted-foreground" />
          <Badge variant="outline" className="text-xs bg-primary/10">
            {data.relevance || "Low"}
          </Badge>
        </div>

        <div className="text-sm font-medium line-clamp-2">{data.title}</div>

        <Handle
          type="target"
          position={Position.Top}
          className="w-2 h-2 bg-primary/50 group-hover:bg-primary"
          isConnectable={isConnectable}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-2 h-2 bg-primary/50 group-hover:bg-primary"
          isConnectable={isConnectable}
        />
      </div>
    );
  }
);

KnowledgeNode.displayName = "KnowledgeNode";
