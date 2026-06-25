import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TDI Learning Hub | Free PD for Educators',
  description: 'On-demand PD courses, quick wins, AI tutoring, and community -- all in one place. Memberships from $5/month with PD certificates approved in all 50 states.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
