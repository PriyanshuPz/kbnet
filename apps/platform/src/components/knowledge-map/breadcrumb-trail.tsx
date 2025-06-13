import { ChevronRight } from "lucide-react";

interface Breadcrumb {
  nodeId: string;
  label: string;
}

interface BreadcrumbTrailProps {
  breadcrumbs: Breadcrumb[];
  onBreadcrumbClick: (breadcrumb: Breadcrumb, index: number) => void;
}

export function BreadcrumbTrail({
  breadcrumbs,
  onBreadcrumbClick,
}: BreadcrumbTrailProps) {
  if (!breadcrumbs || breadcrumbs.length === 0) return null;

  return (
    <div className="flex items-center gap-1 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border shadow-sm overflow-x-auto">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight size={14} className="mx-1 text-muted-foreground" />
          )}

          <div
            className="text-xs px-2 py-0.5 rounded-full cursor-pointer hover:bg-secondary transition-colors whitespace-nowrap max-w-[150px] truncate"
            onClick={() => onBreadcrumbClick(breadcrumb, index)}
          >
            {breadcrumb.label}
          </div>
        </div>
      ))}
    </div>
  );
}
