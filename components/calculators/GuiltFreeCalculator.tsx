'use client';

import { useState } from 'react';

export function GuiltFreeCalculator() {
  const [workHours, setWorkHours] = useState(10);
  const [guiltLevel, setGuiltLevel] = useState(3);

  // Calculate outputs
  const guiltScore = Math.round((workHours / 20 * 50) + (guiltLevel / 5 * 50));
  const projectedScore = Math.max(15, Math.round(guiltScore * 0.4));
  const hoursReclaimed = Math.round(workHours * 0.5);
  const eveningsFreed = Math.round(hoursReclaimed / 2);
  const weekendHoursFreed = Math.round(workHours * 0.6 * 4);

  const guiltLabels = ['Rarely', 'Sometimes', 'Often', 'Usually', 'Always'];

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#ef4444';
    if (score >= 50) return '#f97316';
    if (score >= 30) return '#eab308';
    return '#22c55e';
  };

  return (
    <div className="space-y-6">
      {/* Input 1: Work Hours */}
      <div>
        <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
          Hours spent on school work outside contract hours per week?
        </label>
        <input
          type="range"
          min="2"
          max="20"
          value={workHours}
          onChange={(e) => setWorkHours(parseInt(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(workHours - 2) / 18 * 100}%, #e5e7eb ${(workHours - 2) / 18 * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>2 hrs</span>
          <span className="text-lg font-bold" style={{ color: '#1e2749' }}>{workHours} hrs/week</span>
          <span className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>20 hrs</span>
        </div>
      </div>

      {/* Input 2: Guilt Level */}
      <div>
        <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
          When you're NOT working, do you feel guilty?
        </label>
        <div className="flex gap-2">
          {guiltLabels.map((label, i) => (
            <button
              key={i}
              onClick={() => setGuiltLevel(i + 1)}
              className={`flex-1 py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
                guiltLevel === i + 1 ? 'text-white' : ''
              }`}
              style={{
                backgroundColor: guiltLevel === i + 1 ? '#8b5cf6' : '#f3f4f6',
                color: guiltLevel === i + 1 ? '#ffffff' : '#1e2749'
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Output */}
      <div className="rounded-xl p-6" style={{ backgroundColor: '#f5f3ff' }}>
        <h4 className="font-bold text-lg mb-4" style={{ color: '#1e2749' }}>
          Your Guilt-Free Score:
        </h4>

        {/* Score Display */}
        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <p className="text-xs mb-1" style={{ color: '#1e2749', opacity: 0.6 }}>Now</p>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
              style={{ backgroundColor: getScoreColor(guiltScore) }}
            >
              {guiltScore}
            </div>
          </div>
          <div className="flex items-center text-2xl" style={{ color: '#1e2749' }}>→</div>
          <div className="text-center">
            <p className="text-xs mb-1" style={{ color: '#1e2749', opacity: 0.6 }}>6 Months</p>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
              style={{ backgroundColor: getScoreColor(projectedScore) }}
            >
              {projectedScore}
            </div>
          </div>
        </div>

        {/* What You'll Reclaim */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#ffffff' }}>
            <p className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>{hoursReclaimed}</p>
            <p className="text-xs" style={{ color: '#1e2749', opacity: 0.7 }}>hrs/week back</p>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#ffffff' }}>
            <p className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>{eveningsFreed}</p>
            <p className="text-xs" style={{ color: '#1e2749', opacity: 0.7 }}>evenings freed</p>
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#ffffff' }}>
            <p className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>{weekendHoursFreed}</p>
            <p className="text-xs" style={{ color: '#1e2749', opacity: 0.7 }}>weekend hrs/mo</p>
          </div>
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
