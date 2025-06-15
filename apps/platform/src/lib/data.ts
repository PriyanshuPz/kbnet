"use server";
import { prisma } from "@kbnet/db";

export async function fetchKmap(id: string): Promise<any> {
  try {
    const kmap = await prisma.kMap.findUnique({
      where: { id },
      include: {
        nodes: true,
        edges: true,
      },
    });

    return kmap;
  } catch (error) {
    console.error("Failed to fetch kmap:", error);
    return null;
  }
}
