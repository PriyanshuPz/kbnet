import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Map, Star, GraduationCap, Settings } from "lucide-react";
import { DashboardData } from "@/lib/data";
import { StreakCard } from "./streak-card";
import Link from "next/link";
import CreateMapInput from "@/components/core/create-map-input";
import Brand from "@/components/core/brand";
import MapCard from "./map-card";

const cardStyle =
  "border-2 border-black bg-card relative after:absolute after:inset-0 after:border-2 after:border-black after:translate-x-1 after:translate-y-1 after:bg-muted after:-z-10 after:transition-transform hover:after:translate-x-2 hover:after:translate-y-2";

export function Dashboard({ user, stats, maps }: DashboardData) {
  return (
    <div className="max-w-5xl mx-auto">
      <nav className="flex items-center justify-between relative">
        <Link href="/">
          <Brand />
        </Link>
        <Link href="/settings">
          <Settings className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
        </Link>
      </nav>

      <Card className={`p-6 my-2 ${cardStyle}`}>
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20 border-2 border-black">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback className="text-2xl bg-primary/10">
              {user.name?.[0] || user.username[0]}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{user.name || user.username}</h1>
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

      <div className="my-2 grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <div className="mt-4 flex gap-1.5 flex-wrap">
            {stats.badges.slice(0, 3).map((badge, i) => (
              <Badge
                key={i}
                className="border-2 border-black bg-white font-medium text-primary dark:text-black"
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

      <div className="my-8 p-6 bg-card border-2 border-black rounded-t-lg relative after:absolute after:inset-0 after:border-2 after:border-black after:translate-x-1 after:translate-y-1 after:bg-muted after:-z-10 after:transition-transform hover:after:translate-x-2 hover:after:translate-y-2">
        <CreateMapInput />
      </div>

      <Card className={`${cardStyle} -mt-7 rounded-t-none`}>
        <div className="p-4 border-b-2 border-black">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Map className="h-5 w-5" />
            Recent Explorations
          </h2>
        </div>
        <ScrollArea className="min-h-[200px] max-h-[400px]">
          <div className="p-4 space-y-3">
            {maps.map((map) => (
              <MapCard
                key={map.id}
                map={{
                  id: map.id,
                  title: map.title,
                  isActive: map.isActive,
                  lastActiveAt: map.lastActive,
                  currentStep: map.currentStep,
                }}
              />
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
