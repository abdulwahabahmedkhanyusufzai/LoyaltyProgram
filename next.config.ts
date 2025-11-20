import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: 2 * 1024 * 1024, // 2MB in bytes
    },
  },
};

export default withNextIntl(nextConfig);
