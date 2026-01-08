'use client';

import Link from 'next/link';
import { ClipboardCheck, Sparkles, Puzzle, Target, ArrowRight } from 'lucide-react';

interface TDIPhasesProps {
  onCtaClick?: (ctaName: string, ctaLocation: string) => void;
  onFundingClick?: () => void;
}

export default function TDIPhases({ onCtaClick, onFundingClick }: TDIPhasesProps) {
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: '#1e2749' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
            Where TDI Fits
          </h2>
          <p className="text-center text-lg mb-12 text-white/70">
            TDI partners with schools to move toward Embedded Practice through three phases.
          </p>

          {/* Quadrant to Phase Mapping */}
          <div className="bg-white/10 rounded-2xl p-6 md:p-8 mb-12">
            <h3 className="text-xl font-bold text-white mb-6 text-center">
              Your Starting Point → Your Phase
            </h3>

            <div className="space-y-4">
              {/* Compliance → IGNITE */}
              <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <ClipboardCheck className="text-slate-600" size={20} />
                </div>
                <span className="text-white/80 flex-shrink-0">Compliance-Focused</span>
                <ArrowRight className="text-white/40 flex-shrink-0" size={20} />
                <span className="font-bold" style={{ color: '#ffba06' }}>Start with IGNITE</span>
              </div>

              {/* Inspiration → IGNITE */}
              <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="text-blue-600" size={20} />
                </div>
                <span className="text-white/80 flex-shrink-0">Inspiration-Driven</span>
                <ArrowRight className="text-white/40 flex-shrink-0" size={20} />
                <span className="font-bold" style={{ color: '#ffba06' }}>Start with IGNITE</span>
              </div>

              {/* Fragmented → IGNITE or ACCELERATE */}
              <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Puzzle className="text-amber-600" size={20} />
                </div>
                <span className="text-white/80 flex-shrink-0">Fragmented Growth</span>
                <ArrowRight className="text-white/40 flex-shrink-0" size={20} />
                <span className="font-bold" style={{ color: '#ffba06' }}>IGNITE or ACCELERATE</span>
                <span className="text-white/50 text-sm">(depends on infrastructure)</span>
              </div>

              {/* Embedded → SUSTAIN */}
              <div className="flex items-center gap-4 bg-white/5 rounded-xl p-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Target className="text-emerald-600" size={20} />
                </div>
                <span className="text-white/80 flex-shrink-0">Embedded Practice</span>
                <ArrowRight className="text-white/40 flex-shrink-0" size={20} />
                <span className="font-bold" style={{ color: '#ffba06' }}>SUSTAIN</span>
                <span className="text-white/50 text-sm">(maintain and scale)</span>
              </div>
            </div>
          </div>

          {/* Phase Explainers */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#ffba06' }}>
                <span className="font-bold text-lg" style={{ color: '#1e2749' }}>1</span>
              </div>
              <h4 className="font-bold text-white mb-2">IGNITE</h4>
              <p className="text-sm text-white/70">
                Build the foundation. Introduce sustainable strategies and get early wins.
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#ffba06' }}>
                <span className="font-bold text-lg" style={{ color: '#1e2749' }}>2</span>
              </div>
              <h4 className="font-bold text-white mb-2">ACCELERATE</h4>
              <p className="text-sm text-white/70">
                Deepen implementation. Expand support to all staff roles.
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#ffba06' }}>
                <span className="font-bold text-lg" style={{ color: '#1e2749' }}>3</span>
              </div>
              <h4 className="font-bold text-white mb-2">SUSTAIN</h4>
              <p className="text-sm text-white/70">
                Lock it in. Systems run without constant oversight.
              </p>
            </div>
          </div>

          {/* Outcome Stats */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <p className="text-4xl font-bold mb-2" style={{ color: '#ffba06' }}>40%</p>
              <p className="text-white/70 text-sm">
                improvement in teacher retention within 2 years (partner schools)
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <p className="text-4xl font-bold mb-2" style={{ color: '#ffba06' }}>65%</p>
              <p className="text-white/70 text-sm">
                implementation rate vs. 15% industry average
              </p>
            </div>
          </div>

          {/* Funding Callout */}
          <div
            className="rounded-2xl p-6 md:p-8 mb-8"
            style={{ backgroundColor: '#ffba06' }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-lg mb-1" style={{ color: '#1e2749' }}>
                  Wondering about budget?
                </h4>
                <p className="text-sm" style={{ color: '#1e2749', opacity: 0.8 }}>
                  80% of our partner schools secure external funding to cover PD costs.
                </p>
              </div>
              <Link
                href="/funding?utm_source=framework&utm_medium=page&utm_campaign=funding"
                onClick={() => {
                  onFundingClick?.();
                  onCtaClick?.('funding_cta', 'tdi_phases');
                }}
                className="inline-block px-6 py-3 rounded-full font-semibold transition-all hover:shadow-lg flex-shrink-0"
                style={{ backgroundColor: '#1e2749', color: '#ffffff' }}
              >
                See funding options →
              </Link>
            </div>
          </div>

          {/* Pricing CTA */}
          <div className="text-center">
            <Link
              href="/for-schools?utm_source=framework&utm_medium=page&utm_campaign=pricing"
              onClick={() => onCtaClick?.('pricing_cta', 'tdi_phases')}
              className="inline-block px-8 py-4 rounded-full font-semibold transition-all hover:shadow-lg"
              style={{ backgroundColor: '#ffffff', color: '#1e2749' }}
            >
              See pricing →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
