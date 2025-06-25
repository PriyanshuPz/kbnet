import { auth } from "@/lib/auth";
import { prisma } from "@kbnet/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const evolutions = await prisma.evaluations.findMany({
      select: {},
    });

    return NextResponse.json(
      { message: "Map deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in fetching evolution:", error);
    return NextResponse.json(
      { error: "Failed to fetch evolutions" },
      { status: 500 }
    );
  }
}
