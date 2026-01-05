'use client';

import { useState } from 'react';

export function JoyCalculator() {
  const [joy, setJoy] = useState(4);

  // Calculate projected joy over time
  const month3 = Math.min(10, joy + 2);
  const month6 = Math.min(10, joy + 3);
  const month12 = Math.min(10, joy + 4);

  const getJoyEmoji = (value: number) => {
    if (value <= 2) return '😞';
    if (value <= 4) return '😔';
    if (value <= 6) return '🙂';
    if (value <= 8) return '😊';
    return '🥰';
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
          How much joy does teaching bring you right now?
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={joy}
          onChange={(e) => setJoy(parseInt(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(joy - 1) / 9 * 100}%, #e5e7eb ${(joy - 1) / 9 * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>1 - None</span>
          <span className="text-2xl">{getJoyEmoji(joy)} <span className="text-lg font-bold" style={{ color: '#1e2749' }}>{joy}/10</span></span>
          <span className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>10 - Abundant</span>
        </div>
      </div>

      {/* Output: Joy Journey */}
      <div className="rounded-xl p-6" style={{ backgroundColor: '#fffbeb' }}>
        <h4 className="font-bold text-lg mb-4" style={{ color: '#1e2749' }}>
          Your Joy Restoration Journey:
        </h4>

        {/* Timeline */}
        <div className="relative pl-8 space-y-6">
          {/* Vertical line */}
          <div className="absolute left-3 top-2 bottom-2 w-0.5" style={{ backgroundColor: '#f59e0b' }} />

          {/* Now */}
          <div className="relative">
            <div className="absolute -left-5 w-4 h-4 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
            <p className="text-sm font-semibold" style={{ color: '#1e2749' }}>Now</p>
            <p className="text-2xl">{getJoyEmoji(joy)} <span className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>{joy}/10</span></p>
          </div>

          {/* 3 Months */}
          <div className="relative">
            <div className="absolute -left-5 w-4 h-4 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
            <p className="text-sm font-semibold" style={{ color: '#1e2749' }}>3 Months</p>
            <p className="text-2xl">{getJoyEmoji(month3)} <span className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>{month3}/10</span></p>
          </div>

          {/* 6 Months */}
          <div className="relative">
            <div className="absolute -left-5 w-4 h-4 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
            <p className="text-sm font-semibold" style={{ color: '#1e2749' }}>6 Months</p>
            <p className="text-2xl">{getJoyEmoji(month6)} <span className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>{month6}/10</span></p>
          </div>

          {/* 12 Months */}
          <div className="relative">
            <div className="absolute -left-5 w-4 h-4 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
            <p className="text-sm font-semibold" style={{ color: '#1e2749' }}>12 Months</p>
            <p className="text-2xl">{getJoyEmoji(month12)} <span className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>{month12}/10</span></p>
          </div>
        </div>

        {/* Message */}
        <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#ffffff' }}>
          <p className="text-sm italic" style={{ color: '#1e2749' }}>
            The joy isn't gone. It's buried under systems that don't support you.
          </p>
          <p className="text-sm font-semibold mt-2" style={{ color: '#f59e0b' }}>
            Let's dig it out together.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <a
            href="https://tdi.thinkific.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center px-6 py-3 rounded-lg font-bold transition-all hover-glow"
            style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
          >
            Explore the Learning Hub
          </a>
          <a
            href="https://raehughart.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center px-6 py-3 rounded-lg font-bold transition-all hover-lift border-2"
            style={{ borderColor: '#1e2749', color: '#1e2749' }}
          >
            Get Free Weekly Strategies
          </a>
        </div>
      </div>
    </div>
  );
}
