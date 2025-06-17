"use client";

import { EmptyState } from "@/components/core/empty-state";
import { sessionHelpers } from "@/lib/session";
import { useGlobal } from "@/store/global-state";
import { MessageType, pack } from "@kbnet/shared";

export default function Home() {
  const { socket, send, state } = useGlobal();

  const handleSearch = (query: string) => sessionHelpers.startSearch(query);

  return (
    <div className="w-full h-screen flex flex-col bg-background text-foreground">
      <EmptyState onSearch={handleSearch} loading={state === "loading"} />
    </div>
  );
}
