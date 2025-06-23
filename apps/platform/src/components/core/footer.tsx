import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export function Footer({ transparent = true }) {
  return (
    <footer
      className={cn(
        "w-full py-4",
        !transparent &&
          "border-t-2 border-border bg-background/80 backdrop-blur-sm"
      )}
    >
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">
              © 2025 KBNet. Built for the Quira Quest hackathon.
            </p>
          </div>
          <div className="flex gap-6">
            <Link
              href="/about"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              About
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Privacy
            </Link>
            <Link
              href="https://github.com/PriyanshuPz/kbnet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              GitHub <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
        <div className="mt-4 text-center text-xs text-muted-foreground">
          Powered by{" "}
          <Link
            target="_blank"
            href="https://mindsdb.com"
            className="text-primary hover:underline"
          >
            MindsDB
          </Link>{" "}
          | Hosted on{" "}
          <Link
            target="_blank"
            href="https://quira.sh"
            className="text-primary hover:underline"
          >
            Quira
          </Link>
        </div>
      </div>
    </footer>
  );
}
