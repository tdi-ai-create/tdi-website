'use client';

import { useState } from 'react';

export function GuiltFreeCalculator() {
  // Show results state
  const [showResults, setShowResults] = useState(false);

  // Dropdown answers
  const [gradeLevel, setGradeLevel] = useState('');
  const [weekendLook, setWeekendLook] = useState('');
  const [lunchBreak, setLunchBreak] = useState('');
  const [guiltFeeling, setGuiltFeeling] = useState('');

  // Main calculator state
  const [workHours, setWorkHours] = useState(10);

  // Map guilt feeling to numeric value for calculation
  const guiltLevelMap: Record<string, number> = {
    'never': 1,
    'sometimes': 2,
    'often': 3,
    'always': 4
  };
  const guiltLevel = guiltLevelMap[guiltFeeling] || 2;

  // Calculate outputs
  const guiltScore = Math.round((workHours / 20 * 50) + (guiltLevel / 4 * 50));
  const month3Score = Math.max(20, Math.round(guiltScore * 0.7));
  const month6Score = Math.max(15, Math.round(guiltScore * 0.4));
  const month12Score = Math.max(10, Math.round(guiltScore * 0.25));

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#ef4444';
    if (score >= 50) return '#f97316';
    if (score >= 30) return '#eab308';
    return '#22c55e';
  };

  const handleShowResults = () => {
    setShowResults(true);
    window.dispatchEvent(new CustomEvent('calculator-engaged'));
  };

  const allFieldsFilled = gradeLevel && weekendLook && lunchBreak && guiltFeeling;

  // Dropdown options
  const gradeLevelOptions = [
    { value: '', label: 'Select...' },
    { value: 'prek', label: 'Pre-K' },
    { value: 'elementary', label: 'Elementary (K-2)' },
    { value: 'upper-elementary', label: 'Upper elementary (3-5)' },
    { value: 'middle', label: 'Middle school (6-8)' },
    { value: 'high', label: 'High school (9-12)' },
    { value: 'multiple', label: 'Multiple grade levels' }
  ];

  const weekendOptions = [
    { value: '', label: 'Select...' },
    { value: 'fully-off', label: 'Fully off (living the dream)' },
    { value: 'few-hours', label: 'A few hours of planning' },
    { value: 'half-day', label: 'Half a day of catch-up' },
    { value: 'what-weekend', label: 'Honestly, what weekend?' }
  ];

  const lunchOptions = [
    { value: '', label: 'Select...' },
    { value: 'eating-peace', label: 'Eating in peace (rare but real)' },
    { value: 'working', label: 'Working through it' },
    { value: 'supervising', label: 'Supervising kids' },
    { value: 'what-lunch', label: 'What lunch break?' }
  ];

  const guiltOptions = [
    { value: '', label: 'Select...' },
    { value: 'never', label: 'Never' },
    { value: 'sometimes', label: 'Sometimes' },
    { value: 'often', label: 'Often' },
    { value: 'always', label: 'Always' }
  ];

  const selectStyles = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    backgroundColor: '#ffffff',
    color: '#1e2749',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%231e2749'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '20px'
  };

  if (showResults) {
    return (
      <div className="space-y-4">
        {/* Results Header */}
        <div className="text-center mb-2">
          <h4 className="font-bold text-lg" style={{ color: '#1e2749' }}>
            Your Guilt-Free Journey:
          </h4>
        </div>

        {/* Phase Cards */}
        <div className="space-y-3">
          {/* NOW */}
          <div className="rounded-xl p-4" style={{ backgroundColor: '#f5f3ff' }}>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                style={{ backgroundColor: getScoreColor(guiltScore) }}
              >
                {guiltScore}
              </div>
              <div>
                <p className="font-bold" style={{ color: '#1e2749' }}>Now: {guiltScore}/100</p>
                <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>Your starting point.</p>
              </div>
            </div>
          </div>

          {/* 3 MONTHS */}
          <div className="rounded-xl p-4" style={{ backgroundColor: '#f5f3ff' }}>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                style={{ backgroundColor: getScoreColor(month3Score) }}
              >
                {month3Score}
              </div>
              <div>
                <p className="font-bold" style={{ color: '#1e2749' }}>3 Months: {month3Score}/100</p>
              </div>
            </div>
            <p className="text-sm italic mb-2" style={{ color: '#1e2749', opacity: 0.7 }}>
              What's happening: You're learning that rest is not a reward. It's a requirement.
            </p>
            <p className="text-sm font-semibold" style={{ color: '#1e2749' }}>
              Your action: Set a hard stop time today. When it hits, you're done. Period.
            </p>
          </div>

          {/* 6 MONTHS */}
          <div className="rounded-xl p-4" style={{ backgroundColor: '#f5f3ff' }}>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                style={{ backgroundColor: getScoreColor(month6Score) }}
              >
                {month6Score}
              </div>
              <div>
                <p className="font-bold" style={{ color: '#1e2749' }}>6 Months: {month6Score}/100</p>
              </div>
            </div>
            <p className="text-sm italic mb-2" style={{ color: '#1e2749', opacity: 0.7 }}>
              What's happening: Boundaries are becoming habits. Weekends feel different.
            </p>
            <p className="text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
              Your action: Listen to one episode of our podcast this week. Real talk from teachers who get it.
            </p>
            <a
              href="https://podcasts.apple.com/us/podcast/sustainable-teaching-with-rae-hughart/id1792030274"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold underline hover:opacity-80 transition-opacity"
              style={{ color: '#8b5cf6' }}
            >
              Listen Now →
            </a>
          </div>

          {/* 12 MONTHS */}
          <div className="rounded-xl p-4" style={{ backgroundColor: '#f5f3ff' }}>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                style={{ backgroundColor: getScoreColor(month12Score) }}
              >
                {month12Score}
              </div>
              <div>
                <p className="font-bold" style={{ color: '#1e2749' }}>12 Months: {month12Score}/100</p>
              </div>
            </div>
            <p className="text-sm italic mb-2" style={{ color: '#1e2749', opacity: 0.7 }}>
              What's happening: Guilt is quieter. You've built systems that protect your time.
            </p>
            <p className="text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
              Your action: The Learning Hub course Teachers Deserve Their Time Back locks this in for good.
            </p>
            <a
              href="/join"
              className="text-sm font-semibold underline hover:opacity-80 transition-opacity"
              style={{ color: '#8b5cf6' }}
            >
              Explore Learning Hub →
            </a>
          </div>
        </div>

        {/* What You're Not Ready For Yet */}
        <div className="rounded-xl p-4 mt-4" style={{ backgroundColor: '#f3f4f6', border: '1px dashed #d1d5db' }}>
          <p className="text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
            What You're Not Ready For Yet:
          </p>
          <ul className="text-sm space-y-1" style={{ color: '#1e2749', opacity: 0.8 }}>
            <li>• Perfect balance (aim for "better" not "perfect")</li>
            <li>• Overhauling everything (one change at a time)</li>
            <li>• Zero guilt (that takes practice)</li>
          </ul>
        </div>

        {/* Bottom CTA */}
        <a
          href="/free-pd-plan"
          className="block w-full py-4 rounded-lg font-bold text-lg text-center transition-all hover:opacity-90 mt-4"
          style={{ backgroundColor: '#8b5cf6', color: '#ffffff' }}
        >
          Get Your Free PD Plan
        </a>

        {/* Back button */}
        <button
          onClick={() => setShowResults(false)}
          className="w-full py-3 rounded-lg font-medium transition-all text-sm"
          style={{ color: '#1e2749', opacity: 0.7 }}
        >
          ← Adjust my answers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Explainer */}
      <p className="text-sm text-center" style={{ color: '#1e2749', opacity: 0.7 }}>
        Answer a few questions about your work habits. See how much time you could reclaim.
      </p>

      {/* Dropdown 1: Grade Level */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
          Who do you teach?
        </label>
        <select
          value={gradeLevel}
          onChange={(e) => setGradeLevel(e.target.value)}
          style={selectStyles}
        >
          {gradeLevelOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Dropdown 2: Weekend */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
          What does your weekend actually look like?
        </label>
        <select
          value={weekendLook}
          onChange={(e) => setWeekendLook(e.target.value)}
          style={selectStyles}
        >
          {weekendOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Dropdown 3: Lunch Break */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
          Your lunch break usually looks like...
        </label>
        <select
          value={lunchBreak}
          onChange={(e) => setLunchBreak(e.target.value)}
          style={selectStyles}
        >
          {lunchOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Slider: Work Hours */}
      <div>
        <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
          Hours spent on school work outside contract hours per week?
        </label>
        <input
          type="range"
          min="0"
          max="20"
          value={workHours}
          onChange={(e) => setWorkHours(parseInt(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #1e2749 0%, #1e2749 ${workHours / 20 * 100}%, #e5e7eb ${workHours / 20 * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between items-start mt-2">
          <div className="text-left">
            <span className="block text-sm font-bold" style={{ color: '#1e2749' }}>0</span>
            <span className="block text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>None</span>
          </div>
          <div className="text-center">
            <span className="block text-lg font-bold" style={{ color: '#1e2749' }}>{workHours} hrs/week</span>
          </div>
          <div className="text-right">
            <span className="block text-sm font-bold" style={{ color: '#1e2749' }}>20+</span>
            <span className="block text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>Way too many</span>
          </div>
        </div>
      </div>

      {/* Dropdown 4: Guilt Level */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
          When you're NOT working, do you feel guilty?
        </label>
        <select
          value={guiltFeeling}
          onChange={(e) => setGuiltFeeling(e.target.value)}
          style={selectStyles}
        >
          {guiltOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* See My Results Button */}
      <button
        onClick={handleShowResults}
        disabled={!allFieldsFilled}
        className="w-full py-4 rounded-lg font-bold text-lg transition-all mt-2"
        style={{
          backgroundColor: allFieldsFilled ? '#1e2749' : '#e5e7eb',
          color: allFieldsFilled ? '#ffffff' : '#9ca3af',
          cursor: allFieldsFilled ? 'pointer' : 'not-allowed'
        }}
      >
        See My Results
      </button>
    </div>
  );
}
