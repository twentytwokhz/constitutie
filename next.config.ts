import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Enable React 19 features
  reactStrictMode: true,

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Fix workspace root detection when multiple lockfiles exist
  outputFileTracingRoot: path.join(import.meta.dirname, "./"),

  // Turbopack root to fix dev server workspace detection
  turbopack: {
    root: path.join(import.meta.dirname, "./"),
  },
};

export default withNextIntl(nextConfig);
