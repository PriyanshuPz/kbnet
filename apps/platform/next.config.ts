import type { NextConfig } from "next";
// @ts-ignore
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";
const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,

  webpack: (config, { isServer }) => {
    config.plugins = [...config.plugins, new PrismaPlugin()];
    if (!isServer) {
    }
    return config;
  },

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
