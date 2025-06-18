import { useGlobal } from "@/store/global-state";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function Gamebar() {
  const { userStats } = useGlobal();

  if (!userStats) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 p-4"
    >
      <div className="mx-auto max-w-xl">
        <div className="paper-effect p-3 rounded-lg">
          <div className="flex items-center justify-between">
            {/* Left Side - Back Link */}
            <Link
              href="/pad"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Pad</span>
            </Link>

            {/* Right Side - Level and XP */}
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold">
                Level {userStats.level}
              </span>
              <span className="text-sm text-muted-foreground">
                {userStats.xp} / {userStats.xpNeededForNextLevel} XP
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
