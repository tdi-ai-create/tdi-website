import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Path Forward | PD Framework',
  description: 'You know where your PD sits. Now see how schools move toward embedded, sustainable professional development. Discover your path forward with TDI.',
};

export default function PDFrameworkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
