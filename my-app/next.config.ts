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
    // Story recordings are allowed up to 20 MB. The proxy otherwise keeps
    // the first 10 MB, and the cut-off upload crashes with "Unexpected end of form".
    proxyClientMaxBodySize: "22mb",
    serverActions: {
      bodySizeLimit: "22mb",
    },
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
