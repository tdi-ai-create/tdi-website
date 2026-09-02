import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'For Schools & Districts',
  description:
    '10 things a school gets out of working with TDI, and four ways to get there. Every one hands you a one-page result before April budget talks, not after.',
};

export default function ForSchoolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
