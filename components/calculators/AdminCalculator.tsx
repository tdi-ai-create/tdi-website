'use client';

import { useState } from 'react';

export function AdminCalculator() {
  const [morale, setMorale] = useState(5);
  const [benchmark, setBenchmark] = useState(50);

  // Calculate projected improvements
  const projectedMorale = Math.min(10, morale + 2);
  const projectedBenchmark = Math.min(95, benchmark + Math.round(benchmark * 0.08 + 4));

  const getMoraleLabel = (value: number) => {
    if (value <= 3) return 'Crisis mode';
    if (value <= 5) return 'Getting by';
    if (value <= 7) return 'Stable';
    return 'Thriving';
  };

  return (
    <div className="space-y-8">
      {/* Input: Student Benchmark */}
      <div>
        <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
          What percentage of students are at grade-level benchmark?
        </label>
        <input
          type="range"
          min="20"
          max="90"
          value={benchmark}
          onChange={(e) => setBenchmark(parseInt(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #ffba06 0%, #ffba06 ${(benchmark - 20) / 70 * 100}%, #e5e7eb ${(benchmark - 20) / 70 * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>20%</span>
          <span className="text-lg font-bold" style={{ color: '#1e2749' }}>{benchmark}%</span>
          <span className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>90%</span>
        </div>
      </div>

      {/* Input: Staff Morale */}
      <div>
        <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
          How would you rate your staff morale right now?
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={morale}
          onChange={(e) => setMorale(parseInt(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #ffba06 0%, #ffba06 ${(morale - 1) / 9 * 100}%, #e5e7eb ${(morale - 1) / 9 * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>1 - Crisis</span>
          <span className="text-lg font-bold" style={{ color: '#1e2749' }}>{morale}/10 <span className="text-sm font-normal">({getMoraleLabel(morale)})</span></span>
          <span className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>10 - Thriving</span>
        </div>
      </div>

      {/* Outputs */}
      <div className="rounded-xl p-6" style={{ backgroundColor: '#f5f5f5' }}>
        <h4 className="font-bold text-lg mb-4" style={{ color: '#1e2749' }}>
          With TDI, Your School Could See:
        </h4>

        <div className="space-y-4">
          {/* Benchmark Output */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#ffffff' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold" style={{ color: '#1e2749' }}>Students at Benchmark</span>
              <span className="font-bold" style={{ color: '#ffba06' }}>{benchmark}% → {projectedBenchmark}%</span>
            </div>
            <p className="text-xs" style={{ color: '#1e2749', opacity: 0.7 }}>
              Effective PD implementation correlates with 4-8 percentile point gains (Hanushek)
            </p>
          </div>

          {/* Morale Output */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#ffffff' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold" style={{ color: '#1e2749' }}>Staff Morale</span>
              <span className="font-bold" style={{ color: '#ffba06' }}>{morale}/10 → {projectedMorale}/10</span>
            </div>
            <p className="text-xs" style={{ color: '#1e2749', opacity: 0.7 }}>
              TDI partners report morale gains of 2-3 points within one semester
            </p>
          </div>

          {/* What This Means */}
          <div className="pt-4 border-t" style={{ borderColor: '#e5e7eb' }}>
            <p className="font-semibold text-sm mb-2" style={{ color: '#1e2749' }}>What This Means For Your School:</p>
            <ul className="space-y-1">
              <li className="flex items-start gap-2 text-sm" style={{ color: '#1e2749', opacity: 0.8 }}>
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Fewer teachers leaving (saves ~$20,000 per departure)</span>
              </li>
              <li className="flex items-start gap-2 text-sm" style={{ color: '#1e2749', opacity: 0.8 }}>
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Higher implementation rates (65% vs industry 10%)</span>
              </li>
              <li className="flex items-start gap-2 text-sm" style={{ color: '#1e2749', opacity: 0.8 }}>
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>PD your teachers actually thank you for</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <a
            href="/free-pd-plan"
            className="flex-1 text-center px-6 py-3 rounded-lg font-bold transition-all hover-glow"
            style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
          >
            Get Your Free PD Plan
          </a>
          <a
            href="/contact"
            className="flex-1 text-center px-6 py-3 rounded-lg font-bold transition-all hover-lift border-2"
            style={{ borderColor: '#1e2749', color: '#1e2749' }}
          >
            Schedule a Call
          </a>
        </div>

        {/* Sources */}
        <p className="text-xs text-center mt-4" style={{ color: '#1e2749', opacity: 0.5 }}>
          Sources: RAND 2025, Learning Policy Institute, Hanushek, TDI Partner Data
        </p>
      </div>
    </div>
  );
}
