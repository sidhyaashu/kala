// File: next.config.ts

import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

// THE FINAL FIX: Explicitly tell the plugin where your i18n configuration is.
// This is necessary because your file is named `i18n.ts` and is in the root,
// which is not the default location the plugin looks for.
const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "plus.unsplash.com", pathname: "/**" },
    ],
  },
};

export default withNextIntl(nextConfig);