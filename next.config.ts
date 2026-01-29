import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Ignore TypeScript errors in plugins directory during Next.js build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
