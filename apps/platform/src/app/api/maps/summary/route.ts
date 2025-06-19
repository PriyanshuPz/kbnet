import { prisma } from "@kbnet/db";
import { auth } from "@kbnet/shared";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mapId = searchParams.get("mapId");

    if (!mapId) {
      return NextResponse.json(
        { error: "Map ID is required" },
        { status: 400 }
      );
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const map = await prisma.map.findUnique({
      where: { id: mapId },
    });

    if (!map) {
      return NextResponse.json({ error: "Map not found" }, { status: 404 });
    }

    if (map.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to use this map" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { message: "Map summary triggered successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error map summary triggering:", error);
    return NextResponse.json(
      { error: "Failed to map summary triggering" },
      { status: 500 }
    );
  }
}
