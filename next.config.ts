import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
        destination: 'https://raehughart.substack.com',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
