'use client';

import { useState } from 'react';

export function JoyCalculator() {
  // Show results state
  const [showResults, setShowResults] = useState(false);

  // Dropdown answers
  const [gradeLevel, setGradeLevel] = useState('');
  const [whyTeaching, setWhyTeaching] = useState('');
  const [lastSmile, setLastSmile] = useState('');

  // Main calculator state
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

  const handleShowResults = () => {
    setShowResults(true);
    window.dispatchEvent(new CustomEvent('calculator-engaged'));
  };

  const allFieldsFilled = gradeLevel && whyTeaching && lastSmile;

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

  const whyTeachingOptions = [
    { value: '', label: 'Select...' },
    { value: 'kids', label: 'The kids' },
    { value: 'impact', label: 'The impact I make' },
    { value: 'summers', label: 'The summers (no shame)' },
    { value: 'team', label: 'My team/colleagues' },
    { value: 'unsure', label: 'Honestly not sure anymore' },
    { value: 'all', label: 'All of the above' }
  ];

  const lastSmileOptions = [
    { value: '', label: 'Select...' },
    { value: 'today', label: 'Today actually' },
    { value: 'this-week', label: 'This week' },
    { value: 'been-a-minute', label: "It's been a minute" },
    { value: 'trying-to-remember', label: "I'm trying to remember" }
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
            Your Joy Restoration Journey:
          </h4>
        </div>

        {/* Phase Cards */}
        <div className="space-y-3">
          {/* NOW */}
          <div className="rounded-xl p-4" style={{ backgroundColor: '#fffbeb' }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{getJoyEmoji(joy)}</span>
              <div>
                <p className="font-bold" style={{ color: '#1e2749' }}>Now: {joy}/10</p>
                <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>Your starting point.</p>
              </div>
            </div>
          </div>

          {/* 3 MONTHS */}
          <div className="rounded-xl p-4" style={{ backgroundColor: '#fffbeb' }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{getJoyEmoji(month3)}</span>
              <div>
                <p className="font-bold" style={{ color: '#1e2749' }}>3 Months: {month3}/10</p>
              </div>
            </div>
            <p className="text-sm italic mb-2" style={{ color: '#1e2749', opacity: 0.7 }}>
              What's happening: Small wins start to add up. You're noticing moments of relief.
            </p>
            <p className="text-sm font-semibold" style={{ color: '#1e2749' }}>
              Your action: Start small. Pick ONE thing draining your joy and let it go this week.
            </p>
          </div>

          {/* 6 MONTHS */}
          <div className="rounded-xl p-4" style={{ backgroundColor: '#fffbeb' }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{getJoyEmoji(month6)}</span>
              <div>
                <p className="font-bold" style={{ color: '#1e2749' }}>6 Months: {month6}/10</p>
              </div>
            </div>
            <p className="text-sm italic mb-2" style={{ color: '#1e2749', opacity: 0.7 }}>
              What's happening: You've built some breathing room. Teaching feels lighter.
            </p>
            <p className="text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
              Your action: Subscribe to our blog and commit to trying one idea this month.
            </p>
            <a
              href="https://raehughart.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold underline hover:opacity-80 transition-opacity"
              style={{ color: '#f59e0b' }}
            >
              Subscribe →
            </a>
          </div>

          {/* 12 MONTHS */}
          <div className="rounded-xl p-4" style={{ backgroundColor: '#fffbeb' }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{getJoyEmoji(month12)}</span>
              <div>
                <p className="font-bold" style={{ color: '#1e2749' }}>12 Months: {month12}/10</p>
              </div>
            </div>
            <p className="text-sm italic mb-2" style={{ color: '#1e2749', opacity: 0.7 }}>
              What's happening: Joy is returning. You remember why you started.
            </p>
            <p className="text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
              Your action: You're ready for deeper support. The Learning Hub gives you a full system to protect your joy long-term.
            </p>
            <a
              href="/join"
              className="text-sm font-semibold underline hover:opacity-80 transition-opacity"
              style={{ color: '#f59e0b' }}
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
            <li>• Adding new initiatives (subtract first)</li>
            <li>• Big classroom overhauls (small wins build momentum)</li>
            <li>• Comparing yourself to others (your pace is your pace)</li>
          </ul>
        </div>

        {/* Bottom CTA */}
        <a
          href="/free-pd-plan"
          className="block w-full py-4 rounded-lg font-bold text-lg text-center transition-all hover:opacity-90 mt-4"
          style={{ backgroundColor: '#f59e0b', color: '#ffffff' }}
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
        Answer a few quick questions. See your path back to loving teaching.
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

      {/* Dropdown 2: Why Teaching */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
          What keeps you in teaching?
        </label>
        <select
          value={whyTeaching}
          onChange={(e) => setWhyTeaching(e.target.value)}
          style={selectStyles}
        >
          {whyTeachingOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Dropdown 3: Last Smile */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
          When did teaching last make you smile?
        </label>
        <select
          value={lastSmile}
          onChange={(e) => setLastSmile(e.target.value)}
          style={selectStyles}
        >
          {lastSmileOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Slider: Joy Level */}
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
            background: `linear-gradient(to right, #1e2749 0%, #1e2749 ${(joy - 1) / 9 * 100}%, #e5e7eb ${(joy - 1) / 9 * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between items-start mt-2">
          <div className="text-left">
            <span className="block text-sm font-bold" style={{ color: '#1e2749' }}>1</span>
            <span className="block text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>None at all</span>
          </div>
          <div className="text-center">
            <span className="text-2xl">{getJoyEmoji(joy)}</span>
            <span className="block text-lg font-bold" style={{ color: '#1e2749' }}>{joy}/10</span>
          </div>
          <div className="text-right">
            <span className="block text-sm font-bold" style={{ color: '#1e2749' }}>10</span>
            <span className="block text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>I love it</span>
          </div>
        </div>
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
