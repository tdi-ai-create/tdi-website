import { CalculatorSuite } from '@/components/calculators/v2/CalculatorSuite';

export const metadata = {
  title: 'Impact Calculator | Teachers Deserve It',
  description: 'Build your board memo with grant funding pathways, or check in on your stress and joy as an educator.',
};

export default function CalculatorPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-[#1e2749] text-white py-12 md:py-16 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight">
            See What&apos;s Possible
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Whether you lead a school or teach in one, the right numbers can change the conversation.
          </p>
        </div>
        {/* Yellow accent strip at bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#ffba06]" />
      </section>

      {/* Calculator Suite */}
      <section className="bg-[#f5f5f5] py-12 md:py-16 px-6">
        <CalculatorSuite defaultTab="admin" />
      </section>
    </main>
  );
}
