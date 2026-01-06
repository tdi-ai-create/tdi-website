'use client';

import { useState } from 'react';

export function BurnoutCalculator() {
  const [stress, setStress] = useState(5);

  // Calculate projected stress reduction over time
  const month3 = Math.max(2, stress - 1);
  const month6 = Math.max(2, stress - 2);
  const month12 = Math.max(1, stress - 3);

  const getStressEmoji = (value: number) => {
    if (value >= 9) return '😰';
    if (value >= 7) return '😓';
    if (value >= 5) return '😐';
    if (value >= 3) return '🙂';
    return '😊';
  };

  const getStressColor = (value: number) => {
    if (value >= 8) return '#ef4444';
    if (value >= 6) return '#f97316';
    if (value >= 4) return '#eab308';
    return '#22c55e';
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
          How would you rate your stress level right now?
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={stress}
          onChange={(e) => {
            setStress(parseInt(e.target.value));
            window.dispatchEvent(new CustomEvent('calculator-engaged'));
          }}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${(stress - 1) / 9 * 100}%, #e5e7eb ${(stress - 1) / 9 * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between items-start mt-2">
          <div className="text-left">
            <span className="block text-lg font-bold" style={{ color: '#22c55e' }}>1</span>
            <span className="block text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>I'm doing great</span>
          </div>
          <div className="text-center">
            <span className="text-2xl">{getStressEmoji(stress)}</span>
            <span className="block text-xl font-bold" style={{ color: '#1e2749' }}>{stress}/10</span>
          </div>
          <div className="text-right">
            <span className="block text-lg font-bold" style={{ color: '#ef4444' }}>10</span>
            <span className="block text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>I'm in crisis</span>
          </div>
        </div>
      </div>

      {/* Output: Stress Journey */}
      <div className="rounded-xl p-6" style={{ backgroundColor: '#fef2f2' }}>
        <h4 className="font-bold text-lg mb-4" style={{ color: '#1e2749' }}>
          Your Stress Recovery Journey:
        </h4>

        <div className="space-y-3">
          {/* Now */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium w-20" style={{ color: '#1e2749' }}>Now</span>
            <div className="flex-1 h-6 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${stress * 10}%`, backgroundColor: getStressColor(stress) }}
              />
            </div>
            <span className="text-xl w-10">{getStressEmoji(stress)}</span>
          </div>

          {/* 3 Months */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium w-20" style={{ color: '#1e2749' }}>3 months</span>
            <div className="flex-1 h-6 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${month3 * 10}%`, backgroundColor: getStressColor(month3) }}
              />
            </div>
            <span className="text-xl w-10">{getStressEmoji(month3)}</span>
          </div>

          {/* 6 Months */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium w-20" style={{ color: '#1e2749' }}>6 months</span>
            <div className="flex-1 h-6 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${month6 * 10}%`, backgroundColor: getStressColor(month6) }}
              />
            </div>
            <span className="text-xl w-10">{getStressEmoji(month6)}</span>
          </div>

          {/* 12 Months */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium w-20" style={{ color: '#1e2749' }}>12 months</span>
            <div className="flex-1 h-6 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${month12 * 10}%`, backgroundColor: getStressColor(month12) }}
              />
            </div>
            <span className="text-xl w-10">{getStressEmoji(month12)}</span>
          </div>
        </div>

        {/* Testimonial */}
        <p className="text-sm italic mt-4 p-3 rounded-lg" style={{ backgroundColor: '#ffffff', color: '#1e2749', opacity: 0.8 }}>
          "I went from crying in my car to actually looking forward to Mondays."
          <span className="block text-xs mt-1 not-italic" style={{ opacity: 0.6 }}>— Amanda R., Middle School Teacher</span>
        </p>

        {/* CTAs */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <a
            href="https://tdi.thinkific.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center text-center px-4 py-3 rounded-lg font-bold transition-all hover-glow"
            style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
          >
            Explore Learning Hub
          </a>
          <a
            href="https://raehughart.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center text-center px-4 py-3 rounded-lg font-bold transition-all hover-lift border-2"
            style={{ borderColor: '#1e2749', color: '#1e2749' }}
          >
            Free Weekly Tips
          </a>
        </div>
      </div>
    </div>
  );
}
