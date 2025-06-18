import { getPadData } from "@/lib/data";
import React from "react";
import { Dashboard } from "./_components/dashboard";

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

  return <Dashboard {...data} />;
}
