'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface FrameworkHeroProps {
  onCtaClick?: (ctaName: string, ctaLocation: string) => void;
}

export default function FrameworkHero({ onCtaClick }: FrameworkHeroProps) {
  return (
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

          {/* Haven't taken diagnostic link */}
          <p className="text-sm mb-8" style={{ color: '#1e2749', opacity: 0.6 }}>
            Haven't taken the diagnostic yet?{' '}
            <Link
              href="/pd-diagnostic?utm_source=framework&utm_medium=page&utm_campaign=diagnostic_cta"
              onClick={() => onCtaClick?.('diagnostic_cta', 'hero')}
              className="font-medium underline hover:no-underline"
              style={{ color: '#80a4ed' }}
            >
              Start there first →
            </Link>
          </p>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#1e2749' }}>
            Now What? Your Path Forward
          </h1>

          {/* Subtitle */}
          <p className="text-xl" style={{ color: '#1e2749', opacity: 0.7 }}>
            You know where your PD sits. Here's how schools move toward sustainable, embedded practice.
          </p>
        </div>
      </div>
    </section>
  );
}
