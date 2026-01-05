import { TabbedCalculator } from '@/components/calculators/TabbedCalculator';

export default function CalculatorPage() {
  return (
    <main className="min-h-screen py-12" style={{ backgroundColor: 'var(--tdi-gray)' }}>
      <div className="container-default px-6">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: '#1e2749' }}>
          Impact Calculator
        </h1>
        <p className="text-center mb-8 max-w-2xl mx-auto" style={{ color: '#1e2749', opacity: 0.7 }}>
          Whether you're a school leader or a teacher, explore the potential impact of partnering with TDI.
        </p>
        <TabbedCalculator />
      </div>
    </main>
  );
}
