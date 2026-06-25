import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How We Partner With Schools | Teachers Deserve It',
  description: 'Discover the TDI Blueprint: a three-phase partnership model (Ignite, Accelerate, Sustain) that delivers measurable PD implementation and teacher retention.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
