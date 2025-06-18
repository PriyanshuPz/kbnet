import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t-2 border-border py-4 bg-background/80 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} KBNet. All rights reserved.
          </p>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/about"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            About
          </Link>
          <Link
            href="https://github.com/PriyanshuPz/kbnet"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            GitHub
          </Link>
          <Link
            href="https://x.com/PriyanshuPz"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            X
          </Link>
          <Link
            href="https://peerlist.io/priyanshu_verma"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Peerlist
          </Link>
        </div>
      </div>
    </footer>
  );
}
