"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MarkdownText } from "@/components/map/mark";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { MapSummary } from "@kbnet/db/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { SELF_HOST } from "@/lib/utils";

interface SummaryContentProps {
  mapId: string;
  initialData: {
    summary: MapSummary | null;
    enabled: boolean;
  } | null;
}

export function MapSummaryContent({ mapId, initialData }: SummaryContentProps) {
  const summaryData = initialData?.summary;
  const isEnabled = initialData?.enabled ?? false;
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: sessionData } = authClient.useSession();
  const hoursToNextGeneration = summaryData
    ? Math.max(
        0,
        24 -
          Math.floor(
            (new Date().getTime() -
              new Date(summaryData.requestedAt).getTime()) /
              (1000 * 60 * 60)
          )
      )
    : 0;

  function canGenerateSummary() {
    if (!isEnabled || SELF_HOST) return false; // Can't generate if disabled or self-hosted
    if (!summaryData) return true; // No summary data means we can generate
    const lastGenerated = summaryData.requestedAt;
    if (!lastGenerated) return true; // No previous generation means we can generate
    const now = new Date();
    const hoursSinceLast =
      (now.getTime() - new Date(lastGenerated).getTime()) / (1000 * 60 * 60);
    return hoursSinceLast >= 24; // Allow generation if 24 hours have passed
  }

  const getDisabledReason = () => {
    if (!isEnabled) {
      return "Summary generation is disabled in your settings. You can enable it in /settings.";
    }
    if (SELF_HOST) {
      return "Summary generation is not available in self-hosted instances due to MindsDB dependency limitations.";
    }
    if (!canGenerateSummary() && summaryData) {
      return `Wait for ${hoursToNextGeneration} hours before generating again.`;
    }
    return null;
  };

  const handleGenerateSummary = async () => {
    try {
      setIsGenerating(true);
      if (!sessionData) {
        toast.error("You must be logged in to generate a summary.");
        return;
      }

      const url = `/server/api/maps/trigger/summary?mapId=${mapId}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionData.session.token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate summary");
      }
      toast("Generating summary...", {
        description: "This might take a few minutes.",
        duration: 5000,
      });
      router.refresh();
    } catch (error) {
      console.log("Error generating summary:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate summary"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusDisplay = () => {
    switch (summaryData?.status) {
      case "QUEUED":
        return { color: "bg-yellow-500", text: "Queued" };
      case "PENDING":
        return { color: "bg-blue-500", text: "Pending" };
      case "IN_PROGRESS":
        return { color: "bg-purple-500", text: "In Progress" };
      case "COMPLETED":
        return { color: "bg-green-500", text: "Completed" };
      case "FAILED":
        return { color: "bg-red-500", text: "Failed" };
      default:
        return { color: "bg-gray-500", text: "Not Started" };
    }
  };

  const disabledReason = getDisabledReason();

  const status = getStatusDisplay();
  const isInProgress = ["QUEUED", "IN_PROGRESS"].includes(
    summaryData?.status || ""
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Link
          href="/pad"
          className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Pad
        </Link>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Pad</span>
          <span>/</span>
          <span>Map</span>
          <span>/</span>
          <span className="text-foreground font-medium">Summary</span>
        </div>
      </div>
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Map Summary</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${status.color}`}></div>
              <span className="text-sm font-medium">{status.text}</span>
            </div>
            <Button
              onClick={handleGenerateSummary}
              disabled={isGenerating || isInProgress || !canGenerateSummary()}
              title={disabledReason || ""}
            >
              {isGenerating
                ? "Generating..."
                : isInProgress
                  ? "In Progress"
                  : !isEnabled || SELF_HOST
                    ? "Disabled"
                    : canGenerateSummary()
                      ? "Generate Summary"
                      : `Wait ${hoursToNextGeneration}h`}
            </Button>
          </div>
        </div>

        {disabledReason && (
          <div className="mb-6 p-4 border rounded-md bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
            <p className="text-amber-800 dark:text-amber-300 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {disabledReason}
            </p>
            {!isEnabled && (
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-2 ml-7">
                You can enable summary generation in your{" "}
                <Link
                  href="/settings"
                  className="underline hover:text-amber-900 dark:hover:text-amber-200"
                >
                  settings
                </Link>
                .
              </p>
            )}
            {SELF_HOST && (
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-2 ml-7">
                Due to limited budget, we cannot afford to deploy MindsDB
                online, which powers this feature.
              </p>
            )}
          </div>
        )}

        {isInProgress && (
          <div className="mb-6">
            <Progress value={30} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Generating summary... This might take a few minutes.
            </p>
          </div>
        )}

        {summaryData?.summary ? (
          <div className="space-y-6">
            <MarkdownText content={summaryData.summary.replaceAll("`", "")} />
            <div className="text-sm text-muted-foreground">
              <p>
                Requested: {new Date(summaryData.requestedAt).toLocaleString()}
              </p>
              {summaryData.completedAt && (
                <p>
                  Completed:{" "}
                  {new Date(summaryData.completedAt).toLocaleString()}
                </p>
              )}
              <p>Generated by: {summaryData.generatedBy.toLowerCase()}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {!isEnabled || SELF_HOST
                ? "Summary generation is currently disabled."
                : "No summary available. Click generate to create one."}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
