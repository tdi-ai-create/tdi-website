'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export function TDICalculator() {
  const [pdBudget, setPdBudget] = useState(2000);
  const [teacherHappiness, setTeacherHappiness] = useState(5);
  const [studentPerformance, setStudentPerformance] = useState(50);
  const [stateRating, setStateRating] = useState('C');
  const [hasEngaged, setHasEngaged] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const ratings = ['F', 'D', 'C', 'B', 'A'];

  // Calculate improvements
  const tdiCostPerTeacher = 672;
  const budgetSavings = pdBudget > tdiCostPerTeacher ? pdBudget - tdiCostPerTeacher : 0;
  const happinessImprovement = Math.min(teacherHappiness + 2, 10);
  const performanceImprovement = Math.min(studentPerformance + 8, 95);

  // Trigger popup when user has engaged with sliders and scrolls to results
  useEffect(() => {
    if (hasEngaged) {
      const timer = setTimeout(() => {
        const dismissed = sessionStorage.getItem('tdi-calc-popup-dismissed');
        if (!dismissed) {
          setShowPopup(true);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasEngaged]);

  const handleSliderChange = () => {
    setHasEngaged(true);
  };

  const handlePopupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Calculator email submitted:', email);
    setSubmitted(true);
    setTimeout(() => {
      setShowPopup(false);
      sessionStorage.setItem('tdi-calc-popup-dismissed', 'true');
    }, 2000);
  };

  const handlePopupDismiss = () => {
    setShowPopup(false);
    sessionStorage.setItem('tdi-calc-popup-dismissed', 'true');
  };

  // Dynamic facts based on inputs
  const getBudgetFact = () => {
    if (pdBudget >= 3000) {
      return "Districts spending $3,000+ per teacher often see less than 10% implementation of new strategies. TDI's flipped model achieves 4x higher implementation rates.";
    } else if (pdBudget >= 2000) {
      return "The average district spends $2,000-3,000 per teacher annually on PD that doesn't stick. TDI costs less and delivers more.";
    } else {
      return "Schools investing under $1,500 per teacher typically rely on one-day workshops with minimal follow-through.";
    }
  };

  const getHappinessFact = () => {
    if (teacherHappiness <= 3) {
      return "Schools with morale below 4 see 23% higher turnover. That's $20,000 per teacher to replace. (Learning Policy Institute)";
    } else if (teacherHappiness <= 5) {
      return "53% of teachers report burnout. TDI partners report stress dropping from 9/10 to 5-6/10 within one semester. (RAND 2025)";
    } else if (teacherHappiness <= 7) {
      return "Teachers with moderate satisfaction are 2x more likely to stay when given sustained support vs. one-time PD. (RAND)";
    } else {
      return "High-morale schools still lose teachers to burnout. Proactive support prevents backslide.";
    }
  };

  const getPerformanceFact = () => {
    if (studentPerformance <= 40) {
      return "When teachers reclaim 4+ hours/week, they provide 2x more small-group instruction. Research shows 8-12 percentile point gains. (Chetty et al.)";
    } else if (studentPerformance <= 60) {
      return "Teacher effectiveness is the #1 in-school factor for student achievement. A strong teacher can mean one full grade level of additional growth. (Hanushek)";
    } else if (studentPerformance <= 75) {
      return "Schools above 60% benchmark see accelerated gains when teachers have time for differentiation and intervention.";
    } else {
      return "High-performing schools maintain results by preventing teacher burnout. Sustainability matters.";
    }
  };

  const getRatingFact = () => {
    if (stateRating === 'F' || stateRating === 'D') {
      return "Schools that invest in sustained teacher development are 2x more likely to improve their state rating within 3 years. (TDI Partner Data)";
    } else if (stateRating === 'C') {
      return "C-rated schools often have the talent but lack systems. TDI provides the structure to unlock what's already there.";
    } else if (stateRating === 'B') {
      return "The jump from B to A requires consistency. TDI's ongoing support prevents the backslide that derails improvement.";
    } else {
      return "A-rated schools partner with TDI to retain top teachers and maintain excellence without burnout.";
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 max-w-2xl mx-auto">
        {/* Header */}
        <div className="px-6 py-5 text-center" style={{ backgroundColor: 'var(--tdi-navy)' }}>
          <h3 className="text-xl font-bold mb-1" style={{ color: 'white' }}>What's Possible for Your School?</h3>
          <p className="text-sm" style={{ color: 'white', opacity: 0.8 }}>Tell us where you are. We'll show you where you could be.</p>
        </div>

        {/* Input Sliders */}
        <div className="px-6 py-6 space-y-6">

          {/* Budget Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-700">
                Current PD spend per teacher
              </label>
              <span className="text-lg font-black" style={{ color: 'var(--tdi-navy)' }}>${pdBudget.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={500}
              max={5000}
              step={100}
              value={pdBudget}
              onChange={(e) => { setPdBudget(parseInt(e.target.value)); handleSliderChange(); }}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, var(--tdi-navy) 0%, var(--tdi-navy) ${(pdBudget - 500) / 4500 * 100}%, #e5e7eb ${(pdBudget - 500) / 4500 * 100}%, #e5e7eb 100%)` }}
            />
            <p className="text-xs text-gray-500 italic">{getBudgetFact()}</p>
          </div>

          {/* Teacher Happiness Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-700">
                Staff morale rating
              </label>
              <span className="text-lg font-black" style={{ color: '#d97706' }}>{teacherHappiness}/10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={teacherHappiness}
              onChange={(e) => { setTeacherHappiness(parseInt(e.target.value)); handleSliderChange(); }}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, #d97706 0%, #d97706 ${(teacherHappiness - 1) / 9 * 100}%, #e5e7eb ${(teacherHappiness - 1) / 9 * 100}%, #e5e7eb 100%)` }}
            />
            <p className="text-xs text-gray-500 italic">{getHappinessFact()}</p>
          </div>

          {/* Student Performance Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-700">
                Students at grade-level benchmark
              </label>
              <span className="text-lg font-black" style={{ color: '#0284c7' }}>{studentPerformance}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={90}
              value={studentPerformance}
              onChange={(e) => { setStudentPerformance(parseInt(e.target.value)); handleSliderChange(); }}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, #0284c7 0%, #0284c7 ${(studentPerformance - 20) / 70 * 100}%, #e5e7eb ${(studentPerformance - 20) / 70 * 100}%, #e5e7eb 100%)` }}
            />
            <p className="text-xs text-gray-500 italic">{getPerformanceFact()}</p>
          </div>

          {/* State Rating Selector */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-700">
                Current state rating
              </label>
              <span className="text-lg font-black" style={{ color: '#a21caf' }}>{stateRating}</span>
            </div>
            <div className="flex gap-2">
              {ratings.map((rating) => (
                <button
                  key={rating}
                  onClick={() => { setStateRating(rating); handleSliderChange(); }}
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
            <p className="text-xs text-gray-500 italic">{getRatingFact()}</p>
          </div>

        </div>

        {/* Results Panel */}
        <div className="px-6 pb-6">
          <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--tdi-navy)' }}>
            <h4 className="text-white font-bold text-center mb-4">With TDI, Your School Could See:</h4>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-black text-white">
                  {budgetSavings > 0 ? `-$${budgetSavings.toLocaleString()}` : 'Same'}
                </div>
                <div className="text-xs text-white/70">PD cost per teacher</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-black text-white">
                  {teacherHappiness} → {happinessImprovement}
                </div>
                <div className="text-xs text-white/70">Staff morale</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-black text-white">
                  {studentPerformance}% → {performanceImprovement}%
                </div>
                <div className="text-xs text-white/70">Students at benchmark</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-black text-white">
                  Improved
                </div>
                <div className="text-xs text-white/70">On track for rating growth</div>
              </div>
            </div>

            <Link 
              href="/contact" 
              className="block w-full text-center py-3 rounded-lg font-bold transition-all"
              style={{ backgroundColor: 'var(--tdi-yellow)', color: 'var(--tdi-charcoal)' }}
            >
              Start the Conversation
            </Link>
          </div>
        </div>

        {/* Source */}
        <div className="px-6 pb-4">
          <p className="text-xs text-gray-400 text-center">
            Research: RAND 2025, Learning Policy Institute, Chetty et al., TDI Partner Data
          </p>
        </div>
      </div>

      {/* Email Popup - Triggered on engagement */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={handlePopupDismiss}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <button 
              onClick={handlePopupDismiss}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {submitted ? (
              <div className="text-center py-4">
                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--tdi-navy)' }}>
                  You're in!
                </h3>
                <p style={{ opacity: 0.7 }}>
                  Welcome to the movement.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold mb-4 text-center">
                  Join the movement of educators no longer accepting the status quo
                </h3>
                
                <p className="text-center mb-6" style={{ opacity: 0.7 }}>
                  Get practical strategies delivered to your inbox 3x/week. Join 87,000+ educators.
                </p>

                <form onSubmit={handlePopupSubmit} className="space-y-4">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-gray-500"
                  />
                  <button 
                    type="submit" 
                    className="w-full py-3 rounded-lg font-bold transition-all"
                    style={{ backgroundColor: 'var(--tdi-navy)', color: 'white' }}
                  >
                    Join 87,000+ Educators
                  </button>
                </form>

                <p className="text-xs text-center mt-4" style={{ opacity: 0.5 }}>
                  No spam. Unsubscribe anytime.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
