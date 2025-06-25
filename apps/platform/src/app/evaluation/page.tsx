import { prisma } from "@kbnet/db";
import React from "react";
import { EvolutionContent } from "./_components/evolution-view";
import { Navbar } from "@/components/core/navbar";
import { Footer } from "@/components/core/footer";
import { serverSession } from "@/lib/data";
import { SELF_HOST } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function fetchData() {
  try {
    const evolutions = await prisma.evaluations.findMany({
      take: 10,
    });

    if (!evolutions || evolutions.length === 0) {
      return [];
    }

    let formattedEvolutions = [];

    for (const evolution of evolutions) {
      if (!evolution.mapIds) {
        continue; // Skip if mapIds is not present
      }
      const mapIds = evolution.mapIds.match(/map-[a-z0-9]+/g);
      if (!mapIds || mapIds.length === 0) {
        continue; // Skip if no valid mapIds found
      }
      const maps = await prisma.map.findMany({
        where: {
          id: { in: mapIds },
        },
        select: {
          id: true,

          initialQuery: true,
          user: {
            select: {
              username: true,
            },
          },
        },
      });
      if (!maps || maps.length === 0) {
        continue; // Skip if no maps found
      }
      const metrics: any[] =
        await prisma.$queryRaw`SELECT * FROM evaluations_metrics WHERE id = ${parseInt(evolution.results_id)}`;

      formattedEvolutions.push({
        id: evolution.id,
        maps: maps.map((map) => ({
          id: map.id,
          title: map.initialQuery,
          user: map.user.username || "Unknown User",
        })),
        metrics: metrics.map((metric) => ({
          id: metric.id,
          avg_relevancy: metric.avg_relevancy,
          avg_relevance_score_by_k: JSON.parse(
            metric.avg_relevance_score_by_k || "{}"
          ),
          avg_first_relevant_position: metric.avg_first_relevant_position,
          mean_mrr: metric.mean_mrr,
          hit_at_k: JSON.parse(metric.hit_at_k || "{}"),
          bin_precision_at_k: JSON.parse(metric.bin_precision_at_k || "{}"),
          avg_entropy: metric.avg_entropy,
          avg_ndcg: metric.avg_ndcg,
          avg_query_time: metric.avg_query_time,
          name: metric.name,
          created_at: metric.created_at.toISOString(),
        }))[0],
      });
    }

    return formattedEvolutions;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

export default async function EvolutionPage() {
  const data = await fetchData();

  if (!SELF_HOST) {
    return (
      <div className="h-screen">
        <Navbar transparent={false} />
        <div className="flex items-center justify-center h-[80vh] p-8 text-center flex-col gap-4">
          <p className="text-xl">
            We currently do not support this feature in online mode.
            <br />
            Please use the self-hosted version of KBNET to access this feature.
            <br />
          </p>
          <Link href="/pad">
            <Button>Go to Pad</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-screen">
        <Navbar transparent={false} />
        <div className="flex items-center justify-center h-[80vh] p-8 text-center flex-col gap-4">
          <p className="text-xl">
            No evaluations found. Please create a map and wait for the
            evaluation to see results.
          </p>
          <Link href="/pad">
            <Button>Go to Pad</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar transparent={false} />
      <EvolutionContent data={data} />
      <Footer />
    </div>
  );
}
