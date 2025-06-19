import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/server/:path*",
          destination: `${
            process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:8000"
          }/:path*`,
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
