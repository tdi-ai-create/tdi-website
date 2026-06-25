import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Professional Development for Schools & Districts | Teachers Deserve It',
  description: 'Partner with TDI for research-backed PD that delivers 74% implementation -- 7.4x the industry average. Phased support for teachers, paras, and leadership teams.',
};

export default function ForSchoolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
