import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { HelpCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface MysteryNodeData {
  title: string;
  isMystery: boolean;
  onClick?: () => void;
}

export const MysteryNode = memo<NodeProps<MysteryNodeData>>(
  ({ data, isConnectable }) => {
    return (
      <motion.div
        className="relative group cursor-pointer"
        onClick={data.onClick}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
      >
        {/* Glowing background */}
        <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-violet-400 to-blue-500 opacity-20 blur-lg group-hover:opacity-30 group-hover:blur-xl transition-all duration-300"></div>

        {/* Main circle */}
        <div className="relative flex flex-col items-center justify-center h-[70px] w-[70px] rounded-full border border-purple-300/50 dark:border-purple-700/50 bg-white/95 dark:bg-slate-900/95 shadow-lg backdrop-blur-sm group-hover:border-purple-400 dark:group-hover:border-purple-600 transition-colors">
          {/* Icon */}
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: "loop",
            }}
            className="text-purple-500 mb-1"
          >
            <HelpCircle size={20} />
          </motion.div>

          {/* Label */}
          <div className="text-center px-1">
            <span className="text-xs font-medium line-clamp-1 text-purple-800 dark:text-purple-300">
              {data.title.split(" ")[0]}
            </span>
          </div>

          {/* Sparkle decoration */}
          <motion.div
            className="absolute -top-1 -right-1"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <Sparkles size={12} className="text-amber-400" />
          </motion.div>
        </div>

        {/* Discover text that appears on hover */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-purple-700 dark:text-purple-400 px-2 py-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-md border border-purple-200 dark:border-purple-900">
          Click to explore
        </div>

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
      </motion.div>
    );
  }
);

MysteryNode.displayName = "MysteryNode";
