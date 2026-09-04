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
        // Retired Sept 2026 with the other interactive tools. The questions
        // are preserved in docs/pd-diagnostic-questions.md.
        source: '/pd-diagnostic',
        destination: '/get-started',
        permanent: true,
      },
      {
        source: '/calculator',
        destination: '/for-schools',
        permanent: true,
      },
      {
        source: '/how-we-partner',
        destination: '/for-schools',
        permanent: true,
      },
      {
        source: '/pd-framework',
        destination: '/for-schools',
        permanent: true,
      },
      {
        source: '/what-we-offer',
        destination: '/for-schools',
        permanent: true,
      },
      {
        source: '/learning',
        destination: '/join',
        permanent: true,
      },
      {
        source: '/learning/plans',
        destination: '/join',
        permanent: true,
      },
      {
        source: '/hub/subscribe',
        destination: '/hub/membership',
        permanent: true,
      },
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
      // Retired hand-coded client dashboards. Every partnership now lives at
      // /partners/<slug>, which is the only surface with the Reports tab. These
      // pages showed older data from a separate source and are gone.
      {
        source: '/Allenwood-Dashboard',
        destination: '/',
        permanent: true,
      },
      {
        source: '/Allenwood-Dashboard/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/D41-dashboard',
        destination: '/',
        permanent: true,
      },
      {
        source: '/D41-dashboard/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/saunemin-dashboard',
        destination: '/',
        permanent: true,
      },
      {
        source: '/saunemin-dashboard/:path*',
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
