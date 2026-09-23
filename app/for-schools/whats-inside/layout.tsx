import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "What's Inside the Hub",
  description:
    'What a school gets inside the TDI Learning Hub, sorted by the problem it solves. Paras, behavior, planning, families, leading adults, teacher load and AI.',
  alternates: { canonical: '/for-schools/whats-inside' },
  // Indexed on purpose. Nothing here opens a document, and the tool titles are
  // what leaders actually search for.
  robots: { index: true, follow: true },
};

export default function WhatsInsideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
