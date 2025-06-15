import Brand from "@/components/core/brand";
import { fetchKmap } from "@/lib/data";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";
import KMapContent from "./_components/kmap-content";

export default async function KmapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const kmap = await fetchKmap(id);
  if (!kmap) {
    return notFound();
  }

  return (
    <div className="w-full h-screen flex flex-col bg-background text-foreground">
      <div className="flex items-center px-4 h-14 mt-3">
        <Link href="/" className="flex items-center gap-2">
          <Brand />
        </Link>
      </div>
      <KMapContent kmap={kmap} />
    </div>
  );
}
