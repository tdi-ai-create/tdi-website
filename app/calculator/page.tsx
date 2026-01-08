import { TabbedCalculator } from '@/components/calculators';

export const metadata = {
  title: 'Impact Calculator | Teachers Deserve It',
  description: 'See the potential impact of TDI on your teaching career or school.',
};

export default function CalculatorPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center py-16 px-4">

      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/images/hero-rae-background.png')",
          backgroundSize: '150%',
          backgroundPosition: '15% 25%',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Navy Gradient Overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 39, 73, 0.92) 0%, rgba(30, 39, 73, 0.85) 100%)'
        }}
      />

      {/* Calculator Content */}
      <div className="relative z-20 w-full max-w-2xl">
        <TabbedCalculator defaultTab="teachers" />
      </div>

    </main>
  );
}
