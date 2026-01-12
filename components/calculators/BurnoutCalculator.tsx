'use client';

import { useState } from 'react';

export function BurnoutCalculator() {
  // Show results state
  const [showResults, setShowResults] = useState(false);

  // Dropdown answers
  const [gradeLevel, setGradeLevel] = useState('');
  const [experience, setExperience] = useState('');
  const [hardestTime, setHardestTime] = useState('');

  // Main calculator state
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

  const handleShowResults = () => {
    setShowResults(true);
    window.dispatchEvent(new CustomEvent('calculator-engaged'));
  };

  const allFieldsFilled = gradeLevel && experience && hardestTime;

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

  const experienceOptions = [
    { value: '', label: 'Select...' },
    { value: '0-2', label: '0-2 years' },
    { value: '3-5', label: '3-5 years' },
    { value: '6-10', label: '6-10 years' },
    { value: '11-20', label: '11-20 years' },
    { value: '20+', label: '20+ years' }
  ];

  const hardestTimeOptions = [
    { value: '', label: 'Select...' },
    { value: 'before', label: 'Before the kids arrive' },
    { value: 'mid-morning', label: 'Mid-morning' },
    { value: 'after-lunch', label: 'After lunch' },
    { value: 'final-hour', label: 'The final hour' },
    { value: 'after-dismissal', label: 'After dismissal' }
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
      <div className="space-y-6">
        {/* Results Header */}
        <div className="text-center">
          <span className="text-4xl mb-2 block">{getStressEmoji(stress)}</span>
          <p className="text-lg font-bold" style={{ color: '#1e2749' }}>
            Your current stress: {stress}/10
          </p>
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
              className="flex items-center justify-center text-center px-4 py-3 rounded-lg font-bold transition-all hover:opacity-90"
              style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
            >
              Explore Learning Hub
            </a>
            <a
              href="https://raehughart.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center text-center px-4 py-3 rounded-lg font-bold transition-all hover:opacity-90 border-2"
              style={{ borderColor: '#1e2749', color: '#1e2749' }}
            >
              Free Weekly Tips
            </a>
          </div>
        </div>

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

      {/* Dropdown 2: Experience */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
          How long have you been teaching?
        </label>
        <select
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          style={selectStyles}
        >
          {experienceOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Dropdown 3: Hardest Time */}
      <div>
        <label className="block text-sm font-semibold mb-2" style={{ color: '#1e2749' }}>
          When does the day hit hardest?
        </label>
        <select
          value={hardestTime}
          onChange={(e) => setHardestTime(e.target.value)}
          style={selectStyles}
        >
          {hardestTimeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Slider: Stress Level */}
      <div>
        <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
          How would you rate your stress level right now?
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={stress}
          onChange={(e) => setStress(parseInt(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${(stress - 1) / 9 * 100}%, #e5e7eb ${(stress - 1) / 9 * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between items-start mt-2">
          <div className="text-left">
            <span className="block text-sm font-bold" style={{ color: '#22c55e' }}>1</span>
            <span className="block text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>Doing great</span>
          </div>
          <div className="text-center">
            <span className="text-2xl">{getStressEmoji(stress)}</span>
            <span className="block text-lg font-bold" style={{ color: '#1e2749' }}>{stress}/10</span>
          </div>
          <div className="text-right">
            <span className="block text-sm font-bold" style={{ color: '#ef4444' }}>10</span>
            <span className="block text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>In crisis</span>
          </div>
        </div>
      </div>

      {/* See My Results Button */}
      <button
        onClick={handleShowResults}
        disabled={!allFieldsFilled}
        className="w-full py-4 rounded-lg font-bold text-lg transition-all mt-2"
        style={{
          backgroundColor: allFieldsFilled ? '#ef4444' : '#e5e7eb',
          color: allFieldsFilled ? '#ffffff' : '#9ca3af',
          cursor: allFieldsFilled ? 'pointer' : 'not-allowed'
        }}
      >
        See My Results
      </button>
    </div>
  );
}
