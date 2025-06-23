"use client";

import { type ReactNode } from "react";
import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import { useGlobal } from "@/store/global-state";
import { authClient } from "@/lib/auth-client";

export function AssistantProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { currentNode } = useGlobal();
  const { data: userData } = authClient.useSession();
  const runtime = useLocalRuntime({
    run: async ({ messages, abortSignal }) => {
      try {
        const authToken = userData?.session?.token;

        const url = "/server/api/assistant";
        const result = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            messages,
            currentNodeId: currentNode?.id,
          }),
          signal: abortSignal,
        });

        const data = await result.json();
        if (!result.ok) {
          throw new Error(data.error || "An error occurred");
        }

        return {
          content: [
            {
              type: "text",
              text: data.text,
            },
          ],
        };
      } catch (error: any) {
        console.log("Error in AssistantProvider:", error);
        throw new Error(
          error.message || "An error occurred while processing the request"
        );
      }
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
