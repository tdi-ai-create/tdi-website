import { Metadata } from 'next';
import BrccPageClient from './BrccPageClient';

export const metadata: Metadata = {
  title: 'The Five Moves',
  description:
    'Everything from The Adults We Forgot, free. The five moves, the twenty most used tools, and one follow up email in three weeks.',
  openGraph: {
    title: 'The Five Moves',
    description:
      'From the BRCC 2026 session on the adults closest to your highest-need students. Free, no account, nothing to sign up for.',
    url: 'https://teachersdeserveit.com/brcc',
  },
};

export default function BrccPage() {
  return <BrccPageClient />;
}
