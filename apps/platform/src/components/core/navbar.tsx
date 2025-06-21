import Link from "next/link";
import { Button } from "@/components/ui/button";
import Brand from "./brand";
import { cn } from "@/lib/utils";

export function Navbar({ transparent = true }) {
  return (
    <header
      className={cn(
        "w-full sticky top-0 z-50",
        !transparent &&
          "border-b-2 border-border bg-background/80 backdrop-blur-sm"
      )}
    >
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Brand />
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/about"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            About
          </Link>
          <Link href="/pad">
            <Button size="sm" className="gap-2">
              Dashboard
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
