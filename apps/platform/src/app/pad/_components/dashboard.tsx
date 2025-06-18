import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trophy,
  Map,
  Activity,
  Star,
  Clock,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { DashboardData } from "@/lib/data";
import { Navbar } from "@/components/core/navbar";
import { StreakCard } from "./streak-card";
import Link from "next/link";
import CreateMapInput from "@/components/core/create-map-input";

const cardStyle =
  "border-2 border-black bg-card relative after:absolute after:inset-0 after:border-2 after:border-black after:translate-x-1 after:translate-y-1 after:bg-muted after:-z-10 after:transition-transform hover:after:translate-x-2 hover:after:translate-y-2";

export function Dashboard({ user, stats, maps }: DashboardData) {
  return (
    <>
      <Navbar />
      <div className="p-6 min-h-screen bg-[#faf8f3] dark:bg-[#1a1a1a]">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* User Profile Section */}
          <Card className={`p-6 ${cardStyle}`}>
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 border-2 border-black">
                <AvatarImage src={user.image || ""} />
                <AvatarFallback className="text-2xl bg-primary/10">
                  {user.name?.[0] || user.username[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">
                  {user.name || user.username}
                </h1>
                <p className="text-sm text-muted-foreground">{user.username}</p>
                <div className="flex items-center gap-2 mt-2">
                  <GraduationCap className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Level {stats.level} Explorer
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Streak Card */}
            <StreakCard
              currentStreak={stats.streak}
              longestStreak={stats.longestStreak}
            />

            {/* Level Card */}
            <Card className={`p-4 ${cardStyle}`}>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center border-2 border-black">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Experience</p>
                  <h3 className="text-2xl font-bold">{stats.level}</h3>
                </div>
              </div>
              <div className="mt-4">
                <div className="h-3 bg-muted rounded-full border-2 border-black">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{
                      width: `${(stats.xp / stats.xpNeededForNextLevel) * 100}%`,
                    }}
                  />
                </div>

                <p className="text-xs font-medium mt-2">{stats.xp} XP total</p>
              </div>
            </Card>

            {/* Badges */}
            <Card className={`p-4 ${cardStyle}`}>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center border-2 border-black">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Achievements</p>
                  <h3 className="text-2xl font-bold">{stats.badges.length}</h3>
                </div>
              </div>
              <div className="mt-4 flex gap-1.5">
                {stats.badges.slice(0, 3).map((badge, i) => (
                  <Badge
                    key={i}
                    className="border-2 border-black bg-white font-medium"
                  >
                    {badge}
                  </Badge>
                ))}
                {stats.badges.length > 3 && (
                  <Badge className="border-2 border-black bg-white font-medium">
                    +{stats.badges.length - 3}
                  </Badge>
                )}
              </div>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-card border-2 border-black rounded-lg relative after:absolute after:inset-0 after:border-2 after:border-black after:translate-x-1 after:translate-y-1 after:bg-muted after:-z-10 after:transition-transform hover:after:translate-x-2 hover:after:translate-y-2">
            <CreateMapInput />
          </div>

          {/* Recent Maps */}
          <Card className={cardStyle}>
            <div className="p-4 border-b-2 border-black">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Map className="h-5 w-5" />
                Recent Explorations
              </h2>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="p-4 space-y-3">
                {maps.map((map) => (
                  <Card
                    key={map.id}
                    className="p-3 border-2 border-black hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <Link href={`/map/${map.id}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Activity
                            className={
                              map.isActive
                                ? "text-green-500"
                                : "text-muted-foreground"
                            }
                            size={16}
                          />
                          <div>
                            <h3 className="font-medium text-sm">{map.title}</h3>
                            <p className="text-xs text-muted-foreground">
                              {map.currentStep
                                ? `Step ${map.currentStep.stepIndex}: ${map.currentStep.node.title}`
                                : "Not started"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(map.lastActive), {
                              addSuffix: true,
                            })}
                          </span>
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </>
  );
}
