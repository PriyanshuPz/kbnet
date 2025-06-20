import { Node } from "@kbnet/db/types";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUp,
  Radar,
  Brain,
  RotateCcw,
  Link,
  ArrowDown,
  ArrowRight,
} from "lucide-react";

interface NavigationHintsProps {
  isCardExpanded?: boolean | null;
  lastSwipeDirection?: string | null;
  canGoBack: boolean;
  nodes: {
    similar: Node | null;
    deep: Node | null;
    related: Node | null;
  };
}

export const NavigationHints = ({
  isCardExpanded,
  lastSwipeDirection,
  nodes,
  canGoBack,
}: NavigationHintsProps) => {
  return (
    <motion.div
      className="noselect fixed inset-x-0 bottom-8 flex justify-center items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {isCardExpanded ? (
        <motion.span
          className="px-4 py-2 rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-sm
                     text-xs sm:text-sm md:text-base flex items-center gap-2"
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.98, 1, 0.98],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <Radar className="w-4 h-4 sm:w-5 sm:h-5" />
          {lastSwipeDirection
            ? "Swipe again to navigate"
            : "Double swipe to navigate"}
        </motion.span>
      ) : (
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 px-4">
          {nodes.similar && (
            <motion.button
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full
                         bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10
                         transition-colors text-xs sm:text-sm"
              whileHover={{ scale: 1.05 }}
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Similar</span>
            </motion.button>
          )}
          {nodes.deep && (
            <motion.button
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full
                         bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10
                         transition-colors text-xs sm:text-sm"
              whileHover={{ scale: 1.05 }}
            >
              <Brain className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Deep Dive</span>
              <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
            </motion.button>
          )}
          {canGoBack && (
            <motion.button
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full
                         bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10
                         transition-colors text-xs sm:text-sm"
              whileHover={{ scale: 1.05 }}
            >
              <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Back</span>
            </motion.button>
          )}
          {nodes.related && (
            <motion.button
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full
                         bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10
                         transition-colors text-xs sm:text-sm"
              whileHover={{ scale: 1.05 }}
            >
              <span className="hidden sm:inline">Related</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
};
