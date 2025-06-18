"use client";

import Brand from "@/components/core/brand";

export function Navbar() {
  return (
    <div className="border-b-2 border-black bg-card">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Brand />
      </div>
    </div>
  );
}
