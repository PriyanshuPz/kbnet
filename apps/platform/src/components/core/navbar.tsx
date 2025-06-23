import Link from "next/link";
import { Button } from "@/components/ui/button";
import Brand from "./brand";
import { cn } from "@/lib/utils";
import { serverSession } from "@/lib/data";
import { Settings } from "lucide-react";

export async function Navbar({ transparent = true }) {
  const session = await serverSession();
  const isAuthenticated = !!session?.user;

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

          {isAuthenticated ? (
            <>
              <Link href="/pad">
                <Button size="sm" className="mr-0">
                  Dashboard
                </Button>
              </Link>
              <Link href="/settings">
                <Settings className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
              </Link>
            </>
          ) : (
            <Link href="/auth">
              <Button size="sm" className="gap-2">
                Sign In
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
