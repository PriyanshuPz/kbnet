import { Newspaper, BookOpen, Youtube, Globe } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

// TODO: Add prop types or TypeScript types for filters and onChange
export function FilterControls({ filters, onChange }: any) {
  return (
    <div className="p-3 bg-card/80 backdrop-blur-sm rounded-lg border border-border shadow-sm flex flex-col gap-2">
      <Toggle
        pressed={filters.hackerNews}
        onPressedChange={(value) => onChange("hackerNews", value)}
        className="flex items-center gap-2 data-[state=on]:bg-chart-1/20"
        aria-label="Toggle Hacker News"
      >
        <Newspaper size={16} className="text-chart-1" />
        <span className="text-xs">Hacker News</span>
      </Toggle>

      <Toggle
        pressed={filters.mediaWiki}
        onPressedChange={(value) => onChange("mediaWiki", value)}
        className="flex items-center gap-2 data-[state=on]:bg-chart-2/20"
        aria-label="Toggle Media Wiki"
      >
        <BookOpen size={16} className="text-chart-2" />
        <span className="text-xs">Media Wiki</span>
      </Toggle>

      <Toggle
        pressed={filters.youtube}
        onPressedChange={(value) => onChange("youtube", value)}
        className="flex items-center gap-2 data-[state=on]:bg-chart-3/20"
        aria-label="Toggle YouTube"
      >
        <Youtube size={16} className="text-chart-3" />
        <span className="text-xs">YouTube</span>
      </Toggle>

      <Toggle
        pressed={filters.webCrawler}
        onPressedChange={(value) => onChange("webCrawler", value)}
        className="flex items-center gap-2 data-[state=on]:bg-chart-4/20"
        aria-label="Toggle Web Crawler"
      >
        <Globe size={16} className="text-chart-4" />
        <span className="text-xs">Web Crawler</span>
      </Toggle>
    </div>
  );
}
