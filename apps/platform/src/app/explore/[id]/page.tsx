import Brand from "@/components/core/brand";
import Link from "next/link";
import ExplorationView from "../_components/exploration-view";

export default async function ExplorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden noselect antialiased bg-fuchsia-50 dark:bg-background-dark text-foreground dark:text-foreground-dark font-sans font-normal tracking-normal leading-normal text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">
      <div className="flex items-center px-4 h-14 mt-3">
        <Link href="/" className="flex items-center gap-2">
          <Brand />
        </Link>
      </div>

      <ExplorationView id={id} />
    </div>
  );
}
