'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export function TDICalculatorLarge() {
  const [teachers, setTeachers] = useState(50);
  const [classSize, setClassSize] = useState(25);
  const [years, setYears] = useState(3);
  const [showDetails, setShowDetails] = useState(false);
  const [animatingValues, setAnimatingValues] = useState(false);

  useEffect(() => {
    setAnimatingValues(true);
    const timer = setTimeout(() => setAnimatingValues(false), 400);
    return () => clearTimeout(timer);
  }, [teachers, classSize, years]);

  // All Calculations
  const tdiInvestment = (33600 + Math.max(0, (teachers - 50) * 150)) * years;
  const costPerTeacher = Math.round(tdiInvestment / teachers / years);
  const typicalPDSpend = teachers * 3000 * years;
  
  const totalHours = teachers * 5 * 52 * years;
  const sundaysBack = Math.round(totalHours / 6);
  const feedbackMoments = teachers * years * 24;
  
  const teachersAtRiskBefore = Math.round(teachers * 0.53);
  const teachersExitingBurnout = Math.round(teachersAtRiskBefore * 0.40);
  const teachersNowThriving = teachers - (teachersAtRiskBefore - teachersExitingBurnout);
  
  const students = teachers * classSize;
  const lessonsImproved = teachers * years * 40;
  const checkIns = students * years * 4;
  const smallGroupHours = Math.round((teachers * years * 40 * 45) / 60);
  const studentsHittingBenchmark = Math.round(students * 0.12 * years);
  const studentsGainingGround = Math.round(students * 0.15 * years);
  
  const wouldHaveLeft = Math.max(1, Math.round(teachers * 0.16 * years));
  const teachersRetained = Math.max(1, Math.round(wouldHaveLeft * 0.60));
  const hiringCostsAvoided = teachersRetained * 20000;
  const crisisDaysAvoided = teachersExitingBurnout * years * 15;
  const experienceYearsKept = teachersRetained * 8;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--tdi-charcoal)' }}>
          See What's Possible for Your School
        </h1>
        <p className="text-lg" style={{ color: 'var(--tdi-charcoal)', opacity: 0.7 }}>
          Adjust the sliders to match your school. Watch the impact unfold.
        </p>
      </div>

      {/* Main Calculator Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-8">
        
        {/* Sliders */}
        <div className="px-8 py-6 border-b border-gray-100" style={{ backgroundColor: 'var(--tdi-gray)' }}>
          <div className="grid grid-cols-3 gap-8">
            {/* Teachers */}
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-3">
                👩‍🏫 Teachers in Your School
              </label>
              <input
                type="range"
                min={10}
                max={500}
                value={teachers}
                onChange={(e) => setTeachers(parseInt(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, var(--tdi-navy) 0%, var(--tdi-navy) ${(teachers - 10) / 490 * 100}%, #d1d5db ${(teachers - 10) / 490 * 100}%, #d1d5db 100%)` }}
              />
              <div className="text-center mt-3 text-3xl font-black" style={{ color: 'var(--tdi-navy)' }}>{teachers}</div>
            </div>

            {/* Class Size */}
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-3">
                🎒 Average Class Size
              </label>
              <input
                type="range"
                min={15}
                max={35}
                value={classSize}
                onChange={(e) => setClassSize(parseInt(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, var(--tdi-navy) 0%, var(--tdi-navy) ${(classSize - 15) / 20 * 100}%, #d1d5db ${(classSize - 15) / 20 * 100}%, #d1d5db 100%)` }}
              />
              <div className="text-center mt-3 text-3xl font-black" style={{ color: 'var(--tdi-navy)' }}>{classSize}</div>
            </div>

            {/* Years */}
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-3">
                📅 Partnership Years
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={years}
                onChange={(e) => setYears(parseInt(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, var(--tdi-navy) 0%, var(--tdi-navy) ${(years - 1) / 4 * 100}%, #d1d5db ${(years - 1) / 4 * 100}%, #d1d5db 100%)` }}
              />
              <div className="text-center mt-3 text-3xl font-black" style={{ color: 'var(--tdi-navy)' }}>{years}</div>
            </div>
          </div>
        </div>

        {/* Four Categories */}
        <div className="px-8 py-6 space-y-6">
          
          {/* BUDGET */}
          <div className="rounded-xl p-5" style={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #10b981' }}>
            <h4 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
              💰 BUDGET
            </h4>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div 
                  className="text-3xl font-black transition-transform duration-200"
                  style={{ color: '#10b981', transform: animatingValues ? 'scale(1.03)' : 'scale(1)' }}
                >
                  ${costPerTeacher}
                </div>
                <div className="text-sm text-gray-600">per teacher/year</div>
              </div>
              <div>
                <div 
                  className="text-3xl font-black transition-transform duration-200"
                  style={{ color: '#10b981', transform: animatingValues ? 'scale(1.03)' : 'scale(1)' }}
                >
                  ${(tdiInvestment / 1000).toFixed(0)}k
                </div>
                <div className="text-sm text-gray-600">total {years}-year cost</div>
              </div>
              <div>
                <div 
                  className="text-3xl font-black transition-transform duration-200"
                  style={{ color: '#10b981', transform: animatingValues ? 'scale(1.03)' : 'scale(1)' }}
                >
                  ${(hiringCostsAvoided / 1000).toFixed(0)}k
                </div>
                <div className="text-sm text-gray-600">hiring costs avoided</div>
              </div>
              <div>
                <div className="text-3xl font-black" style={{ color: '#10b981' }}>✓</div>
                <div className="text-sm text-gray-600">Title II eligible</div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4 italic">
              Most districts spend $2,000–$5,000 per teacher annually on PD that doesn't stick. This replaces those costs.
            </p>
          </div>

          {/* YOUR TEACHERS */}
          <div className="rounded-xl p-5" style={{ backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
            <h4 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
              👩‍🏫 YOUR TEACHERS
            </h4>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div 
                  className="text-3xl font-black transition-transform duration-200"
                  style={{ color: '#d97706', transform: animatingValues ? 'scale(1.03)' : 'scale(1)' }}
                >
                  {teachersExitingBurnout}
                </div>
                <div className="text-sm text-gray-600">exit burnout zone</div>
              </div>
              <div>
                <div 
                  className="text-3xl font-black transition-transform duration-200"
                  style={{ color: '#d97706', transform: animatingValues ? 'scale(1.03)' : 'scale(1)' }}
                >
                  9→5
                </div>
                <div className="text-sm text-gray-600">stress level drop</div>
              </div>
              <div>
                <div 
                  className="text-3xl font-black transition-transform duration-200"
                  style={{ color: '#d97706', transform: animatingValues ? 'scale(1.03)' : 'scale(1)' }}
                >
                  {sundaysBack}
                </div>
                <div className="text-sm text-gray-600">Sundays given back</div>
              </div>
              <div>
                <div 
                  className="text-3xl font-black transition-transform duration-200"
                  style={{ color: '#d97706', transform: animatingValues ? 'scale(1.03)' : 'scale(1)' }}
                >
                  {feedbackMoments.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">feedback moments</div>
              </div>
            </div>
          </div>

          {/* YOUR STUDENTS */}
          <div className="rounded-xl p-5" style={{ backgroundColor: '#e0f2fe', borderLeft: '4px solid #0ea5e9' }}>
            <h4 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
              🎒 YOUR STUDENTS
            </h4>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div 
                  className="text-3xl font-black transition-transform duration-200"
                  style={{ color: '#0284c7', transform: animatingValues ? 'scale(1.03)' : 'scale(1)' }}
                >
                  {lessonsImproved.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">lessons improved</div>
              </div>
              <div>
                <div 
                  className="text-3xl font-black transition-transform duration-200"
                  style={{ color: '#0284c7', transform: animatingValues ? 'scale(1.03)' : 'scale(1)' }}
                >
                  {checkIns.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">1:1 check-ins enabled</div>
              </div>
              <div>
                <div 
                  className="text-3xl font-black transition-transform duration-200"
                  style={{ color: '#0284c7', transform: animatingValues ? 'scale(1.03)' : 'scale(1)' }}
                >
                  {smallGroupHours.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">small group hours</div>
              </div>
              <div>
                <div 
                  className="text-3xl font-black transition-transform duration-200"
                  style={{ color: '#0284c7', transform: animatingValues ? 'scale(1.03)' : 'scale(1)' }}
                >
                  {studentsHittingBenchmark}
                </div>
                <div className="text-sm text-gray-600">hitting new benchmarks</div>
              </div>
            </div>
          </div>

          {/* YOUR SCHOOL */}
          <div className="rounded-xl p-5" style={{ backgroundColor: '#fae8ff', borderLeft: '4px solid #c026d3' }}>
            <h4 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
              🏫 YOUR SCHOOL
            </h4>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div 
                  className="text-3xl font-black transition-transform duration-200"
                  style={{ color: '#a21caf', transform: animatingValues ? 'scale(1.03)' : 'scale(1)' }}
                >
                  {crisisDaysAvoided}
                </div>
                <div className="text-sm text-gray-600">crisis days avoided</div>
              </div>
              <div>
                <div 
                  className="text-3xl font-black transition-transform duration-200"
                  style={{ color: '#a21caf', transform: animatingValues ? 'scale(1.03)' : 'scale(1)' }}
                >
                  {teachersRetained}
                </div>
                <div className="text-sm text-gray-600">teachers you keep</div>
              </div>
              <div>
                <div 
                  className="text-3xl font-black transition-transform duration-200"
                  style={{ color: '#a21caf', transform: animatingValues ? 'scale(1.03)' : 'scale(1)' }}
                >
                  {experienceYearsKept}
                </div>
                <div className="text-sm text-gray-600">years experience kept</div>
              </div>
              <div>
                <div 
                  className="text-3xl font-black transition-transform duration-200"
                  style={{ color: '#a21caf', transform: animatingValues ? 'scale(1.03)' : 'scale(1)' }}
                >
                  {teachersNowThriving}
                </div>
                <div className="text-sm text-gray-600">teachers thriving</div>
              </div>
            </div>
          </div>

        </div>

        {/* What You'll Tell Your Board */}
        <div className="px-8 pb-6">
          <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--tdi-navy)' }}>
            <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              📋 WHAT YOU'LL TELL YOUR BOARD
            </h4>
            <p className="text-white opacity-90 leading-relaxed">
              "We invested <span className="font-bold">${tdiInvestment.toLocaleString()}</span> over {years} year{years > 1 ? 's' : ''} in teacher development through TDI. 
              We avoided approximately <span className="font-bold">${hiringCostsAvoided.toLocaleString()}</span> in replacement hiring costs. 
              Teacher wellness scores improved, with <span className="font-bold">{teachersExitingBurnout} teachers</span> exiting burnout risk. 
              This translated to <span className="font-bold">{lessonsImproved.toLocaleString()} improved lessons</span> and 
              <span className="font-bold"> {studentsHittingBenchmark} students</span> hitting new benchmarks."
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="px-8 pb-6">
          <div className="flex gap-4 justify-center">
            <Link 
              href="/contact" 
              className="btn-primary px-8 py-4 text-lg"
            >
              Start the Conversation
            </Link>
            <button 
              onClick={() => window.print()}
              className="btn-secondary px-8 py-4 text-lg"
            >
              Download Board Summary
            </button>
          </div>
        </div>
      </div>

      {/* Show More Details Toggle */}
      <div className="text-center mb-6">
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm font-semibold px-6 py-3 rounded-full transition-all"
          style={{ 
            backgroundColor: showDetails ? 'var(--tdi-navy)' : 'white', 
            color: showDetails ? 'white' : 'var(--tdi-navy)',
            border: '2px solid var(--tdi-navy)'
          }}
        >
          {showDetails ? '▼ Hide Detailed Breakdown' : '▶ Show Detailed Breakdown'}
        </button>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8">
          <h3 className="text-xl font-bold mb-6 text-center" style={{ color: 'var(--tdi-charcoal)' }}>
            Detailed Impact Breakdown
          </h3>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Teacher Efficiency */}
            <div className="p-4 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-700 mb-3">⚡ Teacher Efficiency</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex justify-between">
                  <span>Hours saved per week (team)</span>
                  <span className="font-bold">{teachers * 5}</span>
                </li>
                <li className="flex justify-between">
                  <span>Total hours saved</span>
                  <span className="font-bold">{totalHours.toLocaleString()}</span>
                </li>
                <li className="flex justify-between">
                  <span>Planning time reduction</span>
                  <span className="font-bold">12→6 hrs/week</span>
                </li>
              </ul>
            </div>

            {/* Wellbeing */}
            <div className="p-4 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-700 mb-3">💚 Teacher Wellbeing</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex justify-between">
                  <span>Teachers at burnout risk (before)</span>
                  <span className="font-bold">{teachersAtRiskBefore}</span>
                </li>
                <li className="flex justify-between">
                  <span>Teachers exiting burnout</span>
                  <span className="font-bold">{teachersExitingBurnout}</span>
                </li>
                <li className="flex justify-between">
                  <span>Stress level change</span>
                  <span className="font-bold">9/10 → 5/10</span>
                </li>
              </ul>
            </div>

            {/* Retention */}
            <div className="p-4 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-700 mb-3">🏠 Teacher Retention</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex justify-between">
                  <span>Would have left (industry avg)</span>
                  <span className="font-bold">{wouldHaveLeft}</span>
                </li>
                <li className="flex justify-between">
                  <span>Teachers retained with TDI</span>
                  <span className="font-bold">{teachersRetained}</span>
                </li>
                <li className="flex justify-between">
                  <span>Cost per replacement</span>
                  <span className="font-bold">$20,000</span>
                </li>
              </ul>
            </div>

            {/* Student Impact */}
            <div className="p-4 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-700 mb-3">📈 Student Outcomes</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex justify-between">
                  <span>Total students impacted</span>
                  <span className="font-bold">{(students * years).toLocaleString()}</span>
                </li>
                <li className="flex justify-between">
                  <span>Students gaining ground</span>
                  <span className="font-bold">{studentsGainingGround}</span>
                </li>
                <li className="flex justify-between">
                  <span>Research-backed gain potential</span>
                  <span className="font-bold">8-12 percentile pts</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Source Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-400">
          <strong>Sources:</strong> TDI Partner Surveys 2024-25 • RAND State of the American Teacher • Learning Policy Institute • Chetty et al.
        </p>
      </div>
    </div>
  );
}
