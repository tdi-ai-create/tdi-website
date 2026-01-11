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

          {/* Phase Explainers - Timeline Style */}
          <div className="max-w-5xl mx-auto mb-12">
            {/* Timeline connector line - visible on desktop */}
            <div className="hidden md:block relative">
              <div
                className="absolute top-[24px] left-[16.67%] right-[16.67%] h-1 rounded-full"
                style={{ backgroundColor: '#80a4ed' }}
              />
            </div>

            {/* Timeline Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Phase 1: IGNITE */}
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4 relative z-10"
                  style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                >
                  1
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-md w-full" style={{ border: '2px solid #ffba06' }}>
                  <span
                    className="inline-block px-3 py-1 text-xs font-bold rounded-full mb-3"
                    style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                  >
                    START HERE
                  </span>
                  <h3 className="text-2xl font-bold" style={{ color: '#1e2749' }}>IGNITE</h3>
                  <p className="text-sm font-medium mb-3" style={{ color: '#ffba06' }}>Getting Started</p>
                  <p className="text-sm mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
                    Build buy-in with leadership and a pilot group. <strong>95% report saving planning time.</strong>
                  </p>
                  <ul className="text-sm text-left space-y-1 mb-4" style={{ color: '#1e2749', opacity: 0.8 }}>
                    <li>• 2 On-Campus PD Days</li>
                    <li>• 4 Virtual Strategy Sessions</li>
                    <li>• 2 Executive Impact Sessions</li>
                    <li>• Learning Hub for pilot group</li>
                    <li>• Leadership Dashboard</li>
                  </ul>
                  <Link
                    href="/free-pd-plan?utm_source=framework&utm_medium=page&utm_campaign=pdplan"
                    onClick={() => onCtaClick?.('pdplan_cta', 'ignite_card')}
                    className="block text-center py-3 rounded-lg font-bold transition-all hover:scale-105"
                    style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                  >
                    Get Your Free PD Plan
                  </Link>
                </div>
              </div>

              {/* Phase 2: ACCELERATE */}
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4 relative z-10"
                  style={{ backgroundColor: '#80a4ed', color: '#ffffff' }}
                >
                  2
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm w-full">
                  <h3 className="text-2xl font-bold" style={{ color: '#1e2749' }}>ACCELERATE</h3>
                  <p className="text-sm font-medium mb-3" style={{ color: '#ffba06' }}>Full Implementation</p>
                  <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                    Deepen implementation. Expand support to all staff roles.
                  </p>
                </div>
              </div>

              {/* Phase 3: SUSTAIN */}
              <div className="flex flex-col items-center text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4 relative z-10"
                  style={{ backgroundColor: '#80a4ed', color: '#ffffff' }}
                >
                  3
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm w-full">
                  <h3 className="text-2xl font-bold" style={{ color: '#1e2749' }}>SUSTAIN</h3>
                  <p className="text-sm font-medium mb-3" style={{ color: '#ffba06' }}>Long-Term Partnership</p>
                  <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                    Lock it in. Systems run without constant oversight.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Outcome Stats */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <p className="text-4xl font-bold mb-2" style={{ color: '#ffba06' }}>40%</p>
              <p className="text-white/70 text-sm">
                improvement in teacher retention<br />within 2 years (partner schools)
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <p className="text-4xl font-bold mb-2" style={{ color: '#ffba06' }}>65%</p>
              <p className="text-white/70 text-sm">
                implementation rate<br />vs. 15% industry average
              </p>
            </div>
          </div>

          {/* Funding Callout */}
          <div
            className="rounded-2xl p-6 md:p-8 mb-8 bg-white"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-lg mb-1" style={{ color: '#1e2749' }}>
                  Wondering about budget?
                </h4>
                <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
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
                style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
              >
                See funding options →
              </Link>
            </div>
          </div>

          {/* Partnership Model Link */}
          <div className="text-center">
            <p className="text-white/60 text-sm mb-3">Ready for more than a framework?</p>
            <Link
              href="/how-we-partner"
              className="inline-flex items-center gap-2 text-lg font-semibold transition-all hover:gap-3"
              style={{ color: '#ffba06' }}
            >
              See our partnership model in detail
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
