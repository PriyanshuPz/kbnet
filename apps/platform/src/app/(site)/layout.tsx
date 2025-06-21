import { Navbar } from "@/components/core/navbar";
import { Footer } from "@/components/core/footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar transparent={false} />
      <main className="flex-1">{children}</main>
      <Footer transparent={false} />
    </div>
  );
}
