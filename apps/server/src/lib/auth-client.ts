import { createAuthClient } from "better-auth/react";
import type { Context } from "hono";

const BASE_URL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL: BASE_URL,
});

export async function tokenToSession(c: Context, token?: string) {
  if (!token) {
    console.warn("No token provided for session retrieval");
    c.set("user", null);
    c.set("session", null);
    throw new Error("Unauthorized: No token provided");
  }

  const sessionData = await authClient.getSession({
    fetchOptions: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  if (sessionData.error) {
    console.error("Error fetching session:", sessionData.error);
    c.set("user", null);
    c.set("session", null);
    throw new Error("Unauthorized: Invalid session");
  }
  if (!sessionData.data) {
    c.set("user", null);
    c.set("session", null);
    throw new Error("Unauthorized: No session data found");
  }

  const { session, user } = sessionData.data;
  c.set("user", user);
  c.set("session", session);
  return { user, session };
}
