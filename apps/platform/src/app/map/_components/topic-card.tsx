import { Node } from "@kbnet/db";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Heart, Share2, Minimize2 } from "lucide-react";
import { MarkdownText } from "@/components/map/mark";
import { cn } from "@/lib/utils";

interface TopicCardProps {
  node: Node | null;
  isAnimating: boolean;
  isExpanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
}

export const TopicCard = ({
  node,
  isAnimating,
  isExpanded,
  onExpandChange,
}: TopicCardProps) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleCopy = () => {
    if (node) {
      navigator.clipboard.writeText(`${node.title}\n\n${node.summary}`);
    }
  };

  const handleShare = () => {
    // Implement share functionality
    // Could open a modal with sharing options
  };

  const handleAIOptions = () => {
    // Implement AI options
    // Could open a modal with AI actions like:
    // - Generate related questions
    // - Explain in detail
    // - Create study notes
  };

  return (
    <motion.div
      layout
      className={`paper-effect p-6 rounded-xl mt-3 ${
        isAnimating ? "pointer-events-none" : ""
      }`}
    >
      <div className="relative">
        {/* Content */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-center tracking-wide">
            {node?.title || "No topic available"}
          </h3>

          <div
            className={cn(
              "max-h-[60vh] scrollbar-hide pr-2",
              isExpanded ? "overflow-y-auto" : "overflow-clip"
            )}
            onDoubleClick={() => onExpandChange?.(true)}
          >
            <MarkdownText
              content={
                node?.summary || "Content will appear here when available."
              }
            />
          </div>
          <div
            onClick={() => onExpandChange?.(true)}
            className="flex justify-end items-center"
          >
            {!isExpanded && (
              <span className="text-sm text-muted-foreground cursor-pointer hover:underline">
                Double click to expand
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-4 flex items-center justify-between border-t pt-4"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-2 rounded-lg hover:bg-muted transition-colors ${
                    isLiked ? "text-red-500" : ""
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`}
                  />
                </button>
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Copy className="w-5 h-5" />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onExpandChange?.(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative Elements */}
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-muted rounded-full opacity-50" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-muted rounded-full opacity-50" />
      </div>
    </motion.div>
  );
};
