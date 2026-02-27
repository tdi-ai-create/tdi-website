import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'For Schools | Teachers Deserve It',
  description: 'Professional development that actually works, with outcomes you can measure and report. 65% implementation rate vs. 10% industry average.',
};

export default function ForSchoolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
