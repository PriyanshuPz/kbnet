import { prisma } from "@kbnet/db";
import { evaluateAndAwardBadges, sendNotification } from "./achivements";
import { handler } from "../handler";
import { MessageType } from "@kbnet/shared";
import { calculateXpForLevel } from "@kbnet/shared/src/lib/utils";

const XP_ON_START_MAP = 50;
const XP_ON_VISIT_NODE = 5;
const XP_ON_RETURN_NODE = 2;
const DAILY_STREAK_BONUS = 20;

export async function applyUserStats(
  userId: string,
  action: "VISIT_NODE" | "START_MAP" | "RETURN_NODE" | "DISCOVERED_NEW_BRANCH"
) {
  console.log(`Applying user stats for user ${userId} with action ${action}`);

  const now = new Date();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  let xpGain = 0;

  if (action === "START_MAP") xpGain += XP_ON_START_MAP;
  if (action === "VISIT_NODE") xpGain += XP_ON_VISIT_NODE;
  if (action === "RETURN_NODE") xpGain += XP_ON_RETURN_NODE;

  // Streak logic
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  let { currentStreak, longestStreak, lastActivityDate } = user;
  const isToday =
    lastActivityDate && lastActivityDate.toDateString() === now.toDateString();
  const wasYesterday =
    lastActivityDate &&
    lastActivityDate.toDateString() === yesterday.toDateString();

  let streakMaintained = false;

  if (!isToday) {
    if (wasYesterday) {
      currentStreak += 1;
      streakMaintained = true;
    } else {
      currentStreak = 1;
    }

    lastActivityDate = now;
    if (currentStreak > longestStreak) longestStreak = currentStreak;

    xpGain += DAILY_STREAK_BONUS; // bonus for daily streak
  }

  let updated = await prisma.user.update({
    where: { id: userId },
    data: {
      xp: { increment: xpGain },
      currentStreak,
      longestStreak,
      lastActivityDate,
    },
  });

  // Send streak maintained WebSocket message
  if (streakMaintained) {
    sendNotification(userId, {
      type: "STREAK_MAINTAINED",
      message: "Daily streak continued!",
      sound: "streak-sound",
    });
  }

  // Level-up check
  let { level, xp } = updated;
  let xpForNextLevel = calculateXpForLevel(level);
  let leveledUp = false;

  while (xp >= xpForNextLevel) {
    xp -= xpForNextLevel;
    level += 1;
    xpForNextLevel = calculateXpForLevel(level);
    leveledUp = true;
  }

  if (leveledUp) {
    updated = await prisma.user.update({
      where: { id: userId },
      data: { xp, level },
    });
    sendNotification(userId, {
      type: "LEVEL_UP",
      message: "You leveled up!",
      confetti: true,
      sound: "level-up-sound",
    });
  }

  // Badge awarding
  const unlockedBadges = await evaluateAndAwardBadges(userId, updated, action);

  if (unlockedBadges.length > 0) {
    if (unlockedBadges.length == 1) {
      sendNotification(userId, {
        type: "BADGE_UNLOCKED",
        message: `You unlocked the ${unlockedBadges[0]} badge!`,
        sound: "badge-sound",
      });
    } else {
      sendNotification(userId, {
        type: "BADGE_UNLOCKED",
        message: `You unlocked the following badges: ${unlockedBadges.join(", ")}!`,
        sound: "badge-sound",
      });
    }
  }
}

// Fetches user stats for UI
export async function getUserStats({ userId, ws }: BasePayload) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
    },
  });

  if (!user) throw new Error("User not found");

  const stats = {
    level: user.level,
    xp: user.xp,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    badges: user.badges.map((b) => b.badge.name),
    xpNeededForNextLevel: calculateXpForLevel(user.level + 1),
  };

  handler.sendToUser(userId, MessageType.USER_STAT, stats);
}
