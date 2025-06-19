import { Footer } from "@/components/core/footer";
import { Navbar } from "@/components/core/navbar";
import { MapSummaryContent } from "@/components/summary/summary-content";
import { getMapSummaryData } from "@/lib/data";
import React from "react";

export default async function MapDiscoverySummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const summaryData = await getMapSummaryData(id);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex-1 container mx-auto px-4 py-8">
        <MapSummaryContent mapId={id} initialData={summaryData} />
      </main>
      <Footer />
    </div>
  );
}
