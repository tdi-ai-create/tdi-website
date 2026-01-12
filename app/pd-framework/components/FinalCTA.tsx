'use client';

import Link from 'next/link';

interface FinalCTAProps {
  onCtaClick?: (ctaName: string, ctaLocation: string) => void;
}

export default function FinalCTA({ onCtaClick }: FinalCTAProps) {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#1e2749' }}>
            Ready to Take the Next Step?
          </h2>
          <p className="text-lg mb-8" style={{ color: '#1e2749', opacity: 0.7 }}>
            Let's talk about where your school is and where you want to go.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Primary CTA */}
            <Link
              href="/contact?utm_source=framework&utm_medium=page&utm_campaign=schedule"
              onClick={() => onCtaClick?.('schedule_cta', 'final_cta')}
              className="inline-block px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-lg hover:-translate-y-0.5"
              style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
            >
              Start the Conversation
            </Link>

            {/* Secondary CTA */}
            <Link
              href="/free-pd-plan?utm_source=framework&utm_medium=page&utm_campaign=pdplan"
              onClick={() => onCtaClick?.('pdplan_cta', 'final_cta')}
              className="inline-block px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-lg hover:-translate-y-0.5 border-2"
              style={{ backgroundColor: 'transparent', color: '#1e2749', borderColor: '#1e2749' }}
            >
              Get Your Free PD Plan
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
