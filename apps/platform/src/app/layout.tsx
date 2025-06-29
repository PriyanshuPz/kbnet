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

const BASE_URL = "https://kbnet.p8labs.tech";

export const metadata: Metadata = {
  title: "KbNet",
  description: "Powered by MindsDB, KbNet is a knowledge base platform.",
  keywords: ["knowledge base", "kbnet", "mindsdb", "knowledge management"],

  twitter: {
    title: "KbNet",
    description: "Powered by MindsDB, KbNet is a knowledge base platform.",
    card: "summary_large_image",
    creator: "@PriyanshuPz",
    images:
      "https://res.cloudinary.com/pz-public-assets/image/upload/v1750742752/kbnet_landing_otyohg.png",
  },
  openGraph: {
    type: "website",
    title: "KbNet",
    description: "Powered by MindsDB, KbNet is a knowledge base platform.",
    images:
      "https://res.cloudinary.com/pz-public-assets/image/upload/v1750742752/kbnet_landing_otyohg.png",
    url: BASE_URL,
    siteName: "KbNet",

    videos:
      "https://res.cloudinary.com/pz-public-assets/video/upload/v1750742807/KbNet_Demo_lhgkfy.mp4",
  },
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
          defaultTheme="light"
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
