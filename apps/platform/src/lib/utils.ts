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
  subsets: ["latin"],
  variable: "--font-heading",
});

export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000";
export const WS_SERVER_URL =
  process.env.NEXT_PUBLIC_WS_SERVER_URL || "ws://localhost:8000/ws";

export const getAnimationVariants = (swipeDirection: Direction | null) => {
  // Default variants if no direction specified
  if (!swipeDirection) {
    return {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 },
    };
  }

  // Direction-specific animations
  switch (swipeDirection) {
    case "up":
      return {
        initial: { opacity: 0, y: "100%" },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: "-100%" },
      };
    case "down":
      return {
        initial: { opacity: 0, y: "-100%" },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: "100%" },
      };
    case "left":
      return {
        initial: { opacity: 0, x: "100%" },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: "-100%" },
      };
    case "right":
      return {
        initial: { opacity: 0, x: "-100%" },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: "100%" },
      };
    default:
      return {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 },
      };
  }
};
