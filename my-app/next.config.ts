import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // The dev server is bound on all interfaces. Next.js otherwise blocks
  // 127.0.0.1 dev tooling, so the page renders but never hydrates.
  allowedDevOrigins: ["127.0.0.1"],
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
