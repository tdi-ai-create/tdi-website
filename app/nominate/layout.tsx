import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nominate a School | Teachers Deserve It',
  description: 'Know a school that deserves better professional development? Nominate them for a TDI partnership. Only 4 Blueprint Founders Circle spots available for Fall 2026.',
  openGraph: {
    title: 'Nominate a School for Better PD | Teachers Deserve It',
    description: 'Know a school that deserves better professional development? Nominate them for a TDI partnership and earn rewards when it leads to a partnership.',
    images: [
      {
        url: '/images/og-nominate.jpg',
        width: 1200,
        height: 630,
        alt: 'Nominate a School for TDI Partnership',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nominate a School for Better PD | Teachers Deserve It',
    description: 'Know a school that deserves better professional development? Nominate them for a TDI partnership.',
    images: ['/images/og-nominate.jpg'],
  },
};

export default function NominateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
