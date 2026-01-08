'use client';

import Link from 'next/link';

interface FrameworkHeroProps {
  onCtaClick?: (ctaName: string, ctaLocation: string) => void;
}

export default function FrameworkHero({ onCtaClick }: FrameworkHeroProps) {
  return (
    <section className="relative min-h-[600px] flex items-center py-16">
      {/* Background Image with Parallax */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/hero-schools.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 39, 73, 0.92) 0%, rgba(27, 73, 101, 0.88) 100%)',
        }}
      />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <Link
              href="/pd-diagnostic?utm_source=framework&utm_medium=page&utm_campaign=diagnostic_cta"
              className="text-white/70 hover:text-white text-sm transition-colors"
            >
              PD Diagnostic
            </Link>
            <span className="text-white/50 mx-2">→</span>
            <span className="text-white text-sm">Full Framework</span>
          </nav>

          {/* Badge */}
          <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <span className="text-white/80 text-sm font-medium">3 minute read</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            The 4 Types of PD
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-white/80 mb-6">
            Understanding where you are is the first step to getting where you want to be.
          </p>

          {/* Non-judgmental framing */}
          <p className="text-base text-white/60 max-w-2xl mx-auto mb-8">
            None of these types are inherently wrong. They reflect reasonable decisions made under real constraints. This is a diagnostic, not a critique.
          </p>

          {/* CTA */}
          <Link
            href="/pd-diagnostic?utm_source=framework&utm_medium=page&utm_campaign=diagnostic_cta"
            onClick={() => onCtaClick?.('diagnostic_cta', 'hero')}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors font-medium"
          >
            Haven't taken the diagnostic yet? Start here →
          </Link>
        </div>
      </div>
    </section>
  );
}
