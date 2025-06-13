import React, { useState } from "react";
import { Node } from "reactflow";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Newspaper,
  BookOpen,
  Youtube,
  Globe,
  ExternalLink,
  ChevronRight,
  LucideIcon,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// Define the shape of node data
interface NodeData {
  title: string;
  content?: string;
  source: string;
  sourceName?: string;
  relevance?: string;
  tags?: string[];
  publishedAt?: string;
  url?: string;
  relatedNodes?: Array<RelatedNode>;
}

interface RelatedNode {
  id: string;
  title: string;
  source: string;
  sourceName?: string;
}

interface NodeDetailsProps {
  node: Node<NodeData> | null;
  open: boolean;
  onClose: (open: boolean) => void;
  onExpandNode: (nodeId: string) => void;
}

const sourceIcons: Record<string, LucideIcon> = {
  hackerNews: Newspaper,
  mediaWiki: BookOpen,
  youtube: Youtube,
  webCrawler: Globe,
};

export function NodeDetails({
  node,
  open,
  onClose,
  onExpandNode,
}: NodeDetailsProps) {
  const [showFullContent, setShowFullContent] = useState<boolean>(false);

  if (!node) return null;

  const Icon = sourceIcons[node.data.source] || Globe;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="mx-auto w-full max-w-2xl p-2 rounded-t-lg"
      >
        <div className="mx-auto w-full max-w-lg">
          <SheetHeader className="pb-6">
            <SheetTitle className="text-xl">{node.data.title}</SheetTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon size={16} />
              <span>{node.data.sourceName}</span>
            </div>
          </SheetHeader>

          {node.data.tags && node.data.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {node.data.tags.map((tag: string, i: number) => (
                <Badge key={i} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {node.data.publishedAt && (
            <div className="text-xs text-muted-foreground mb-4">
              Published: {formatDate(node.data.publishedAt)}
            </div>
          )}

          <div className="mb-6">
            <div
              className={`text-sm ${!showFullContent ? "line-clamp-6" : ""}`}
            >
              {node.data.content}
            </div>

            {node.data.content && node.data.content.length > 250 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullContent(!showFullContent)}
                className="mt-2 text-xs"
              >
                {showFullContent ? "Show Less" : "Show More"}
              </Button>
            )}
          </div>

          {node.data.url && (
            <Button
              className="mb-6 w-full"
              variant="outline"
              onClick={() => window.open(node.data.url, "_blank")}
            >
              View Full Source <ExternalLink size={14} className="ml-2" />
            </Button>
          )}

          {node.data.relatedNodes && node.data.relatedNodes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Related Nodes</h3>
              <div className="space-y-2">
                {node.data.relatedNodes
                  .slice(0, 3)
                  .map((related: RelatedNode) => (
                    <div
                      key={related.id}
                      className="flex items-center justify-between p-2 rounded-md bg-secondary/30 hover:bg-secondary/50 cursor-pointer"
                      onClick={() => onExpandNode(related.id)}
                    >
                      <div>
                        <div className="text-sm font-medium truncate max-w-[280px]">
                          {related.title}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {sourceIcons[related.source] &&
                            React.createElement(sourceIcons[related.source], {
                              size: 12,
                            })}
                          <span>{related.sourceName}</span>
                        </div>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-muted-foreground"
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
