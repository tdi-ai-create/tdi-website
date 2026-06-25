import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Teachers Deserve It | Our Team & Mission',
  description: 'Born from burnout, built by teachers. Meet the team behind TDI and learn how we are changing professional development for 100,000+ educators across all 50 states.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
