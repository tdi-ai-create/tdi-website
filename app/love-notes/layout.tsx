import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Love Notes',
  description:
    'What a Love Note is, the rules every one follows, and a real example of what a teacher receives after a TDI classroom visit.',
};

export default function LoveNotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
