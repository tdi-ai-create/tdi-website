import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/staff-photos/**',
      },
    ],
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
        destination: '/hub/quick-wins',
        permanent: true,
      },
      {
        source: '/paragametools',
        destination: '/hub/quick-wins',
        permanent: false,
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
        source: '/seed',
        destination: '/',
        permanent: true,
      },
      {
        source: '/documents/TDI-Seed-Funding-Deck.pdf',
        destination: '/',
        permanent: true,
      },
      {
        source: '/guest-promo-toolkit',
        destination: 'https://docs.google.com/document/d/1yAcAKpz03pWdQ0A9ZvEFxcdgiUtEfwtn/view',
        permanent: false,
      },
      {
        source: '/wego-dashboard',
        destination: '/',
        permanent: true,
      },
      {
        source: '/asd4-dashboard',
        destination: '/',
        permanent: true,
      },
      {
        source: '/asd4-dashboard/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/stpchanel-dashboard',
        destination: '/',
        permanent: true,
      },
      {
        source: '/stpchanel-dashboard/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/tccs-dashboard',
        destination: '/',
        permanent: true,
      },
      {
        source: '/dashboard-creation-team-use',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
