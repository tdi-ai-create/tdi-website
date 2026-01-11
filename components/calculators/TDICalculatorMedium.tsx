'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export function TDICalculatorMedium() {
  const [teachers, setTeachers] = useState(50);
  const [classSize, setClassSize] = useState(25);
  const [years, setYears] = useState(3);
  const [animatingValues, setAnimatingValues] = useState(false);

  useEffect(() => {
    setAnimatingValues(true);
    const timer = setTimeout(() => setAnimatingValues(false), 400);
    return () => clearTimeout(timer);
  }, [teachers, classSize, years]);

  // Calculations
  const tdiInvestment = (33600 + Math.max(0, (teachers - 50) * 150)) * years;
  const costPerTeacher = Math.round(tdiInvestment / teachers / years);
  const typicalPDSpend = teachers * 3000 * years; // $3k avg per teacher
  
  const totalHours = teachers * 5 * 52 * years;
  const sundaysBack = Math.round(totalHours / 6);
  const feedbackMoments = teachers * years * 24; // 2x per month
  
  const teachersAtRiskBefore = Math.round(teachers * 0.53);
  const teachersExitingBurnout = Math.round(teachersAtRiskBefore * 0.40);
  
  const students = teachers * classSize;
  const lessonsImproved = teachers * years * 40;
  const checkIns = students * years * 4;
  const smallGroupHours = Math.round((teachers * years * 40 * 45) / 60);
  const studentsHittingBenchmark = Math.round(students * 0.12 * years);
  
  const wouldHaveLeft = Math.max(1, Math.round(teachers * 0.16 * years));
  const teachersRetained = Math.max(1, Math.round(wouldHaveLeft * 0.60));
  const hiringCostsAvoided = teachersRetained * 20000;
  const crisisDaysAvoided = teachersExitingBurnout * years * 15;

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="px-6 py-5 text-center" style={{ backgroundColor: 'var(--tdi-navy)', color: 'white' }}>
        <h3 className="text-2xl font-bold mb-1">See What's Possible for Your School</h3>
        <p className="text-sm opacity-80">Adjust the sliders to match your school</p>
      </div>

      {/* Sliders */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="grid grid-cols-3 gap-6">
          {/* Teachers Slider */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              👩‍🏫 Teachers
            </label>
            <input
              type="range"
              min={10}
              max={500}
              value={teachers}
              onChange={(e) => setTeachers(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, var(--tdi-navy) 0%, var(--tdi-navy) ${(teachers - 10) / 490 * 100}%, #e5e7eb ${(teachers - 10) / 490 * 100}%, #e5e7eb 100%)` }}
            />
            <div className="text-center mt-2 text-2xl font-bold" style={{ color: 'var(--tdi-navy)' }}>{teachers}</div>
          </div>

          {/* Class Size Slider */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              🎒 Class Size
            </label>
            <input
              type="range"
              min={15}
              max={35}
              value={classSize}
              onChange={(e) => setClassSize(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, var(--tdi-navy) 0%, var(--tdi-navy) ${(classSize - 15) / 20 * 100}%, #e5e7eb ${(classSize - 15) / 20 * 100}%, #e5e7eb 100%)` }}
            />
            <div className="text-center mt-2 text-2xl font-bold" style={{ color: 'var(--tdi-navy)' }}>{classSize}</div>
          </div>

          {/* Years Slider */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              📅 Years
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={years}
              onChange={(e) => setYears(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, var(--tdi-navy) 0%, var(--tdi-navy) ${(years - 1) / 4 * 100}%, #e5e7eb ${(years - 1) / 4 * 100}%, #e5e7eb 100%)` }}
            />
            <div className="text-center mt-2 text-2xl font-bold" style={{ color: 'var(--tdi-navy)' }}>{years}</div>
          </div>
        </div>
      </div>

      {/* Four Categories */}
      <div className="px-6 py-6 space-y-6">
        
        {/* BUDGET */}
        <div className="rounded-xl p-4" style={{ backgroundColor: '#f0fdf4', borderLeft: '4px solid #10b981' }}>
          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            💰 BUDGET
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div 
                className="text-2xl font-black transition-transform duration-200"
                style={{ color: '#10b981', transform: animatingValues ? 'scale(1.03)' : 'scale(1)' }}
              >
                ${costPerTeacher}
              </div>
              <div className="text-xs text-gray-600">per teacher/year</div>
            </div>
            <div>
              <div 
                className="text-2xl font-black transition-transform duration-200"
                style={{ color: '#10b981', transform: animatingValues ? 'scale(1.03)' : 'scale(1)' }}
              >
                ${(hiringCostsAvoided / 1000).toFixed(0)}k
              </div>
              <div className="text-xs text-gray-600">hiring costs avoided</div>
            </div>
            <div>
              <div className="text-2xl font-black" style={{ color: '#10b981' }}>✓</div>
              <div className="text-xs text-gray-600">Title II eligible</div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 italic">
            Most districts spend $2,000–$5,000 per teacher on PD that doesn't stick.
          </p>
        </div>

        {/* YOUR TEACHERS */}
        <div className="rounded-xl p-4" style={{ backgroundColor: '#fef3c7', borderLeft: '4px solid #f59e0b' }}>
          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            👩‍🏫 YOUR TEACHERS
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div 
                className="text-2xl font-black transition-transform duration-200"
                style={{ color: '#d97706', transform: animatingValues ? 'scale(1.03)' : 'scale(1)' }}
              >
                {teachersExitingBurnout}
              </div>
              <div className="text-xs text-gray-600">exit burnout zone</div>
            </div>
            <div>
              <div 
                className="text-2xl font-black transition-transform duration-200"
                style={{ color: '#d97706', transform: animatingValues ? 'scale(1.03)' : 'scale(1)' }}
              >
                9→5
              </div>
              <div className="text-xs text-gray-600">stress level drop</div>
            </div>
            <div>
              <div 
                className="text-2xl font-black transition-transform duration-200"
                style={{ color: '#d97706', transform: animatingValues ? 'scale(1.03)' : 'scale(1)' }}
              >
                {sundaysBack}
              </div>
              <div className="text-xs text-gray-600">Sundays given back</div>
            </div>
          </div>
        </div>

        {/* YOUR STUDENTS */}
        <div className="rounded-xl p-4" style={{ backgroundColor: '#e0f2fe', borderLeft: '4px solid #0ea5e9' }}>
          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            🎒 YOUR STUDENTS
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div 
                className="text-2xl font-black transition-transform duration-200"
                style={{ color: '#0284c7', transform: animatingValues ? 'scale(1.03)' : 'scale(1)' }}
              >
                {lessonsImproved.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">lessons improved</div>
            </div>
            <div>
              <div 
                className="text-2xl font-black transition-transform duration-200"
                style={{ color: '#0284c7', transform: animatingValues ? 'scale(1.03)' : 'scale(1)' }}
              >
                {checkIns.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">1:1 check-ins enabled</div>
            </div>
            <div>
              <div 
                className="text-2xl font-black transition-transform duration-200"
                style={{ color: '#0284c7', transform: animatingValues ? 'scale(1.03)' : 'scale(1)' }}
              >
                {studentsHittingBenchmark}
              </div>
              <div className="text-xs text-gray-600">hitting new benchmarks</div>
            </div>
          </div>
        </div>

        {/* YOUR SCHOOL */}
        <div className="rounded-xl p-4" style={{ backgroundColor: '#fae8ff', borderLeft: '4px solid #c026d3' }}>
          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            🏫 YOUR SCHOOL
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div 
                className="text-2xl font-black transition-transform duration-200"
                style={{ color: '#a21caf', transform: animatingValues ? 'scale(1.03)' : 'scale(1)' }}
              >
                {crisisDaysAvoided}
              </div>
              <div className="text-xs text-gray-600">crisis days avoided</div>
            </div>
            <div>
              <div 
                className="text-2xl font-black transition-transform duration-200"
                style={{ color: '#a21caf', transform: animatingValues ? 'scale(1.03)' : 'scale(1)' }}
              >
                {teachersRetained}
              </div>
              <div className="text-xs text-gray-600">teachers you keep</div>
            </div>
            <div>
              <div 
                className="text-2xl font-black transition-transform duration-200"
                style={{ color: '#a21caf', transform: animatingValues ? 'scale(1.03)' : 'scale(1)' }}
              >
                {feedbackMoments.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">feedback moments</div>
            </div>
          </div>
        </div>

      </div>

      {/* CTAs */}
      <div className="px-6 pb-6">
        <div className="flex gap-3 justify-center">
          <Link 
            href="/contact" 
            className="btn-primary px-6 py-3"
          >
            Schedule a Conversation
          </Link>
          <Link 
            href="/calculator" 
            className="btn-secondary px-6 py-3"
          >
            Download Board Summary
          </Link>
        </div>
      </div>

      {/* Source */}
      <div className="px-6 pb-4">
        <p className="text-xs text-gray-400 text-center">
          Based on TDI Partner Data 2024-25, RAND Research, Learning Policy Institute
        </p>
      </div>
    </div>
  );
}
