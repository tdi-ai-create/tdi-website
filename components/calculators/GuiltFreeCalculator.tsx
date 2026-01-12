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
  const projectedScore = Math.max(15, Math.round(guiltScore * 0.4));
  const hoursReclaimed = Math.round(workHours * 0.5);
  const eveningsFreed = Math.round(hoursReclaimed / 2);
  const weekendHoursFreed = Math.round(workHours * 0.6 * 4);

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
      <div className="space-y-6">
        {/* Results Header */}
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: '#1e2749' }}>
            Your current guilt score: {guiltScore}/100
          </p>
        </div>

        {/* Output */}
        <div className="rounded-xl p-6" style={{ backgroundColor: '#f5f3ff' }}>
          <h4 className="font-bold text-lg mb-4" style={{ color: '#1e2749' }}>
            Your Guilt-Free Journey:
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

          {/* Testimonial */}
          <p className="text-sm italic mt-4 p-3 rounded-lg" style={{ backgroundColor: '#ffffff', color: '#1e2749', opacity: 0.8 }}>
            "I finally leave school at school. My evenings are mine again."
            <span className="block text-xs mt-1 not-italic" style={{ opacity: 0.6 }}>— Marcus T., High School Teacher</span>
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
            background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${workHours / 20 * 100}%, #e5e7eb ${workHours / 20 * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between items-start mt-2">
          <div className="text-left">
            <span className="block text-sm font-bold" style={{ color: '#22c55e' }}>0</span>
            <span className="block text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>None</span>
          </div>
          <div className="text-center">
            <span className="block text-lg font-bold" style={{ color: '#1e2749' }}>{workHours} hrs/week</span>
          </div>
          <div className="text-right">
            <span className="block text-sm font-bold" style={{ color: '#ef4444' }}>20+</span>
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
          backgroundColor: allFieldsFilled ? '#8b5cf6' : '#e5e7eb',
          color: allFieldsFilled ? '#ffffff' : '#9ca3af',
          cursor: allFieldsFilled ? 'pointer' : 'not-allowed'
        }}
      >
        See My Results
      </button>
    </div>
  );
}
