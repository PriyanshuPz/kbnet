"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "../ui/badge";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { CalendarIcon, ClockIcon } from "lucide-react";
import { MarkdownText } from "../map/mark";

interface NodeModalProps {
  node: {
    id: string;
    title: string;
    content: string | null;
    createdAt: Date;
    updatedAt: Date;
    isProcessed: boolean;
  };
  callback?: string;
}

export default function NodeModal({ node, callback }: NodeModalProps) {
  const router = useRouter();

  const handleOnOpenChange = (open: boolean) => {
    if (!open) {
      if (callback) {
        router.push(callback);
      } else {
        router.back();
      }
    }
  };

  return (
    <Dialog open onOpenChange={handleOnOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {node.title}
            </DialogTitle>
            <Badge variant={node.isProcessed ? "default" : "secondary"}>
              {node.isProcessed ? "KB Processed" : "KB Pending"}
            </Badge>
          </div>
          <DialogDescription className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              Created {formatDistanceToNow(new Date(node.createdAt))} ago
            </span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="mt-4 max-h-[50vh] rounded-md border p-4">
          {node.content ? (
            <div className="prose prose-sm dark:prose-invert">
              <MarkdownText content={node.content} />
            </div>
          ) : (
            <p className="text-muted-foreground italic">No content available</p>
          )}
          <ScrollBar className="scroll-smooth" />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
