import { clsx, type ClassValue } from "clsx";
import { Delicious_Handrawn } from "next/font/google";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export const secondaryFonts = Delicious_Handrawn({
  weight: "400",
  variable: "--font-heading",
});

export const WS_SERVER_URL =
  process.env.NEXT_PUBLIC_WS_SERVER_URL || "ws://localhost:8000/ws";
