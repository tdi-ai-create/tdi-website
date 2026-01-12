'use client';

import { useState } from 'react';

export function OverallImpactCalculator() {
  const [showResults, setShowResults] = useState(false);
  const [pdBudget, setPdBudget] = useState(2000);
  const [morale, setMorale] = useState(5);
  const [benchmark, setBenchmark] = useState(50);
  const [stateRating, setStateRating] = useState('C');

  const ratings = ['F', 'D', 'C', 'B', 'A'];

  // Calculate projected improvements
  const tdiCostPerTeacher = 672;
  const budgetSavings = pdBudget > tdiCostPerTeacher ? pdBudget - tdiCostPerTeacher : 0;

  // Morale improvement: +1 to +3 based on starting point (lower starting = more room to grow)
  const moraleImprovement = morale <= 4 ? 3 : morale <= 6 ? 2 : 1;
  const projectedMorale = Math.min(10, morale + moraleImprovement);

  // Benchmark improvement: +5 to +10% based on starting point
  const benchmarkImprovement = benchmark <= 40 ? 10 : benchmark <= 60 ? 8 : benchmark <= 75 ? 6 : 5;
  const projectedBenchmark = Math.min(95, benchmark + benchmarkImprovement);

  // Rating projection: one grade higher
  const getProjectedRating = () => {
    const ratingIndex = ratings.indexOf(stateRating);
    if (ratingIndex < ratings.length - 1) {
      return ratings[ratingIndex + 1];
    }
    return 'A'; // Already at A, maintain
  };

  const handleChange = () => {
    window.dispatchEvent(new CustomEvent('calculator-engaged'));
  };

  const handleShowResults = () => {
    setShowResults(true);
    window.dispatchEvent(new CustomEvent('calculator-engaged'));
  };

  if (showResults) {
    return (
      <div className="space-y-6">
        {/* Section 1: Your School's Potential */}
        <div>
          <h4 className="font-bold text-lg mb-4 text-center" style={{ color: '#1e2749' }}>
            Your School's Potential with TDI
          </h4>

          {/* Metric Cards */}
          <div className="space-y-4">
            {/* Metric 1: PD Investment */}
            <div className="rounded-xl p-4" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-semibold" style={{ color: '#1e2749' }}>PD Investment</span>
                <span className="text-sm font-bold" style={{ color: '#16a34a' }}>
                  You save: ${budgetSavings.toLocaleString()}/teacher
                </span>
              </div>
              <div className="flex gap-4 mb-2">
                <div>
                  <span className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>Current</span>
                  <p className="font-bold" style={{ color: '#1e2749' }}>${pdBudget.toLocaleString()}/teacher</p>
                </div>
                <div className="text-xl" style={{ color: '#1e2749' }}>→</div>
                <div>
                  <span className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>With TDI</span>
                  <p className="font-bold" style={{ color: '#16a34a' }}>${tdiCostPerTeacher}/teacher</p>
                </div>
              </div>
              <p className="text-xs italic" style={{ color: '#1e2749', opacity: 0.7 }}>
                Why it changes: TDI's phased model means you stop paying for PD that gets ignored. Our partners see 65% implementation vs. the 10% industry average.
              </p>
            </div>

            {/* Metric 2: Staff Morale */}
            <div className="rounded-xl p-4" style={{ backgroundColor: '#fef9c3', border: '1px solid #fde047' }}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-semibold" style={{ color: '#1e2749' }}>Staff Morale</span>
                <span className="text-sm font-bold" style={{ color: '#16a34a' }}>
                  +{moraleImprovement} points
                </span>
              </div>
              <div className="flex gap-4 mb-2">
                <div>
                  <span className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>Current</span>
                  <p className="font-bold" style={{ color: '#1e2749' }}>{morale}/10</p>
                </div>
                <div className="text-xl" style={{ color: '#1e2749' }}>→</div>
                <div>
                  <span className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>Year 1 with TDI</span>
                  <p className="font-bold" style={{ color: '#16a34a' }}>{projectedMorale}/10</p>
                </div>
              </div>
              <p className="text-xs italic" style={{ color: '#1e2749', opacity: 0.7 }}>
                Why it changes: When teachers get support that actually helps, stress drops. Our partners report stress dropping from 9 to 5-6 within 3-4 months.
              </p>
            </div>

            {/* Metric 3: Student Achievement */}
            <div className="rounded-xl p-4" style={{ backgroundColor: '#e0f2fe', border: '1px solid #7dd3fc' }}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-semibold" style={{ color: '#1e2749' }}>Student Achievement</span>
                <span className="text-sm font-bold" style={{ color: '#16a34a' }}>
                  +{benchmarkImprovement}%
                </span>
              </div>
              <div className="flex gap-4 mb-2">
                <div>
                  <span className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>Current</span>
                  <p className="font-bold" style={{ color: '#1e2749' }}>{benchmark}% at benchmark</p>
                </div>
                <div className="text-xl" style={{ color: '#1e2749' }}>→</div>
                <div>
                  <span className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>Projected with TDI</span>
                  <p className="font-bold" style={{ color: '#16a34a' }}>{projectedBenchmark}% at benchmark</p>
                </div>
              </div>
              <p className="text-xs italic" style={{ color: '#1e2749', opacity: 0.7 }}>
                Why it changes: Teacher effectiveness is the #1 in-school factor for student achievement. When teachers thrive, students follow.
              </p>
            </div>

            {/* Metric 4: School Rating */}
            <div className="rounded-xl p-4" style={{ backgroundColor: '#f5f3ff', border: '1px solid #c4b5fd' }}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-semibold" style={{ color: '#1e2749' }}>School Rating</span>
                {stateRating !== 'A' && (
                  <span className="text-sm font-bold" style={{ color: '#16a34a' }}>
                    On track for {getProjectedRating()}
                  </span>
                )}
              </div>
              <div className="flex gap-4 mb-2">
                <div>
                  <span className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>Current</span>
                  <p className="font-bold text-xl" style={{ color: '#1e2749' }}>{stateRating}</p>
                </div>
                <div className="text-xl" style={{ color: '#1e2749' }}>→</div>
                <div>
                  <span className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>Projected trajectory</span>
                  <p className="font-bold text-xl" style={{ color: '#16a34a' }}>{getProjectedRating()}</p>
                </div>
              </div>
              <p className="text-xs italic" style={{ color: '#1e2749', opacity: 0.7 }}>
                Why it changes: Improved teacher retention + student outcomes = rating growth over 2-3 years.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: What TDI Actually Does */}
        <div className="rounded-xl p-5" style={{ backgroundColor: '#1e2749' }}>
          <h4 className="text-white font-bold text-center mb-4">What TDI Actually Does</h4>

          <div className="space-y-3 mb-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-20">
                <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: '#ffba06', color: '#1e2749' }}>
                  IGNITE
                </span>
              </div>
              <p className="text-sm text-white/80">
                Build buy-in with leadership and a pilot group. See early wins.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-20">
                <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: '#ffba06', color: '#1e2749' }}>
                  ACCELERATE
                </span>
              </div>
              <p className="text-sm text-white/80">
                Scale support to full staff. Strategies get implemented school-wide.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-20">
                <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: '#ffba06', color: '#1e2749' }}>
                  SUSTAIN
                </span>
              </div>
              <p className="text-sm text-white/80">
                Embed systems that last beyond any single initiative.
              </p>
            </div>
          </div>

          <p className="text-sm text-white/70 text-center italic mb-4">
            Based on your inputs, your school would likely start at IGNITE phase.
          </p>
        </div>

        {/* Section 3: Dual CTA */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href="/free-pd-plan"
            className="flex items-center justify-center text-center px-4 py-3 rounded-lg font-bold transition-all hover:opacity-90"
            style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
          >
            Get Your Free PD Plan
          </a>
          <a
            href="/how-we-partner"
            className="flex items-center justify-center text-center px-4 py-3 rounded-lg font-bold transition-all hover:opacity-90 border-2"
            style={{ borderColor: '#1e2749', color: '#1e2749' }}
          >
            See Partnership Model
          </a>
        </div>

        {/* Sources */}
        <p className="text-xs text-center" style={{ color: '#1e2749', opacity: 0.5 }}>
          Sources: RAND 2025, Learning Policy Institute, Chetty et al., TDI Partner Data
        </p>

        {/* Back button */}
        <button
          onClick={() => setShowResults(false)}
          className="w-full py-3 rounded-lg font-medium transition-all text-sm"
          style={{ color: '#1e2749', opacity: 0.7 }}
        >
          ← Adjust my inputs
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Explainer */}
      <p className="text-sm text-center" style={{ color: '#1e2749', opacity: 0.7 }}>
        Answer 4 quick questions about your school. We'll show you what's possible with TDI based on data from our partner schools.
      </p>

      {/* Input 1: PD Budget */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-semibold" style={{ color: '#1e2749' }}>
            Current PD spend per teacher
          </label>
          <span className="text-lg font-bold" style={{ color: '#1e2749' }}>${pdBudget.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min="500"
          max="5000"
          step="100"
          value={pdBudget}
          onChange={(e) => { setPdBudget(parseInt(e.target.value)); handleChange(); }}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #1e2749 0%, #1e2749 ${(pdBudget - 500) / 4500 * 100}%, #e5e7eb ${(pdBudget - 500) / 4500 * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: '#1e2749', opacity: 0.5 }}>
          <span>$500</span>
          <span>$5,000</span>
        </div>
      </div>

      {/* Input 2: Staff Morale */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-semibold" style={{ color: '#1e2749' }}>
            Staff morale rating
          </label>
          <span className="text-lg font-bold" style={{ color: '#d97706' }}>{morale}/10</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={morale}
          onChange={(e) => { setMorale(parseInt(e.target.value)); handleChange(); }}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #d97706 0%, #d97706 ${(morale - 1) / 9 * 100}%, #e5e7eb ${(morale - 1) / 9 * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: '#1e2749', opacity: 0.5 }}>
          <span>1 (Low)</span>
          <span>10 (High)</span>
        </div>
      </div>

      {/* Input 3: Student Benchmark */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-semibold" style={{ color: '#1e2749' }}>
            Students at grade-level benchmark
          </label>
          <span className="text-lg font-bold" style={{ color: '#0284c7' }}>{benchmark}%</span>
        </div>
        <input
          type="range"
          min="20"
          max="90"
          value={benchmark}
          onChange={(e) => { setBenchmark(parseInt(e.target.value)); handleChange(); }}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #0284c7 0%, #0284c7 ${(benchmark - 20) / 70 * 100}%, #e5e7eb ${(benchmark - 20) / 70 * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: '#1e2749', opacity: 0.5 }}>
          <span>20%</span>
          <span>90%</span>
        </div>
      </div>

      {/* Input 4: State Rating */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-semibold" style={{ color: '#1e2749' }}>
            Current state rating
          </label>
          <span className="text-lg font-bold" style={{ color: '#a21caf' }}>{stateRating}</span>
        </div>
        <div className="flex gap-2">
          {ratings.map((rating) => (
            <button
              key={rating}
              onClick={() => { setStateRating(rating); handleChange(); }}
              className="flex-1 py-2 rounded-lg font-bold text-sm transition-all"
              style={{
                backgroundColor: stateRating === rating ? '#a21caf' : '#f3e8ff',
                color: stateRating === rating ? 'white' : '#a21caf'
              }}
            >
              {rating}
            </button>
          ))}
        </div>
      </div>

      {/* See Results Button */}
      <button
        onClick={handleShowResults}
        className="w-full py-4 rounded-lg font-bold text-lg transition-all hover:opacity-90"
        style={{ backgroundColor: '#1e2749', color: '#ffffff' }}
      >
        See My School's Potential
      </button>
    </div>
  );
}
