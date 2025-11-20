import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: 2 * 1024 * 1024, // 2MB in bytes
    },
  },
};

export default withNextIntl(nextConfig);
