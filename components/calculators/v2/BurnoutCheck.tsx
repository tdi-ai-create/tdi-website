'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Thermometer } from './visuals';

const stressMap: Record<number, { color: string; light: string; label: string }> = {
  1:  { color: '#80a4ed', light: '#a8c0f0', label: 'Mostly steady' },
  2:  { color: '#80a4ed', light: '#a8c0f0', label: 'Steady' },
  3:  { color: '#80a4ed', light: '#b8d0f5', label: 'Manageable' },
  4:  { color: '#ffba06', light: '#ffd54a', label: 'Tired but okay' },
  5:  { color: '#ffba06', light: '#ffd54a', label: 'Stretched' },
  6:  { color: '#ff9438', light: '#ffb46c', label: 'Wearing thin' },
  7:  { color: '#F96767', light: '#fb9090', label: 'Carrying too much' },
  8:  { color: '#F96767', light: '#fb9090', label: 'Running on empty' },
  9:  { color: '#e54545', light: '#F96767', label: 'Close to breaking' },
  10: { color: '#c93030', light: '#e54545', label: 'In crisis' },
};

const stressInsights = {
  low: { text: 'Teachers who maintain stress below 5/10 are 4x more likely to stay in the profession past year 10. Protecting that baseline matters.', src: 'Learning Policy Institute, 2024' },
  mid: { text: 'Stress in the 5-7 range is where most teachers live, and where most quietly start planning their exit. Sustained coaching is the single biggest predictor of recovery.', src: 'Joyce & Showers Implementation Research' },
  high: { text: 'Teachers reporting stress above 7/10 are 3x more likely to leave the profession within 2 years. Schools with sustained coaching reduce that by 60%.', src: 'Learning Policy Institute, 2024' },
};

export function BurnoutCheck() {
  const searchParams = useSearchParams();
  const stressParam = searchParams?.get('stress');
  const initialStress = stressParam ? Math.max(1, Math.min(10, parseInt(stressParam))) : 5;
  const [stress, setStress] = useState(isNaN(initialStress) ? 5 : initialStress);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const c = stressMap[stress];
  const future3 = Math.max(1, Math.round(stress * 0.85));
  const future6 = Math.max(1, Math.round(stress * 0.65));
  const future12 = Math.max(1, Math.round(stress * 0.5));
  const tier = stress <= 4 ? 'low' : stress <= 7 ? 'mid' : 'high';
  const insight = stressInsights[tier];

  const handleSubmit = async () => {
    if (!email) return;
    setSubmitting(true);
    try {
      await fetch('/api/calculator/teacher-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, calculator: 'burnout', stressLevel: stress, tier }),
      });
      setSubmitted(true);
      window.location.href = `/learning/plans?email=${encodeURIComponent(email)}&role=Teacher`;
    } catch (err) {
      console.error('[burnout-capture] error', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#c2410c] to-[#F96767] text-white rounded-xl p-6 md:p-8 mb-6 relative overflow-hidden">
        <div className="text-[10px] uppercase tracking-widest text-white/80 font-semibold mb-2">For Teachers</div>
        <h2 className="font-serif text-lg md:text-xl font-semibold leading-snug mb-2">
          Where is your stress today, and where could it be in 12 months?
        </h2>
        <p className="text-sm text-white/90 leading-relaxed">
          One question. Real research. The truth about what happens when you stop carrying it alone.
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 md:p-10 relative">
        <div className="absolute top-0 left-0 w-16 h-1 bg-[#ffba06] rounded-tl-xl" />

        <h3 className="font-serif text-lg md:text-xl font-semibold text-[#1e2749] text-center mb-6 leading-snug">
          On a scale of 1 to 10, how stressed are you right now?
        </h3>

        {/* Thermometer + number + slider */}
        <div className="grid md:grid-cols-[auto_1fr] gap-10 items-center mb-8">
          <div className="flex justify-center">
            <Thermometer value={stress} size="medium" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5 mb-6">
              <span
                className="font-serif text-6xl md:text-7xl font-bold leading-none transition-colors"
                style={{ color: c.color }}
              >
                {stress}
              </span>
              <span className="text-xl text-gray-500 font-medium">/10</span>
            </div>
            <div className="font-serif text-xl italic text-gray-700 mb-7">{c.label}</div>

            {/* Slider */}
            <input
              type="range"
              min={1} max={10} step={1}
              value={stress}
              onChange={(e) => setStress(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: c.color }}
            />
            <div className="flex justify-between mt-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">
              <span>Steady</span>
              <span>In crisis</span>
            </div>
          </div>
        </div>

        {/* Insight */}
        <div
          className="border-l-4 p-5 mb-7 rounded"
          style={{ borderColor: c.color, background: `${c.color}10` }}
        >
          <p className="font-serif text-base italic text-gray-900 leading-relaxed mb-2">
            &ldquo;{insight.text}&rdquo;
          </p>
          <p className="text-sm text-gray-500">&mdash; {insight.src}</p>
        </div>

        {/* Projection */}
        <div className="border-t border-gray-200 pt-7 mb-7">
          <h4 className="font-serif text-xl font-semibold text-[#1e2749] text-center mb-5">
            Your stress trajectory with sustained support
          </h4>
          <div className="grid grid-cols-4 gap-3">
            <TimelineStop when="Today" value={stress} color={c.color} current />
            <TimelineStop when="3 mo" value={future3} color="#ffba06" />
            <TimelineStop when="6 mo" value={future6} color="#80a4ed" />
            <TimelineStop when="12 mo" value={future12} color="#80a4ed" />
          </div>
        </div>

        {/* Capture */}
        <div className="bg-[#1e2749] rounded-lg p-7 text-center text-white">
          <h4 className="font-serif text-xl font-semibold mb-2">You don&apos;t have to carry this alone.</h4>
          <p className="text-base text-white/85 mb-5 leading-relaxed">
            Join the TDI Learning Hub. Practical strategies, real coaching, and a community of educators who get it.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto mb-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@school.edu"
              className="flex-1 px-4 py-3 rounded-lg text-base text-gray-900 border-0 focus:outline-none focus:ring-2 focus:ring-[#ffba06]"
            />
            <button
              onClick={handleSubmit}
              disabled={!email || submitting}
              className="px-6 py-3 bg-[#ffba06] text-[#1e2749] font-semibold rounded-lg hover:bg-[#e6a505] disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Joining...' : 'Join the Hub'}
            </button>
          </div>
          <p className="text-xs text-white/60">
            100,000+ educators across all 50 states. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

function TimelineStop({ when, value, color, current }: { when: string; value: number; color: string; current?: boolean }) {
  return (
    <div
      className={`text-center p-5 rounded-lg border ${current ? 'border-2' : 'border-gray-200'}`}
      style={current ? { borderColor: color, background: `${color}10` } : { background: '#fafafa' }}
    >
      <div className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2.5">{when}</div>
      <div className="flex justify-center mb-2.5">
        <Thermometer value={value} size="small" />
      </div>
      <div className="font-serif text-2xl font-bold leading-none" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
