"use client";

import { Card } from "@/components/ui/card";
import { MapStep } from "@/lib/data";
import { formatDistanceToNow } from "date-fns";
import { Activity, ChevronRight, Clock, Trash2, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MapCardProps {
  map: {
    id: string;
    title: string;
    isActive: boolean;
    lastActiveAt: Date;
    currentStep: MapStep | null;
  };
}

export default function MapCard({ map }: MapCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/map/${map.id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/maps?mapId=${map.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete map");
      }

      toast.success("Your map has been deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete map");
    }
  };

  const handleSummaryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/map/${map.id}/summary`);
  };

  return (
    <Card className="p-3 border-2 border-black hover:bg-muted/50 transition-colors cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4" onClick={handleClick}>
          <div className="relative">
            <Activity
              className={`${
                map.isActive ? "text-green-500" : "text-muted-foreground"
              } transition-colors duration-200`}
              size={20}
            />
            {map.isActive && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-start group hover:text-primary transition-colors cursor-pointer">
              <h3 className="font-semibold text-lg mr-1 group-hover:text-primary transition-colors leading-1">
                {map.title}
              </h3>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 not-md:hidden">
                <Clock size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground overflow-clip line-clamp-1">
                  {formatDistanceToNow(new Date(map.lastActiveAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-1">
              {map.currentStep
                ? `Step ${map.currentStep.stepIndex}: ${map.currentStep.node.title}`
                : "Not started"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Button
              onClick={handleSummaryClick}
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <FileText size={16} />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 size={16} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Map</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this map? This action cannot
                    be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <ChevronRight
              onClick={handleClick}
              size={16}
              className="text-muted-foreground group-hover:text-primary group-hover:transform group-hover:translate-x-1 transition-all"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
