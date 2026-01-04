import { TDICalculatorLarge } from '@/components/calculators/TDICalculatorLarge';

export default function CalculatorPage() {
  return (
    <main className="min-h-screen py-12" style={{ backgroundColor: 'var(--tdi-peach)' }}>
      <div className="container-wide px-6">
        <TDICalculatorLarge />
      </div>
    </main>
  );
}
