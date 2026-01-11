'use client';

import { useState, useEffect, useRef } from 'react';

interface OutcomeItemProps {
  label: string;
  currentValue: string;
  tdiValue: string;
  context: string;
  delay: number;
  isVisible: boolean;
}

function OutcomeItem({ label, currentValue, tdiValue, context, delay, isVisible }: OutcomeItemProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShow(true), delay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, delay]);

  return (
    <div
      className={`grid grid-cols-3 gap-4 items-center p-4 rounded-lg transition-all duration-500 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ backgroundColor: '#ffffff' }}
    >
      {/* Current State */}
      <div className="text-center">
        <p className="text-xl md:text-2xl font-bold" style={{ color: '#1e2749', opacity: 0.5 }}>
          {currentValue}
        </p>
      </div>

      {/* Label (center) */}
      <div className="text-center">
        <p className="font-semibold text-sm" style={{ color: '#1e2749' }}>{label}</p>
        <p className="text-xs mt-1" style={{ color: '#1e2749', opacity: 0.6 }}>{context}</p>
      </div>

      {/* With TDI */}
      <div className="text-center">
        <p className="text-xl md:text-2xl font-bold" style={{ color: '#ffba06' }}>
          {tdiValue}
        </p>
      </div>
    </div>
  );
}

export function SchoolsROICalculator() {
  const [step, setStep] = useState<'input' | 'results'>('input');
  const [schoolSize, setSchoolSize] = useState(50);
  const [budget, setBudget] = useState(50000);
  const [implementation, setImplementation] = useState(15);
  const [morale, setMorale] = useState(5);
  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  const getSchoolSizeLabel = (size: number) => {
    if (size <= 30) return 'Small school';
    if (size <= 75) return 'Medium school';
    return 'Large school';
  };

  const handleShowResults = () => {
    setStep('results');
    setShowResults(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleBackToInputs = () => {
    setStep('input');
    setShowResults(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Intro Framing */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#1e2749' }}>
          See Your School's Potential
        </h2>
        <p className="text-base" style={{ color: '#1e2749', opacity: 0.7 }}>
          Answer 4 quick questions to see what's possible when your teachers thrive.
        </p>
      </div>

      {/* Calculator Card */}
      <div className="bg-white rounded-xl p-6 shadow-lg" style={{ border: '1px solid #e5e7eb' }}>

        {step === 'input' && (
          <div className="space-y-6">
            {/* Question 1: School Size */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
                1. How many teachers are in your building?
              </label>
              <input
                type="range"
                min="10"
                max="150"
                value={schoolSize}
                onChange={(e) => setSchoolSize(parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #ffba06 0%, #ffba06 ${(schoolSize - 10) / 140 * 100}%, #e5e7eb ${(schoolSize - 10) / 140 * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>10</span>
                <span className="text-lg font-bold" style={{ color: '#1e2749' }}>
                  {schoolSize} teachers <span className="text-sm font-normal">({getSchoolSizeLabel(schoolSize)})</span>
                </span>
                <span className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>150+</span>
              </div>
            </div>

            {/* Question 2: PD Budget */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
                2. What's your annual PD budget?
              </label>
              <input
                type="range"
                min="10000"
                max="200000"
                step="5000"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #ffba06 0%, #ffba06 ${(budget - 10000) / 190000 * 100}%, #e5e7eb ${(budget - 10000) / 190000 * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>$10k</span>
                <span className="text-lg font-bold" style={{ color: '#1e2749' }}>{formatCurrency(budget)}</span>
                <span className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>$200k</span>
              </div>
            </div>

            {/* Question 3: Implementation Rate */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
                3. How much of your current PD gets used in classrooms?
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={implementation}
                onChange={(e) => setImplementation(parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #ffba06 0%, #ffba06 ${implementation / 50 * 100}%, #e5e7eb ${implementation / 50 * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>0%</span>
                <span className="text-lg font-bold" style={{ color: '#1e2749' }}>{implementation}%</span>
                <span className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>50%</span>
              </div>
            </div>

            {/* Question 4: Staff Morale */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: '#1e2749' }}>
                4. How would you rate your staff morale right now?
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={morale}
                onChange={(e) => setMorale(parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #ffba06 0%, #ffba06 ${(morale - 1) / 9 * 100}%, #e5e7eb ${(morale - 1) / 9 * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>1 - Crisis</span>
                <span className="text-lg font-bold" style={{ color: '#1e2749' }}>{morale}/10</span>
                <span className="text-xs" style={{ color: '#1e2749', opacity: 0.6 }}>10 - Thriving</span>
              </div>
            </div>

            {/* See Results Button */}
            <button
              onClick={handleShowResults}
              className="w-full py-4 rounded-lg font-bold text-lg transition-all hover:scale-[1.02] hover:shadow-lg"
              style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
            >
              See What's Possible
            </button>
          </div>
        )}

        {step === 'results' && (
          <div ref={resultsRef} className="space-y-6">
            {/* Results Header */}
            <div className="text-center pb-4 border-b" style={{ borderColor: '#e5e7eb' }}>
              <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ color: '#1e2749' }}>
                Here's What's Possible at Your School
              </h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Based on verified outcomes from TDI partner schools
              </p>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#1e2749', opacity: 0.5 }}>
                  Current State
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#1e2749', opacity: 0.5 }}>
                  Outcome
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#ffba06' }}>
                  With TDI
                </p>
              </div>
            </div>

            {/* Outcomes - Animated Reveal */}
            <div className="space-y-3" style={{ backgroundColor: '#f5f5f5', padding: '16px', borderRadius: '12px' }}>
              <OutcomeItem
                label="Teacher Retention"
                currentValue="2-4"
                tdiValue="5-7"
                context="on a 10-point scale"
                delay={0}
                isVisible={showResults}
              />
              <OutcomeItem
                label="Staff Stress Levels"
                currentValue="9/10"
                tdiValue="5-7/10"
                context="reported stress level"
                delay={200}
                isVisible={showResults}
              />
              <OutcomeItem
                label="Weekly Planning Time"
                currentValue="12+ hrs"
                tdiValue="6-8 hrs"
                context="per teacher, per week"
                delay={400}
                isVisible={showResults}
              />
              <OutcomeItem
                label="Implementation Rate"
                currentValue={`${implementation}%`}
                tdiValue="65%"
                context="strategies used in classrooms"
                delay={600}
                isVisible={showResults}
              />
            </div>

            {/* Dynamic Schools Like Yours Line */}
            <div className="text-center py-4 px-6 rounded-lg" style={{ backgroundColor: '#fffbeb' }}>
              <p className="text-sm font-medium" style={{ color: '#1e2749' }}>
                {schoolSize > 0 ? (
                  <>Schools your size ({schoolSize} teachers) typically see these improvements within the first year of partnership.</>
                ) : (
                  <>Schools partnering with TDI typically see these improvements within Year 1.</>
                )}
              </p>
            </div>

            {/* Credibility Note */}
            <p className="text-xs text-center" style={{ color: '#1e2749', opacity: 0.5 }}>
              Based on verified outcomes from TDI partner schools
            </p>

            {/* Warm CTA Section */}
            <div className="pt-6 border-t text-center" style={{ borderColor: '#e5e7eb' }}>
              <h4 className="text-lg font-bold mb-4" style={{ color: '#1e2749' }}>
                Ready to explore this for your school?
              </h4>
              <a
                href="/contact"
                className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-[1.02] hover:shadow-lg"
                style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
              >
                Let's Talk
              </a>
              <p className="text-sm mt-4" style={{ color: '#1e2749', opacity: 0.6 }}>
                No pressure. Just a conversation about what's possible.
              </p>
            </div>

            {/* Back to Inputs */}
            <button
              onClick={handleBackToInputs}
              className="w-full py-3 rounded-lg font-semibold transition-all hover:opacity-80 border"
              style={{ borderColor: '#e5e7eb', color: '#1e2749' }}
            >
              ← Adjust Your Inputs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
