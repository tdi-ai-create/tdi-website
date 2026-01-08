'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface FrameworkHeroProps {
  onCtaClick?: (ctaName: string, ctaLocation: string) => void;
}

export default function FrameworkHero({ onCtaClick }: FrameworkHeroProps) {
  return (
    <>
      {/* Haven't taken diagnostic banner */}
      <section className="py-4" style={{ backgroundColor: '#ffba06' }}>
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg md:text-xl font-medium" style={{ color: '#1e2749' }}>
            Haven't taken the diagnostic yet?{' '}
            <Link
              href="/pd-diagnostic?utm_source=framework&utm_medium=page&utm_campaign=diagnostic_cta"
              onClick={() => onCtaClick?.('diagnostic_cta', 'hero')}
              className="font-bold underline hover:no-underline"
              style={{ color: '#1e2749' }}
            >
              Start there first →
            </Link>
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <Link
            href="/pd-diagnostic?utm_source=framework&utm_medium=page&utm_campaign=back_to_diagnostic"
            onClick={() => onCtaClick?.('back_to_diagnostic', 'hero')}
            className="inline-flex items-center gap-2 text-sm mb-4 transition-colors hover:opacity-80"
            style={{ color: '#80a4ed' }}
          >
            <ArrowLeft size={16} />
            Back to PD Diagnostic
          </Link>

          {/* Title */}
          <p className="text-base md:text-lg font-medium text-center" style={{ color: '#1e2749', opacity: 0.7 }}>
            You know where your PD sits. Here's how schools move toward sustainable, embedded practice.
          </p>
        </div>
      </div>
    </section>
    </>
  );
}
