import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary/90 text-primary-foreground border-primary/90 border-2 hover:bg-primary/80 transition-colors",
        destructive:
          "bg-destructive text-destructive-foreground border-destructive after:translate-x-0.5 after:translate-y-0.5 after:bg-destructive/80 hover:after:translate-x-1 hover:after:translate-y-1",
        outline:
          "bg-background text-foreground border-border border-2 hover:bg-primary/10 transition-colors",
        secondary:
          "bg-secondary text-secondary-foreground border-secondary after:translate-x-0.5 after:translate-y-0.5 after:bg-secondary/80 hover:after:translate-x-1 hover:after:translate-y-1",
        ghost:
          "border-transparent bg-transparent hover:bg-accent hover:text-accent-foreground after:hidden",
        link: "text-primary underline-offset-4 hover:underline border-transparent after:hidden",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
