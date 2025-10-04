import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Other config options here
  eslint: {
    // Disables ESLint during production builds
    ignoreDuringBuilds: true,
  },
  
};

export default nextConfig;
