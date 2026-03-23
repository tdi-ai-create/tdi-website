import { Metadata } from 'next';
import MovementPageClient from './MovementPageClient';

export const metadata: Metadata = {
  title: 'Teachers Deserve Voice and Choice | Teachers Deserve It',
  description: 'Join thousands of educators who believe PD should be chosen, not assigned. Sign the petition for teacher autonomy in professional growth.',
  openGraph: {
    title: 'Teachers Deserve Voice and Choice',
    description: 'Join thousands of educators who believe PD should be chosen, not assigned.',
    url: 'https://teachersdeserveit.com/movement',
  },
};

export default function MovementPage() {
  return <MovementPageClient />;
}
