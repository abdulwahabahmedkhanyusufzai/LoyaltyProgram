const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Disables ESLint during production builds
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
