import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get Your Free PD Plan | Teachers Deserve It',
  description: 'Select your role and get a custom PD plan within 24 hours. For teachers, paras, building leaders, and district leaders. No account needed.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
