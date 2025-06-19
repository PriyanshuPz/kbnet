import { useState, useEffect } from "react";
import { Loader2, Network, Sparkles, Brain } from "lucide-react";
import { motion } from "framer-motion";
import Brand from "./brand";
import Link from "next/link";

// Array of loading messages to display
const loadingMessages = [
  "Connecting neural pathways...",
  "Gathering knowledge particles...",
  "Mapping concept relationships...",
  "Synthesizing information nodes...",
  "Exploring the knowledge universe...",
  "Building semantic connections...",
  "Calculating relevance scores...",
];

export function LoadingState() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [showTimeout, setShowTimeout] = useState(false);

  // Rotate through loading messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Show timeout message after 4 seconds
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowTimeout(true);
    }, 4000);
    return () => clearInterval(timeoutId);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
      <motion.div
        className="flex flex-col items-center gap-6 max-w-xs text-center px-6 py-8 rounded-2xl bg-card/80 border border-border shadow-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div className="relative">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <Brand />
          </motion.div>

          {/* Floating sparkles */}
          <motion.div
            className="absolute -right-2 -top-2"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 0.5,
            }}
          >
            <Sparkles className="h-4 w-4 text-accent" />
          </motion.div>
        </motion.div>

        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Loader2 className="h-6 w-6 text-muted-foreground" />
        </motion.div>

        {/* Animated loading message */}
        <motion.div
          key={messageIndex}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.5 }}
          className="h-12 flex items-center"
        >
          <p className="text-sm text-muted-foreground">
            {loadingMessages[messageIndex]}
          </p>
        </motion.div>

        {/* Timeout message */}
        {showTimeout && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-muted-foreground/80 space-x-1"
          >
            <span>Taking longer than usual?</span>
            <Link
              href="/auth/logout?redirect=/auth"
              className="text-primary hover:underline cursor-pointer"
            >
              Logout and login
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
