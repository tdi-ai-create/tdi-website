import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nominate a School | Teachers Deserve It',
  description: 'Know a school that deserves better professional development? Nominate them for a TDI partnership. Only 5 Blueprint Founders Circle spots available each semester.',
};

export default function NominateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
