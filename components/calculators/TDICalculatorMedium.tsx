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
  const weeklyTeamHours = teachers * 5;
  const annualHours = weeklyTeamHours * 52;
  const totalHours = annualHours * years;
  
  const wouldHaveLeft = Math.max(1, Math.round(teachers * 0.16 * years));
  const teachersRetained = Math.max(1, Math.round(wouldHaveLeft * 0.60));
  const retentionSavings = teachersRetained * 20000;
  
  const students = teachers * classSize;
  const totalStudentYears = students * years;
  
  const tdiInvestment = (33600 + Math.max(0, (teachers - 50) * 150)) * years;
  const netImpact = retentionSavings - tdiInvestment;

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="px-6 py-5 text-center" style={{ backgroundColor: 'var(--tdi-teal)', color: 'white' }}>
        <h3 className="text-2xl font-bold mb-1">See Your School's Impact</h3>
        <p className="text-sm opacity-80">Adjust the sliders to see what TDI can do for you</p>
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
              style={{ background: `linear-gradient(to right, var(--tdi-teal) 0%, var(--tdi-teal) ${(teachers - 10) / 490 * 100}%, #e5e7eb ${(teachers - 10) / 490 * 100}%, #e5e7eb 100%)` }}
            />
            <div className="text-center mt-2 text-2xl font-bold" style={{ color: 'var(--tdi-teal)' }}>{teachers}</div>
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
              style={{ background: `linear-gradient(to right, var(--tdi-teal) 0%, var(--tdi-teal) ${(classSize - 15) / 20 * 100}%, #e5e7eb ${(classSize - 15) / 20 * 100}%, #e5e7eb 100%)` }}
            />
            <div className="text-center mt-2 text-2xl font-bold" style={{ color: 'var(--tdi-teal)' }}>{classSize}</div>
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
              style={{ background: `linear-gradient(to right, var(--tdi-teal) 0%, var(--tdi-teal) ${(years - 1) / 4 * 100}%, #e5e7eb ${(years - 1) / 4 * 100}%, #e5e7eb 100%)` }}
            />
            <div className="text-center mt-2 text-2xl font-bold" style={{ color: 'var(--tdi-teal)' }}>{years}</div>
          </div>
        </div>
      </div>

      {/* 4 Big Numbers */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'var(--tdi-peach)' }}>
            <div 
              className="text-3xl font-black mb-1 transition-transform duration-200"
              style={{ color: 'var(--tdi-teal)', transform: animatingValues ? 'scale(1.05)' : 'scale(1)' }}
            >
              {totalHours.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600 font-medium">Hours Saved</div>
          </div>
          
          <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'var(--tdi-peach)' }}>
            <div 
              className="text-3xl font-black mb-1 transition-transform duration-200"
              style={{ color: 'var(--tdi-teal)', transform: animatingValues ? 'scale(1.05)' : 'scale(1)' }}
            >
              {teachersRetained}
            </div>
            <div className="text-xs text-gray-600 font-medium">Teachers Stay</div>
          </div>
          
          <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'var(--tdi-peach)' }}>
            <div 
              className="text-3xl font-black mb-1 transition-transform duration-200"
              style={{ color: 'var(--tdi-teal)', transform: animatingValues ? 'scale(1.05)' : 'scale(1)' }}
            >
              {totalStudentYears.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600 font-medium">Students Reached</div>
          </div>
          
          <div className="text-center p-4 rounded-xl" style={{ backgroundColor: netImpact >= 0 ? '#ecfdf5' : '#fef2f2' }}>
            <div 
              className="text-3xl font-black mb-1 transition-transform duration-200"
              style={{ color: netImpact >= 0 ? '#10b981' : '#ef4444', transform: animatingValues ? 'scale(1.05)' : 'scale(1)' }}
            >
              {netImpact >= 0 ? '+' : ''}${(netImpact / 1000).toFixed(0)}k
            </div>
            <div className="text-xs text-gray-600 font-medium">Net ROI</div>
          </div>
        </div>
      </div>

      {/* Investment Bar */}
      <div className="px-6 pb-4">
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--tdi-navy)' }}>
          <div className="flex justify-between items-center text-white">
            <div className="text-center">
              <div className="text-xs opacity-60 uppercase">Investment</div>
              <div className="text-xl font-bold">${tdiInvestment.toLocaleString()}</div>
            </div>
            <div className="text-2xl opacity-40">→</div>
            <div className="text-center">
              <div className="text-xs opacity-60 uppercase">Retention Savings</div>
              <div className="text-xl font-bold" style={{ color: '#6ee7b7' }}>${retentionSavings.toLocaleString()}</div>
            </div>
            <div className="text-2xl opacity-40">=</div>
            <div className="text-center">
              <div className="text-xs opacity-60 uppercase">Net Return</div>
              <div 
                className="text-2xl font-black transition-transform duration-200"
                style={{ color: netImpact >= 0 ? '#6ee7b7' : '#fca5a5', transform: animatingValues ? 'scale(1.05)' : 'scale(1)' }}
              >
                {netImpact >= 0 ? '+' : ''}${netImpact.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="px-6 pb-6">
        <div className="flex gap-3 justify-center">
          <Link 
            href="/for-schools/schedule-call" 
            className="btn-primary px-6 py-3"
          >
            Schedule a Conversation
          </Link>
          <Link 
            href="/calculator" 
            className="btn-secondary px-6 py-3"
          >
            See Full Breakdown
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
