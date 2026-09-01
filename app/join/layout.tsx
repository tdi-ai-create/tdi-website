import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'For Teachers - Free PD Tools & Resources',
  description: 'Free classroom tools, weekly strategies, and a community of 100,000+ educators. Courses, quick wins, and resources built for teachers and paras.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
