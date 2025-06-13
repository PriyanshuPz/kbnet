import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Mapping knowledge...</p>
      </div>
    </div>
  );
}
