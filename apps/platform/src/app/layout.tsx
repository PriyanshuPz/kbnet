import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/providers/theme";
import { WSProvider } from "@/providers/ws";
import { Toaster } from "@/components/ui/sonner";

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
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(fonts.className, "antialiased")}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          // defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <WSProvider>
            {children}
            {modal}
          </WSProvider>
          <Toaster
            position="bottom-center"
            richColors
            visibleToasts={1}
            swipeDirections={["bottom", "top", "left", "right"]}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
