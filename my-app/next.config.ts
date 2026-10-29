import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { wordImageRemotePatterns } from "./lib/content/word-image";

const nextConfig: NextConfig = {
  // The dev server is bound on all interfaces. Next.js otherwise blocks
  // 127.0.0.1 dev tooling, so the page renders but never hydrates.
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: wordImageRemotePatterns,
  },
  experimental: {
    optimizePackageImports: ["radix-ui"],
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
