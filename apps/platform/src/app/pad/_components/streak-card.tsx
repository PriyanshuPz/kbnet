import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakCard({ currentStreak, longestStreak }: StreakCardProps) {
  const cardStyle =
    "border-2 border-black bg-card relative after:absolute after:inset-0 after:border-2 after:border-black after:translate-x-1 after:translate-y-1 after:bg-muted after:-z-10 after:transition-transform hover:after:translate-x-2 hover:after:translate-y-2";

  return (
    <Card className={`p-4 ${cardStyle}`}>
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center border-2 border-black">
          <Flame className="h-6 w-6 text-orange-500" />
        </div>
        <div>
          <p className="text-sm font-medium">Daily Streak</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold">{currentStreak}</h3>
            <span className="text-xs text-muted-foreground">
              Best: {longestStreak}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full border-2 border-black ${
                i < currentStreak % 7 ? "bg-orange-500" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {currentStreak} day{currentStreak !== 1 ? "s" : ""} streak
        </p>
      </div>
    </Card>
  );
}
