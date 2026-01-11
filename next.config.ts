import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/for-schools/schedule-call',
        destination: '/contact',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
