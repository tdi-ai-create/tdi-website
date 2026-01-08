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
            Ready to See Where Your School Sits?
          </h2>
          <p className="text-lg mb-8" style={{ color: '#1e2749', opacity: 0.7 }}>
            Take a few minutes to get clarity on your current state and what might come next.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Primary CTA */}
            <Link
              href="/pd-diagnostic?utm_source=framework&utm_medium=page&utm_campaign=final_cta"
              onClick={() => onCtaClick?.('diagnostic_cta', 'final_cta')}
              className="inline-block px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-lg hover:-translate-y-0.5"
              style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
            >
              Take the Diagnostic
            </Link>

            {/* Secondary CTA */}
            <Link
              href="/for-schools/schedule-call?utm_source=framework&utm_medium=page&utm_campaign=final_cta"
              onClick={() => onCtaClick?.('schedule_cta', 'final_cta')}
              className="inline-block px-8 py-4 rounded-full font-semibold text-lg transition-all hover:shadow-lg hover:-translate-y-0.5 border-2"
              style={{ backgroundColor: 'transparent', color: '#1e2749', borderColor: '#1e2749' }}
            >
              Schedule a Conversation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
