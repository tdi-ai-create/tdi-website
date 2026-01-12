'use client';

import { useState } from 'react';

export function JoyCalculator() {
  // Step tracking
  const [step, setStep] = useState<'intro' | 'calculator'>('intro');

  // Intro question answers
  const [gradeLevel, setGradeLevel] = useState<string | null>(null);
  const [whyTeaching, setWhyTeaching] = useState<string | null>(null);
  const [lastSmile, setLastSmile] = useState<string | null>(null);

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

  const handleProceed = () => {
    setStep('calculator');
    window.dispatchEvent(new CustomEvent('calculator-engaged'));
  };

  const allQuestionsAnswered = gradeLevel && whyTeaching && lastSmile;

  // Intro questions options
  const gradeLevelOptions = [
    'Pre-K babies',
    'Elementary chaos (K-2)',
    'Upper elementary (3-5)',
    'Middle school moods (6-8)',
    'High school drama (9-12)',
    'A little bit of everything'
  ];

  const whyTeachingOptions = [
    'The kids',
    'The impact I make',
    'The summers (no shame)',
    'My team/colleagues',
    'Honestly not sure anymore',
    'All of the above'
  ];

  const lastSmileOptions = [
    'Today actually',
    'This week',
    "It's been a minute",
    "I'm trying to remember"
  ];

  if (step === 'intro') {
    return (
      <div className="space-y-6">
        <p className="text-sm text-center mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
          Let's get to know you first
        </p>

        {/* Question 1: Grade Level */}
        <div>
          <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
            Who do you teach?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {gradeLevelOptions.map((option) => (
              <button
                key={option}
                onClick={() => setGradeLevel(option)}
                className="py-3 px-3 rounded-lg text-sm font-medium transition-all text-left"
                style={{
                  backgroundColor: gradeLevel === option ? '#f59e0b' : '#f3f4f6',
                  color: gradeLevel === option ? '#ffffff' : '#1e2749'
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Question 2: Why Teaching */}
        <div>
          <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
            What keeps you in teaching?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {whyTeachingOptions.map((option) => (
              <button
                key={option}
                onClick={() => setWhyTeaching(option)}
                className="py-3 px-3 rounded-lg text-sm font-medium transition-all text-left"
                style={{
                  backgroundColor: whyTeaching === option ? '#f59e0b' : '#f3f4f6',
                  color: whyTeaching === option ? '#ffffff' : '#1e2749'
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Question 3: Last Smile */}
        <div>
          <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
            When did teaching last make you smile?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {lastSmileOptions.map((option) => (
              <button
                key={option}
                onClick={() => setLastSmile(option)}
                className="py-3 px-3 rounded-lg text-sm font-medium transition-all text-left"
                style={{
                  backgroundColor: lastSmile === option ? '#f59e0b' : '#f3f4f6',
                  color: lastSmile === option ? '#ffffff' : '#1e2749'
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={handleProceed}
          disabled={!allQuestionsAnswered}
          className="w-full py-4 rounded-lg font-bold text-lg transition-all"
          style={{
            backgroundColor: allQuestionsAnswered ? '#f59e0b' : '#e5e7eb',
            color: allQuestionsAnswered ? '#ffffff' : '#9ca3af',
            cursor: allQuestionsAnswered ? 'pointer' : 'not-allowed'
          }}
        >
          See My Joy Score
        </button>
      </div>
    );
  }

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
          onChange={(e) => {
            setJoy(parseInt(e.target.value));
            window.dispatchEvent(new CustomEvent('calculator-engaged'));
          }}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(joy - 1) / 9 * 100}%, #e5e7eb ${(joy - 1) / 9 * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between items-start mt-2">
          <div className="text-left">
            <span className="block text-lg font-bold" style={{ color: '#ef4444' }}>1</span>
            <span className="block text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>None at all</span>
          </div>
          <div className="text-center">
            <span className="text-2xl">{getJoyEmoji(joy)}</span>
            <span className="block text-xl font-bold" style={{ color: '#1e2749' }}>{joy}/10</span>
          </div>
          <div className="text-right">
            <span className="block text-lg font-bold" style={{ color: '#22c55e' }}>10</span>
            <span className="block text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>I love it</span>
          </div>
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
