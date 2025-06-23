import { getPadData } from "@/lib/data";
import React from "react";
import { Dashboard } from "./_components/dashboard";
import { Footer } from "@/components/core/footer";

export default async function PadPage() {
  const data = await getPadData();

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-medium">Error loading dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Please try again later
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-0 w-full min-h-screen bg-[#faf8f3] dark:bg-[#1a1a1a]">
      <Dashboard {...data} />
      <Footer />
    </div>
  );
}
