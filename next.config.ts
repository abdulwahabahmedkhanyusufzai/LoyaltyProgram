import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Other config options here
  eslint: {
    // Disables ESLint during production builds
    ignoreDuringBuilds: true,
  },
  
};

export default nextConfig;
