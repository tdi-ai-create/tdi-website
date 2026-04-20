import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/seed',
        destination: '/seed/index.html',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/for-schools/schedule-call',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/gametools',
        destination: '/paragametools',
        permanent: true,
      },
      {
        source: '/blog',
        destination: 'https://raehughart.substack.com/',
        permanent: true,
      },
      {
        source: '/blog/:path*',
        destination: 'https://raehughart.substack.com/',
        permanent: true,
      },
      {
        source: '/guest-promo-toolkit',
        destination: 'https://docs.google.com/document/d/1yAcAKpz03pWdQ0A9ZvEFxcdgiUtEfwtn/view',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
