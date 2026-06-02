import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Redirecting to Learning Hub',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ParaGameToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
