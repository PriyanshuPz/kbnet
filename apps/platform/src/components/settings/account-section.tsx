"use client";

import React from "react";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AccountSection() {
  const router = useRouter();
  const handleSignOut = () => {
    router.push("/auth/logout");
  };
  return (
    <div className="space-y-2">
      <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
      <Button
        variant="destructive"
        className="paper-effect"
        onClick={handleSignOut}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}
