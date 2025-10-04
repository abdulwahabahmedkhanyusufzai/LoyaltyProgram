import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable ESLint errors during production builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Experimental Next.js options
      missingSuspenseWithCSRBailout: false,

};

export default nextConfig;
