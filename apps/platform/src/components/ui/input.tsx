import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "border-2 border-border bg-background relative",
        "after:absolute after:inset-0 after:-z-10 after:translate-x-0.5 after:translate-y-0.5",
        "after:border-2 after:border-border after:bg-muted",
        "flex h-9 w-full min-w-0 rounded-md px-3 py-1 text-base shadow-xs transition-all outline-none",
        "focus-visible:after:translate-x-1 focus-visible:after:translate-y-1",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:pointer-events-none disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  );
}

export { Input };
