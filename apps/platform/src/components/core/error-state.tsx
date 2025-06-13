import { useState } from "react";
import { AlertTriangle, RefreshCcw, Code, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

interface ErrorStateProps {
  message?: string;
  error?: Error;
  onRetry?: () => void;
  onBack?: () => void;
}

export function ErrorState({
  message = "Something went wrong while loading.",
  error,
  onRetry,
  onBack,
}: ErrorStateProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-background/50 backdrop-blur-sm">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Alert variant="destructive" className="border-2">
          <AlertTitle className="text-lg font-medium mb-2">
            Error Occurred
          </AlertTitle>
          <AlertDescription className="text-sm text-destructive/90">
            {message}
          </AlertDescription>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-4">
            {onRetry && (
              <Button
                onClick={onRetry}
                className="flex items-center gap-1 text-xs"
                size="sm"
              >
                <RefreshCcw size={14} />
                Try Again
              </Button>
            )}

            {onBack && (
              <Button
                variant="outline"
                onClick={onBack}
                className="flex items-center gap-1 text-xs"
                size="sm"
              >
                <ArrowLeft size={14} />
                Go Back
              </Button>
            )}
          </div>

          {/* Technical details collapsible */}
          {error && (
            <Collapsible
              className="mt-4 pt-2 border-t border-destructive/20"
              open={showDetails}
              onOpenChange={setShowDetails}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-0 h-auto gap-1 text-xs text-destructive/80 hover:text-destructive"
                  size="sm"
                >
                  <Code size={12} />
                  {showDetails
                    ? "Hide Technical Details"
                    : "Show Technical Details"}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="rounded bg-destructive/5 p-3 text-xs font-mono overflow-auto max-h-40">
                  <p className="font-medium mb-1">
                    {error.name}: {error.message}
                  </p>
                  <p className="opacity-80 whitespace-pre-wrap">
                    {error.stack}
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </Alert>

        {/* Suggestions */}
        <motion.div
          className="mt-4 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <p className="text-center">Try one of these options:</p>
          <ul className="list-disc mt-2 pl-5 space-y-1">
            <li>Check your network connection</li>
            <li>Refresh the page and try again</li>
            <li>Try a different search query</li>
            <li>Contact support if the problem persists</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}
