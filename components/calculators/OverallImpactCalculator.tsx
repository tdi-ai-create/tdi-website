'use client';

import { useState } from 'react';

export function OverallImpactCalculator() {
  const [pdBudget, setPdBudget] = useState(2000);
  const [morale, setMorale] = useState(5);
  const [benchmark, setBenchmark] = useState(50);
  const [stateRating, setStateRating] = useState('C');

  const ratings = ['F', 'D', 'C', 'B', 'A'];

  // Calculate projected improvements
  const tdiCostPerTeacher = 672;
  const budgetSavings = pdBudget > tdiCostPerTeacher ? pdBudget - tdiCostPerTeacher : 0;
  const projectedMorale = Math.min(10, morale + 2);
  const projectedBenchmark = Math.min(95, benchmark + 8);

  const handleChange = () => {
    window.dispatchEvent(new CustomEvent('calculator-engaged'));
  };

  // Dynamic facts based on inputs
  const getBudgetFact = () => {
    if (pdBudget >= 3000) {
      return "Districts spending $3,000+ per teacher often see less than 10% implementation. TDI achieves 4x higher rates.";
    } else if (pdBudget >= 2000) {
      return "The average district spends $2,000-3,000 per teacher annually on PD that doesn't stick.";
    } else {
      return "Schools investing under $1,500 per teacher typically rely on one-day workshops.";
    }
  };

  const getMoraleFact = () => {
    if (morale <= 3) {
      return "Schools with morale below 4 see 23% higher turnover. (Learning Policy Institute)";
    } else if (morale <= 5) {
      return "53% of teachers report burnout. TDI partners see stress drop from 9/10 to 5-6/10. (RAND 2025)";
    } else if (morale <= 7) {
      return "Teachers with moderate satisfaction are 2x more likely to stay with sustained support. (RAND)";
    } else {
      return "High-morale schools still lose teachers to burnout. Proactive support prevents backslide.";
    }
  };

  const getBenchmarkFact = () => {
    if (benchmark <= 40) {
      return "When teachers reclaim 4+ hours/week, they provide 2x more small-group instruction. (Chetty et al.)";
    } else if (benchmark <= 60) {
      return "Teacher effectiveness is the #1 in-school factor for student achievement. (Hanushek)";
    } else if (benchmark <= 75) {
      return "Schools above 60% see accelerated gains when teachers have time for differentiation.";
    } else {
      return "High-performing schools maintain results by preventing teacher burnout.";
    }
  };

  const getRatingFact = () => {
    if (stateRating === 'F' || stateRating === 'D') {
      return "Schools investing in sustained teacher development are 2x more likely to improve ratings. (TDI Data)";
    } else if (stateRating === 'C') {
      return "C-rated schools often have talent but lack systems. TDI provides the structure to unlock it.";
    } else if (stateRating === 'B') {
      return "The jump from B to A requires consistency. TDI's ongoing support prevents backslide.";
    } else {
      return "A-rated schools partner with TDI to retain top teachers and maintain excellence.";
    }
  };

  return (
    <div className="space-y-6">
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
        <p className="text-xs mt-1 italic" style={{ color: '#1e2749', opacity: 0.6 }}>{getBudgetFact()}</p>
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
        <p className="text-xs mt-1 italic" style={{ color: '#1e2749', opacity: 0.6 }}>{getMoraleFact()}</p>
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
        <p className="text-xs mt-1 italic" style={{ color: '#1e2749', opacity: 0.6 }}>{getBenchmarkFact()}</p>
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
        <p className="text-xs mt-1 italic" style={{ color: '#1e2749', opacity: 0.6 }}>{getRatingFact()}</p>
      </div>

      {/* Results Panel */}
      <div className="rounded-xl p-5" style={{ backgroundColor: '#1e2749' }}>
        <h4 className="text-white font-bold text-center mb-4">With TDI, Your School Could See:</h4>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-xl font-black text-white">
              {budgetSavings > 0 ? `-$${budgetSavings.toLocaleString()}` : 'Same'}
            </div>
            <div className="text-xs text-white/70">PD cost per teacher</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-xl font-black text-white">
              {morale} → {projectedMorale}
            </div>
            <div className="text-xs text-white/70">Staff morale</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-xl font-black text-white">
              {benchmark}% → {projectedBenchmark}%
            </div>
            <div className="text-xs text-white/70">Students at benchmark</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-xl font-black text-white">
              Improved
            </div>
            <div className="text-xs text-white/70">On track for rating growth</div>
          </div>
        </div>

        <a
          href="/contact"
          className="block w-full text-center py-3 rounded-lg font-bold transition-all"
          style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
        >
          Start the Conversation
        </a>
      </div>

      {/* Sources */}
      <p className="text-xs text-center" style={{ color: '#1e2749', opacity: 0.5 }}>
        Sources: RAND 2025, Learning Policy Institute, Chetty et al., TDI Partner Data
      </p>
    </div>
  );
}
