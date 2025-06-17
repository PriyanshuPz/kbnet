"use client";

import { ErrorState } from "@/components/core/error-state";
import { LoadingState } from "@/components/core/loading-state";
import { authClient } from "@/lib/auth-client";
import { WS_SERVER_URL } from "@/lib/utils";
import { wsHandler } from "@/lib/wsHandler";
import { useGlobal } from "@/store/global-state";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

const paths = ["/auth"];

export function WSProvider({ children }: { children: React.ReactNode }) {
  const state = useGlobal();
  const router = useRouter();
  const pathname = usePathname();

  const {
    data: session,
    isPending, //loading state
    error, //error object
    refetch, //refetch the session
  } = authClient.useSession();

  function connect() {
    if (state.socket) {
      console.warn("WebSocket already connected");
      return;
    }

    if (!session) {
      console.warn("No session found, cannot connect WebSocket");
      return;
    }

    const authToken = session.session.token;

    const ws = new WebSocket(`${WS_SERVER_URL}?token=${authToken}`);
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
      // console.error("WebSocket error:", err);
    };
    ws.onmessage = async (e) => {
      await wsHandler(e, ws, state, router);
    };
    state.setSocket(ws);
  }

  React.useEffect(() => {
    if (!state.socket) {
      connect();
    }
  }, [connect, state.socket]);

  if (paths.includes(pathname)) {
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
