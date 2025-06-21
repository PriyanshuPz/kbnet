"use client";

import "@assistant-ui/react-markdown/styles/dot.css";

import {
  unstable_memoizeMarkdownComponents as memoizeMarkdownComponents,
  useIsMarkdownCodeBlock,
} from "@assistant-ui/react-markdown";

import { cn } from "@/lib/utils";
import { SyntaxHighlighter } from "./shiki-highlighter";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface MarkdownTextProps {
  content: string;
  className?: string;
  truncate?: boolean;
  maxLength?: number;
}
// Custom NodeLink component

const config = {
  node: {
    prefix: ["nodes", "appdb_ds.nodes"],
    url: "/nodes/",
    text: "[🧩]", // Puzzle piece: represents a connected unit
  },
  map: {
    prefix: ["maps", "appdb_ds.maps"],
    url: "/maps/",
    text: "[🗺️]", // Map emoji: represents navigation or overview
  },
  rel: {
    prefix: ["node_relationships", "appdb_ds.node_relationships"],
    url: "/relationships/",
    text: "[🔗]", // Link emoji: represents connection
  },
  step: {
    prefix: ["navigation_steps", "appdb_ds.navigation_steps"],
    url: "/steps/",
    text: "[🚶]", // Walking emoji: represents a step or progress
  },
};

function extractItem(content: string) {
  const match = Object.entries(config).find(([_, value]) =>
    value.prefix.some((prefix) => content.startsWith(prefix))
  );

  if (match) {
    const [_, itemConfig] = match;
    return `${itemConfig.text}(${itemConfig.url}${content.split(":")[1]})`;
  }

  return content;
}

function processText(text: string) {
  return text.replace(/<([^>]+)>/g, (_, innerContent) => {
    return extractItem(innerContent);
  });
}

export function MarkdownText({ content, className }: MarkdownTextProps) {
  return (
    <ReactMarkdown components={defaultComponents} remarkPlugins={[remarkGfm]}>
      {processText(content)}
    </ReactMarkdown>
  );
}

const defaultComponents = memoizeMarkdownComponents({
  SyntaxHighlighter: SyntaxHighlighter,

  h1: ({ className, ...props }) => (
    <h1
      className={cn(
        "mb-8 scroll-m-20 text-4xl font-extrabold tracking-tight last:mb-0",
        className
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn(
        "mb-4 mt-8 scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 last:mb-0",
        className
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn(
        "mb-4 mt-6 scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0 last:mb-0",
        className
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      className={cn(
        "mb-4 mt-6 scroll-m-20 text-xl font-semibold tracking-tight first:mt-0 last:mb-0",
        className
      )}
      {...props}
    />
  ),
  h5: ({ className, ...props }) => (
    <h5
      className={cn(
        "my-4 text-lg font-semibold first:mt-0 last:mb-0",
        className
      )}
      {...props}
    />
  ),
  h6: ({ className, ...props }) => (
    <h6
      className={cn("my-4 font-semibold first:mt-0 last:mb-0", className)}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p
      className={cn("mb-5 mt-5 leading-7 first:mt-0 last:mb-0", className)}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn("border-l-2 pl-6 italic", className)}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul
      className={cn("my-5 ml-6 list-disc [&>li]:mt-2", className)}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn("my-5 ml-6 list-decimal [&>li]:mt-2", className)}
      {...props}
    />
  ),
  hr: ({ className, ...props }) => (
    <hr className={cn("my-5 border-b", className)} {...props} />
  ),
  table: ({ className, ...props }) => (
    <table
      className={cn(
        "my-5 w-full border-separate border-spacing-0 overflow-y-auto",
        className
      )}
      {...props}
    />
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn(
        "bg-muted px-4 py-2 text-left font-bold first:rounded-tl-lg last:rounded-tr-lg [&[align=center]]:text-center [&[align=right]]:text-right",
        className
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn(
        "border-b border-l px-4 py-2 text-left last:border-r [&[align=center]]:text-center [&[align=right]]:text-right",
        className
      )}
      {...props}
    />
  ),
  tr: ({ className, ...props }) => (
    <tr
      className={cn(
        "m-0 border-b p-0 first:border-t [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg",
        className
      )}
      {...props}
    />
  ),
  sup: ({ className, ...props }) => (
    <sup
      className={cn("[&>a]:text-xs [&>a]:no-underline", className)}
      {...props}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={cn("overflow-x-auto rounded-b-lg p-4 text-white", className)}
      {...props}
    />
  ),
  code: function Code({ className, ...props }) {
    const isCodeBlock = useIsMarkdownCodeBlock();
    return (
      <code
        className={cn(
          !isCodeBlock && "rounded border font-semibold",
          className
        )}
        {...props}
      />
    );
  },

  a: ({ className, ...props }) => {
    return (
      <Tooltip>
        <TooltipTrigger>
          <a
            className={cn(
              "text-primary font-medium underline underline-offset-4",
              className
            )}
            {...props}
          >
            {props.children}
          </a>
        </TooltipTrigger>
        <TooltipContent>{props.href}</TooltipContent>
      </Tooltip>
    );
  },
});
