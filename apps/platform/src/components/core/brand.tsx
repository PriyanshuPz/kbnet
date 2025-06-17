import { cn, secondaryFonts } from "@/lib/utils";
import React from "react";

export default function Brand() {
  return (
    <div className="flex items-center border-b-4 border-b-accent">
      <span
        className={cn(
          secondaryFonts.className,
          "scroll-m-20 text-center text-5xl font-extrabold tracking-tight text-balance"
        )}
      >
        KbNet
      </span>
    </div>
  );
}
