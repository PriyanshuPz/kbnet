"use server";

import { prisma } from "@kbnet/db";
import { auth } from "@kbnet/shared";
import { calculateXpForLevel } from "@kbnet/shared";
import { headers } from "next/headers";
export interface User {
  id: string;
  name: string | null;
  image: string | null;
  username: string;
  email: string;
}

export interface Stats {
  totalMaps: number;
  activeMaps: number;
  lastActiveMap: Date | null;
  badges: string[];
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  xpNeededForNextLevel: number; // XP needed for the next level
}

export interface MapStep {
  id: string;
  stepIndex: number;
  direction: string;
  node: {
    id: string;
    title: string;
  };
}

export interface Map {
  id: string;
  title: string;
  lastActive: Date;
  createdAt: Date;
  isActive: boolean;
  currentStep: MapStep | null;
}

export interface DashboardData {
  user: User;
  stats: Stats;
  maps: Map[];
}
export async function getPadData(): Promise<DashboardData | null> {
  try {
    const h = await headers();
    const session = await auth.api.getSession({
      headers: h, // you need to pass the headers object.
    });

    if (!session) throw new Error("No session found");

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        badges: {
          select: {
            badge: {
              select: {
                name: true,
              },
            },
          },
        },
        maps: {
          select: {
            id: true,
            initialQuery: true,
            lastActiveAt: true,
            startedAt: true,
            isActive: true,
            currentNavigationStep: {
              select: {
                id: true,
                stepIndex: true,
                timestamp: true,
                direction: true,
                node: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
          orderBy: { lastActiveAt: "desc" },
          take: 10, // Limit to the last 10 maps
        },
      },
    });
    if (!user) throw new Error("User not found");

    const maps = user.maps.map((map) => ({
      id: map.id,
      title: map.initialQuery,
      lastActive: map.lastActiveAt,
      createdAt: map.startedAt,
      isActive: map.isActive,
      currentStep: map.currentNavigationStep
        ? {
            id: map.currentNavigationStep.id,
            stepIndex: map.currentNavigationStep.stepIndex,
            timestamp: map.currentNavigationStep.timestamp,
            direction: map.currentNavigationStep.direction,
            node: {
              id: map.currentNavigationStep.node.id,
              title: map.currentNavigationStep.node.title,
            },
          }
        : null,
    }));

    const stats: Stats = {
      totalMaps: user.maps.length,
      activeMaps: user.maps.filter((map) => map.isActive).length,
      lastActiveMap: user.maps[0]?.lastActiveAt || null,
      badges: user.badges.map((badge) => badge.badge.name),
      xp: user.xp,
      level: user.level,
      streak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      xpNeededForNextLevel: calculateXpForLevel(user.level + 1), // XP needed for the next level
    };

    return {
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
        username: user.username || user.email.split("@")[0], // Fallback to email prefix if username is not set
        email: user.email,
      },
      stats,
      maps,
    };
  } catch (error) {
    console.error("Error fetching pad data:", error);
    return null;
  }
}

export async function getMapSummaryData(mapId: string) {
  try {
    const h = await headers();

    const session = await auth.api.getSession({
      headers: h,
    });
    if (!session) throw new Error("No session found");

    const summary = await prisma.mapSummary.findUnique({
      where: { mapId: mapId },
    });

    if (!summary) throw new Error("Map summary not found");

    return summary;
  } catch (error) {
    console.error("Error fetching map summary data:", error);
    return null;
  }
}

export async function getNodeData(nodeId: string) {
  try {
    const h = await headers();
    const session = await auth.api.getSession({
      headers: h, // you need to pass the headers object.
    });
    if (!session) throw new Error("No session found");

    const node = await prisma.node.findUnique({
      where: { id: nodeId },
    });

    if (!node) throw new Error("Node not found");

    return {
      id: node.id,
      title: node.title,
      content: node.summary,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
      isProcessed: node.isProcessed,
    };
  } catch (error) {
    console.error("Error fetching node data:", error);
    return null;
  }
}
