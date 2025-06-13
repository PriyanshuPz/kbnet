"use client";

import { EmptyState } from "@/components/core/empty-state";
import { useGlobal } from "@/store/global-state";
import { MessageType, pack } from "@kbnet/shared";

export default function Home() {
  const { connect, socket, send, state } = useGlobal();

  const handleSearch = (query: string) => {
    if (state === "loading") return; // Prevent multiple searches while loading
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      connect();
      return;
    }
    if (!query.trim()) return;

    // Send the search query to the WebSocket server
    send(pack(MessageType.START_SEARCH, { query }));
  };

  return (
    <div className="w-full h-screen flex flex-col bg-background text-foreground">
      <EmptyState onSearch={handleSearch} loading={state === "loading"} />
    </div>
  );
}
