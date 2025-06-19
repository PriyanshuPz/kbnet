"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function LogoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Get the redirect URL from search params, default to "/"
        const redirectTo = searchParams.get("redirect") || "/";

        // Sign out the user
        await authClient.signOut();

        // Redirect to the specified URL
        router.push(redirectTo);
      } catch (error) {
        console.error("Logout failed:", error);
        // If logout fails, redirect to home
        router.push("/");
      }
    };

    handleLogout();
  }, [router, searchParams]);

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Signing out...</p>
      </div>
    </div>
  );
}
