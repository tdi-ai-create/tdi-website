import Link from 'next/link';
import { TabbedCalculator } from '@/components/calculators';

export const metadata = {
  title: 'Impact Calculator | Teachers Deserve It',
  description: 'See the potential impact of TDI on your teaching career or school.',
};

export default function CalculatorPage() {
  return (
    <main>
      {/* Hero Section with Calculator */}
      <section className="relative min-h-screen flex items-center justify-center py-16 px-4">

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
          <h1 className="sr-only">TDI Impact Calculator</h1>
          <TabbedCalculator defaultTab="teachers" />
        </div>

      </section>

      {/* Explore Further Section */}
      <section className="py-12 px-4" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-3" style={{ color: '#1e2749' }}>
            Ready to Take the Next Step?
          </h2>
          <p className="text-sm md:text-base mb-6" style={{ color: '#1e2749', opacity: 0.7 }}>
            Join 87,000+ educators who are building sustainable teaching practices.
          </p>
          <Link
            href="/join"
            className="inline-block px-8 py-3 rounded-full font-bold transition-all hover:shadow-lg hover:-translate-y-1"
            style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
          >
            Explore More Free Resources
          </Link>
        </div>
      </section>
    </main>
  );
}
