import { prisma, type MapSummary } from "@kbnet/db";
import type { auth } from "@kbnet/shared";
import { Hono } from "hono";
import { generateMapSummary } from "../controllers/summary";

const router = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

router.post("/maps/trigger/summary", async (c) => {
  try {
    const { searchParams } = new URL(c.req.raw.url);
    const mapId = searchParams.get("mapId");
    if (!mapId) {
      return c.json({ error: "Map ID is required" }, 400);
    }

    const user = c.get("user");

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const map = await prisma.map.findUnique({
      where: { id: mapId },
      include: { latestSummary: true },
    });

    if (!map) {
      return c.json({ error: "Map not found" }, 404);
    }

    if (map.userId !== user.id) {
      return c.json(
        { error: "Forbidden: You do not have permission to use this map" },
        403
      );
    }

    // limit it to one summary generation one time in 24 hours
    const lastGenerated = map.latestSummary?.requestedAt;
    if (lastGenerated) {
      const now = new Date();
      const hoursSinceLast =
        (now.getTime() - lastGenerated.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLast < 24) {
        return c.json(
          { error: "You can only generate a summary once every 24 hours" },
          429
        );
      }
    }

    let latestSummary: MapSummary;

    if (!map.latestSummary) {
      latestSummary = await prisma.mapSummary.create({
        data: {
          mapId: map.id,
          status: "PENDING",
          generatedBy: "USER",
        },
      });
    } else {
      latestSummary = map.latestSummary;
    }

    if (
      latestSummary.status !== "PENDING" &&
      latestSummary.status !== "FAILED"
    ) {
      return c.json(
        {
          error: "Map summary is already being generated",
          summary: latestSummary.summary,
        },
        400
      );
    }

    // Trigger the async summary generation
    await prisma.mapSummary.update({
      where: { id: latestSummary.id },
      data: { status: "IN_PROGRESS", requestedAt: new Date() },
    });

    // Start the generation process in the background
    generateMapSummary(mapId).catch((error) => {
      console.error("Background summary generation failed:", error);
    });

    return c.json({
      message: "Summary generation started",
      summaryId: latestSummary.id,
    });
  } catch (error) {
    console.error("Error in /maps/trigger/summary:", error);
    return c.json({ error: "Failed to trigger map summary" }, 500);
  }
});

export default router;
