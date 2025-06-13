import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const fonts = Ubuntu({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "KBNet",
  description: "Powered by MindsDB, KBNet is a knowledge base platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(fonts.className, "antialiased")}>{children}</body>
    </html>
  );
}
