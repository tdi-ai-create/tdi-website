import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Teachers Deserve It',
  description: 'Schedule a 15-minute call or send us a message. Our team responds within 24 hours. No pressure, no pitch -- just a conversation about what is possible for your school.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
