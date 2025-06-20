import { auth } from "@/lib/auth";
import { prisma } from "@kbnet/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
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
      select: { userId: true },
    });

    if (!map) {
      return NextResponse.json({ error: "Map not found" }, { status: 404 });
    }

    if (map.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to delete this map" },
        { status: 403 }
      );
    }

    // for now delete the map directly from the database
    // In a prod, I will set it inactive and remove it from the UI
    // Proceed with deletion
    await prisma.map.delete({
      where: { id: mapId },
    });
    return NextResponse.json(
      { message: "Map deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting map:", error);
    return NextResponse.json(
      { error: "Failed to delete map" },
      { status: 500 }
    );
  }
}
