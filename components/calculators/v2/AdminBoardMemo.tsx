'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { grantsByState } from './grantsByState';
import { Funnel } from './visuals';

export function AdminBoardMemo() {
  const searchParams = useSearchParams();
  const budgetParam = searchParams?.get('budget');
  const initialBudget = budgetParam
    ? Math.max(10000, Math.min(200000, parseInt(budgetParam)))
    : 50000;
  const [budget, setBudget] = useState(isNaN(initialBudget) ? 50000 : initialBudget);
  const [teachers, setTeachers] = useState(50);
  const [morale, setMorale] = useState(5);
  const [benchmark, setBenchmark] = useState(50);
  const [state, setState] = useState('IL');
  const [email, setEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Math
  const currentCPI = Math.round(budget / (teachers * 0.10));
  const tdiCPI = Math.round(budget / (teachers * 0.65));
  const retentionSaved =
    morale <= 4 ? 60000 :
    morale <= 6 ? 40000 :
    morale <= 8 ? 20000 : 10000;
  const benchmarkGain = morale <= 5 ? 12 : morale <= 7 ? 10 : 8;
  const grants = grantsByState(state);

  const fmt = (n: number) => '$' + n.toLocaleString();

  const handleGenerateMemo = async () => {
    if (!email) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/calculator/admin-memo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, budget, teachers, morale, benchmark, state,
          currentCPI, tdiCPI, retentionSaved, benchmarkGain,
          grants: grants.map(g => g.short),
        }),
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'TDI-Board-Memo.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('[admin-memo] error', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Yellow accent strip */}
      <div className="h-1 w-16 bg-[#ffba06]" />

      <div className="grid md:grid-cols-2 gap-0">
        {/* INPUTS */}
        <div className="p-8 md:p-10 md:border-r border-gray-200">
          <h3 className="font-serif text-2xl text-[#1e2749] mb-2">Your school today</h3>
          <p className="text-base text-gray-600 mb-8">
            Four sliders. One question. Real-time board memo.
          </p>

          <SliderInput
            label="Annual PD budget"
            value={fmt(budget)}
            min={10000} max={200000} step={5000}
            sliderValue={budget}
            onChange={setBudget}
            minLabel="$10K" maxLabel="$200K"
          />
          <SliderInput
            label="Number of teachers"
            value={teachers.toString()}
            min={10} max={200} step={5}
            sliderValue={teachers}
            onChange={setTeachers}
            minLabel="10" maxLabel="200"
          />
          <SliderInput
            label="Staff morale"
            value={`${morale}/10`}
            min={1} max={10} step={1}
            sliderValue={morale}
            onChange={setMorale}
            minLabel="Low" maxLabel="High"
          />
          <SliderInput
            label="Students at grade-level benchmark"
            value={`${benchmark}%`}
            min={20} max={90} step={5}
            sliderValue={benchmark}
            onChange={setBenchmark}
            minLabel="20%" maxLabel="90%"
          />

          <div className="mt-6">
            <label className="block text-base font-medium text-gray-700 mb-2">
              What state? <span className="text-sm text-gray-500 italic">(unlocks grant match)</span>
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg text-base focus:border-[#1e2749] focus:outline-none focus:ring-2 focus:ring-[#1e2749]/10"
            >
              <option value="IL">Illinois</option>
              <option value="MD">Maryland</option>
              <option value="CO">Colorado</option>
              <option value="TX">Texas</option>
              <option value="CA">California</option>
              <option value="FL">Florida</option>
              <option value="other">Another state</option>
            </select>
          </div>
        </div>

        {/* OUTPUT */}
        <div className="p-8 md:p-10 bg-[#f5f5f5]">
          <div className="text-xs uppercase tracking-widest text-[#F96767] font-bold mb-2">
            Board Memo Preview
          </div>
          <h3 className="font-serif text-xl text-[#1e2749] font-semibold leading-tight mb-1">
            Your TDI Funding &amp; Impact Pathway
          </h3>
          <p className="text-sm text-gray-500 italic mb-6">
            Auto-generated from your inputs. Download. Forward. Bring to your budget meeting.
          </p>

          {/* Funnel visual */}
          <Funnel budget={budget} variant="side-by-side" />

          {/* Stat grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <StatCard label="Current cost-per-implementation" value={fmt(currentCPI)} />
            <StatCard label="With TDI partnership" value={fmt(tdiCPI)} highlight />
            <StatCard label="Retention savings (Yr 1)" value={fmt(retentionSaved)} />
            <StatCard label="Projected benchmark gain" value={`+${benchmarkGain} pts`} />
          </div>

          {/* Grants */}
          <div className="mb-6">
            <div className="text-xs uppercase tracking-wide text-gray-500 font-bold mb-2">
              Likely Funding Sources
            </div>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {grants.map((g, i) => (
                <div
                  key={i}
                  className={`flex justify-between items-center p-3 ${
                    i < grants.length - 1 ? 'border-b border-gray-200' : ''
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{g.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{g.meta}</div>
                  </div>
                  <div
                    className={`text-xs font-semibold px-2.5 py-1 rounded text-white ${
                      g.partial ? 'bg-[#ffba06] text-[#1e2749]' : 'bg-[#1e2749]'
                    }`}
                  >
                    {g.partial ? 'PARTIAL' : 'FULL MATCH'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Board justification */}
          <div className="mb-6">
            <div className="text-xs uppercase tracking-wide text-gray-500 font-bold mb-2">
              One-Sentence Board Justification
            </div>
            <div className="bg-white border-l-4 border-[#1e2749] p-4 rounded">
              <div className="text-[#ffba06] text-2xl leading-none mb-1">&ldquo;</div>
              <p className="font-serif text-base text-gray-900 italic leading-relaxed">
                We are reallocating <strong>{fmt(budget)}</strong> of existing PD spend into a TDI partnership that delivers <strong>6.5x the classroom implementation rate</strong>, funded primarily through {grants[0].short} allocations our district already receives.
              </p>
            </div>
          </div>

          {/* Email capture + CTAs */}
          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@school.edu"
              className="w-full p-3 border-2 border-gray-200 rounded-lg text-base focus:border-[#1e2749] focus:outline-none focus:ring-2 focus:ring-[#1e2749]/10"
            />
            <button
              onClick={handleGenerateMemo}
              disabled={!email || isGenerating}
              className="w-full px-8 py-4 bg-[#ffba06] text-[#1e2749] rounded-lg font-semibold text-base shadow-md hover:bg-[#e6a505] hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating PDF...' : 'Download Board Memo (PDF)'}
            </button>
            <a
              href="/free-pd-plan"
              className="block w-full text-center px-8 py-4 border-2 border-[#1e2749] text-[#1e2749] rounded-lg font-semibold text-base hover:bg-[#1e2749] hover:text-white transition-all"
            >
              Get Your Free PD Plan
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function SliderInput({ label, value, min, max, step, sliderValue, onChange, minLabel, maxLabel }: {
  label: string; value: string; min: number; max: number; step: number;
  sliderValue: number; onChange: (v: number) => void; minLabel: string; maxLabel: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-baseline mb-3">
        <span className="text-base font-medium text-gray-700">{label}</span>
        <span className="font-serif text-xl font-semibold text-[#1e2749]">{value}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={sliderValue}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#1e2749]"
      />
      <div className="flex justify-between mt-1.5 text-xs text-gray-500 uppercase tracking-wide font-medium">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="text-xs uppercase tracking-wide text-gray-500 font-bold mb-1">{label}</div>
      <div className={`font-serif text-2xl font-semibold leading-none ${highlight ? 'text-[#F96767]' : 'text-[#1e2749]'}`}>
        {value}
      </div>
    </div>
  );
}
