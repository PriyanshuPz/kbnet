import { prisma } from "@kbnet/db";
import { handler } from "../handler";
import { MessageType } from "@kbnet/shared";

export async function hasBadge(userId: string, badgeName: string) {
  const badge = await prisma.badge.findUnique({ where: { name: badgeName } });
  if (!badge) return false;
  return !!(await prisma.userBadge.findUnique({
    where: { userId_badgeId: { userId, badgeId: badge.id } },
  }));
}

export async function awardBadge(userId: string, badgeName: string) {
  let badge = await prisma.badge.findUnique({ where: { name: badgeName } });
  if (!badge) {
    badge = await prisma.badge.create({
      data: { name: badgeName, description: badgeName },
    });
  }
  await prisma.userBadge.create({
    data: { userId, badgeId: badge.id },
  });
}

export async function evaluateAndAwardBadges(
  userId: string,
  user: { xp: number; currentStreak: number },
  action: "VISIT_NODE" | "START_MAP" | "RETURN_NODE" | "DISCOVERED_NEW_BRANCH"
): Promise<string[]> {
  const badgesToCheck: { name: string; condition: () => Promise<boolean> }[] = [
    {
      name: "Explorer",
      condition: async () =>
        user.xp >= 100 && !(await hasBadge(userId, "Explorer")),
    },
    {
      name: "Consistency King",
      condition: async () =>
        user.currentStreak === 7 &&
        !(await hasBadge(userId, "Consistency King")),
    },
    {
      name: "Deep Diver",
      condition: async () =>
        action === "VISIT_NODE" &&
        user.xp >= 500 &&
        !(await hasBadge(userId, "Deep Diver")),
    },
    {
      name: "Navigator",
      condition: async () =>
        action === "START_MAP" && !(await hasBadge(userId, "Navigator")),
    },
    {
      name: "Branch Explorer",
      condition: async () =>
        action === "DISCOVERED_NEW_BRANCH" &&
        !(await hasBadge(userId, "Branch Explorer")),
    },
  ];

  const unlockedBadges: string[] = [];

  for (const badge of badgesToCheck) {
    if (await badge.condition()) {
      await awardBadge(userId, badge.name);
      unlockedBadges.push(badge.name);
    }
  }

  return unlockedBadges;
}

export function sendNotification(
  userId: string,
  payload: {
    type: "LEVEL_UP" | "STREAK_MAINTAINED" | "BADGE_UNLOCKED";
    message: string;
    confetti?: boolean;
    sound?: string;
    badge?: string;
    extra?: Record<string, any>;
  }
) {
  handler.sendToUser(userId, MessageType.SHOW_NOTIFICATION, payload);
}
