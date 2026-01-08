import { TabbedCalculator } from '@/components/calculators';

export const metadata = {
  title: 'Impact Calculator | Teachers Deserve It',
  description: 'See the potential impact of TDI on your teaching career or school.',
};

export default function CalculatorPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center py-16 px-4"
      style={{ backgroundColor: '#1e2749' }}
    >
      <div className="w-full max-w-2xl">
        <TabbedCalculator defaultTab="teachers" />
      </div>
    </main>
  );
}
