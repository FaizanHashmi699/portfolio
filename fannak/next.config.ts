import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Portability hedge (Step 2 §6.2): a standalone build must always be
  // producible so relocating to AWS me-central-2 (Riyadh) is a deploy,
  // not a rewrite.
  output: "standalone",
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
