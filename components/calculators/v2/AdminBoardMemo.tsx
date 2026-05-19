'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { grantsByState } from './grantsByState';
import { ClassroomClock } from './visuals';

const stateLabels: Record<string, string> = {
  IL: 'Illinois',
  MD: 'Maryland',
  CO: 'Colorado',
  TX: 'Texas',
  CA: 'California',
  FL: 'Florida',
  other: 'Other state',
};

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
  const cpiDeltaPct = Math.round(((currentCPI - tdiCPI) / currentCPI) * 100);
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-5xl mx-auto">
      {/* ============================================ */}
      {/* DARK CONTROL PANEL HEADER                   */}
      {/* ============================================ */}
      <div
        className="px-7 md:px-8 py-6 md:py-7 relative"
        style={{ background: 'linear-gradient(135deg, #1e2749, #2d3a6e)', color: 'white' }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#ffba06]" />

        <div className="flex justify-between items-baseline mb-5 flex-wrap gap-2">
          <div>
            <div className="text-[10px] tracking-[0.18em] uppercase font-bold mb-1" style={{ color: '#ffba06' }}>
              Your School
            </div>
            <div className="font-serif text-lg md:text-xl font-semibold">
              Adjust the inputs. Watch the memo move.
            </div>
          </div>
          <div className="text-[11px] text-white/70">&darr; Your numbers, recalculated</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-5">
          <CompactSlider
            label="PD Budget"
            value={fmt(budget)}
            min={10000} max={200000} step={5000}
            sliderValue={budget}
            onChange={setBudget}
          />
          <CompactSlider
            label="Teachers"
            value={teachers.toString()}
            min={10} max={200} step={5}
            sliderValue={teachers}
            onChange={setTeachers}
          />
          <CompactSlider
            label="Staff morale"
            value={`${morale}/10`}
            min={1} max={10} step={1}
            sliderValue={morale}
            onChange={setMorale}
          />
          <CompactSlider
            label="At benchmark"
            value={`${benchmark}%`}
            min={20} max={90} step={5}
            sliderValue={benchmark}
            onChange={setBenchmark}
          />
          <div>
            <div className="text-[9px] uppercase tracking-[0.1em] font-bold mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              State
            </div>
            <div className="font-serif text-base md:text-[17px] font-bold mb-2" style={{ color: '#ffba06' }}>
              {stateLabels[state]}
            </div>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded text-[11px] cursor-pointer"
              style={{
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.85)',
              }}
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
      </div>

      {/* ============================================ */}
      {/* OUTPUT - the deliverable                    */}
      {/* ============================================ */}
      <div className="px-6 md:px-8 py-8 md:py-10 bg-white">
        {/* Heading */}
        <div className="text-center mb-7">
          <div className="text-xs uppercase tracking-widest text-[#F96767] font-bold mb-1">
            Board Memo Preview
          </div>
          <h3 className="font-serif text-2xl md:text-3xl text-[#1e2749] font-semibold leading-tight mb-1">
            Your TDI Funding &amp; Impact Pathway
          </h3>
          <p className="text-xs text-gray-500 italic">
            Auto-generated from your inputs. Download. Forward. Bring to your meeting.
          </p>
        </div>

        {/* ============================================ */}
        {/* STATS BLOCK - the hero                      */}
        {/* ============================================ */}
        <div
          className="rounded-xl border border-gray-200 p-7 md:p-8 relative mb-5"
          style={{ background: 'linear-gradient(180deg, #fafaf9 0%, #f5f4f1 100%)' }}
        >
          <div className="absolute -top-2.5 left-6 bg-[#1e2749] text-[#ffba06] px-3.5 py-1 rounded text-[10px] uppercase tracking-[0.15em] font-bold">
            Your Numbers
          </div>

          {/* Hero comparison: You Today -> arrow -> With TDI */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-stretch mt-3 mb-5">
            {/* You Today */}
            <div className="bg-white border-[1.5px] border-gray-200 rounded-l-[10px] p-5 md:p-6">
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.12em] mb-1">
                You Today
              </div>
              <div className="text-[11px] text-gray-500 mb-3">Cost per teacher reached</div>
              <div className="font-serif text-3xl md:text-4xl font-bold text-gray-500 leading-none tracking-tight">
                {fmt(currentCPI)}
              </div>
            </div>

            {/* Arrow */}
            <div
              className="flex items-center justify-center px-3 md:px-4"
              style={{ background: 'linear-gradient(180deg, #fafaf9 0%, #f5f4f1 100%)' }}
            >
              <div className="flex flex-col items-center gap-1">
                <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
                  <path d="M2 10 L26 10 M20 4 L26 10 L20 16" stroke="#0d7377" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div className="text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: '#0d7377' }}>
                  {cpiDeltaPct}% less
                </div>
              </div>
            </div>

            {/* With TDI - the hero */}
            <div
              className="bg-white border-2 rounded-r-[10px] p-5 md:p-6 relative"
              style={{
                borderColor: '#0d7377',
                boxShadow: '0 6px 20px rgba(13,115,119,0.18)',
              }}
            >
              <div
                className="absolute -top-2 right-4 text-white px-2.5 py-0.5 rounded text-[9px] uppercase tracking-[0.15em] font-bold"
                style={{ background: '#0d7377' }}
              >
                TDI
              </div>
              <div className="text-[10px] uppercase font-bold tracking-[0.12em] mb-1" style={{ color: '#0d7377' }}>
                With TDI
              </div>
              <div className="text-[11px] mb-3" style={{ color: '#0d7377' }}>Cost per teacher reached</div>
              <div className="font-serif text-3xl md:text-4xl font-bold leading-none tracking-tight" style={{ color: '#F96767' }}>
                {fmt(tdiCPI)}
              </div>
            </div>
          </div>

          {/* Bonus stats below dashed divider */}
          <div className="pt-5 border-t border-dashed border-gray-300 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white border border-gray-200 p-4 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.1em]">Plus</div>
                <div className="text-xs text-gray-500 mt-0.5">Year 1 retention savings</div>
              </div>
              <div className="font-serif text-2xl md:text-[26px] font-bold text-[#1e2749] leading-none">
                {fmt(retentionSaved)}
              </div>
            </div>
            <div className="bg-white border border-gray-200 p-4 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.1em]">Plus</div>
                <div className="text-xs text-gray-500 mt-0.5">Benchmark improvement</div>
              </div>
              <div className="font-serif text-2xl md:text-[26px] font-bold text-[#1e2749] leading-none">
                +{benchmarkGain} pts
              </div>
            </div>
          </div>

          {/* Live recalculating indicator */}
          <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0d7377] animate-pulse" />
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: '#0d7377' }}>
              Live &middot; recalculates with every slider
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* CLOCK PROOF STRIP - supporting evidence     */}
        {/* ============================================ */}
        <div className="mb-6">
          <ClassroomClock variant="proof-strip" />
        </div>

        {/* ============================================ */}
        {/* GRANTS + JUSTIFICATION                      */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Grants */}
          <div>
            <div className="text-[10px] uppercase tracking-wide text-gray-500 font-bold mb-2">
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
                    <div className="text-[11px] text-gray-500 mt-0.5">{g.meta}</div>
                  </div>
                  <div
                    className={`text-[10px] font-bold px-2 py-1 rounded text-white uppercase tracking-wider ${
                      g.partial ? 'bg-[#ffba06] text-[#1e2749]' : 'bg-[#1e2749]'
                    }`}
                  >
                    {g.partial ? 'Partial' : 'Full'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Board justification */}
          <div>
            <div className="text-[10px] uppercase tracking-wide text-gray-500 font-bold mb-2">
              Board Justification
            </div>
            <div className="bg-white border-l-[3px] border-[#1e2749] p-4 rounded h-full">
              <span className="text-[#ffba06] text-2xl leading-none">&ldquo;</span>
              <p className="font-serif text-sm text-gray-900 italic leading-relaxed mt-1">
                We are reallocating <strong>{fmt(budget)}</strong> of existing PD spend into a TDI partnership that delivers <strong>6.5x the classroom implementation rate</strong>, funded primarily through {grants[0].short} allocations our district already receives.
              </p>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* CTAs                                         */}
        {/* ============================================ */}
        <div className="max-w-md mx-auto space-y-2.5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@school.edu"
            className="w-full p-3 border-[1.5px] border-gray-200 rounded-lg text-base focus:border-[#1e2749] focus:outline-none focus:ring-2 focus:ring-[#1e2749]/10"
          />
          <button
            onClick={handleGenerateMemo}
            disabled={!email || isGenerating}
            className="w-full px-8 py-3.5 bg-[#ffba06] text-[#1e2749] rounded-lg font-bold text-base shadow-md hover:bg-[#e6a505] hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating PDF...' : 'Download Board Memo (PDF)'}
          </button>
          <a
            href="/free-pd-plan"
            className="block w-full text-center px-8 py-3.5 border-2 border-[#1e2749] text-[#1e2749] rounded-lg font-semibold text-base hover:bg-[#1e2749] hover:text-white transition-all"
          >
            Get Your Free PD Plan
          </a>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function CompactSlider({ label, value, min, max, step, sliderValue, onChange }: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  sliderValue: number;
  onChange: (n: number) => void;
}) {
  const pct = ((sliderValue - min) / (max - min)) * 100;
  return (
    <div>
      <div className="text-[9px] uppercase tracking-[0.1em] font-bold mb-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
        {label}
      </div>
      <div className="font-serif text-base md:text-[17px] font-bold mb-2" style={{ color: '#ffba06' }}>
        {value}
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={sliderValue}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-[3px] rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #ffba06 0%, #ffba06 ${pct}%, rgba(255,255,255,0.15) ${pct}%, rgba(255,255,255,0.15) 100%)`,
          accentColor: '#ffba06',
        }}
      />
    </div>
  );
}
