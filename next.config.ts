import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Keep unrelated lockfiles in parent directories out of this application's build.
  turbopack: { root: process.cwd() },
  async redirects() {
    // Keep existing booking links working until the native NLA flow is ready.
    return ['/book-appointment', '/en/book-appointment', '/es/book-appointment'].map((source) => ({
      source,
      destination: 'https://whos-next-frontend.vercel.app/book/cmn7rxnc6000001ofxq4dea0q',
      permanent: false,
    }));
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Allow all HTTPS external images (product images come from 248+ domains)
      { protocol: 'https', hostname: '**' },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default withNextIntl(nextConfig);
