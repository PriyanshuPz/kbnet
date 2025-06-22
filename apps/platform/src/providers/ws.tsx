"use client";

import { ErrorState } from "@/components/core/error-state";
import { LoadingState } from "@/components/core/loading-state";
import { authClient } from "@/lib/auth-client";
import { WS_SERVER_URL } from "@/lib/utils";
import { wsHandler } from "@/lib/wsHandler";
import { useGlobal } from "@/store/global-state";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

const PUBLIC_ROUTES = [
  "/auth",
  "/",
  "/about",
  "/terms",
  "/privacy",
  "/auth/logout",
  "/settings",
];
export function WSProvider({ children }: { children: React.ReactNode }) {
  const state = useGlobal();
  const router = useRouter();
  const pathname = usePathname();

  const session = authClient.useSession();

  function connect() {
    if (state.socket) {
      console.warn("WebSocket already connected");
      return;
    }

    if (!session.data) {
      console.warn("No session found, cannot connect WebSocket");
      return;
    }
    console.log("Connecting WebSocket...");

    const ws = new WebSocket(
      `${WS_SERVER_URL}/ws?token=${session.data.session.token}`
    );
    ws.onopen = () => {
      state.setConnectionStatus("connected");
      state.setError(null);
      console.log("WebSocket connected");
    };
    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };
    ws.onerror = (err) => {
      state.setError("WebSocket error");
      console.log("WebSocket error:", err);
    };
    ws.onmessage = async (e) => {
      await wsHandler(e, ws, state, router);
    };
    state.setSocket(ws);
  }

  React.useEffect(() => {
    if (!state.socket) {
      connect();
    } else if (state.socket.readyState === WebSocket.CLOSED) {
      connect();
    }
  }, [connect, state.socket]);

  if (PUBLIC_ROUTES.includes(pathname)) {
    return children;
  }

  if (state.connectionStatus === "connecting") {
    return <LoadingState />;
  }
  if (state.connectionStatus === "connected") {
    return children;
  }

  if (state.connectionStatus === "disconnected") {
    return (
      <ErrorState
        message="WebSocket connection lost"
        error={new Error(state.error || "Unknown error")}
      />
    );
  }
  return null;
}
