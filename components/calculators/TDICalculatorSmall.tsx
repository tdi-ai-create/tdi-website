'use client';

import React, { useState, useEffect } from 'react';

export function TDICalculatorSmall() {
  const [teachers, setTeachers] = useState(50);
  const [years, setYears] = useState(3);
  const [animatingValues, setAnimatingValues] = useState(false);

  useEffect(() => {
    setAnimatingValues(true);
    const timer = setTimeout(() => setAnimatingValues(false), 400);
    return () => clearTimeout(timer);
  }, [teachers, years]);

  // Simplified calculations
  const totalHours = teachers * 5 * 52 * years;
  const sundaysBack = Math.round(totalHours / 6);
  const wouldHaveLeft = Math.max(1, Math.round(teachers * 0.16 * years));
  const teachersRetained = Math.max(1, Math.round(wouldHaveLeft * 0.60));
  const students = teachers * 25; // assume 25 avg
  const totalStudentYears = students * years;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="px-6 py-4 text-center" style={{ backgroundColor: 'var(--tdi-yellow)' }}>
        <h3 className="text-xl font-bold" style={{ color: 'var(--tdi-charcoal)' }}>
          What's at Stake for Your School?
        </h3>
      </div>

      {/* Sliders - Just 2 */}
      <div className="px-6 py-5">
        <div className="grid grid-cols-2 gap-6">
          {/* Teachers Slider */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              👩‍🏫 Teachers
            </label>
            <input
              type="range"
              min={10}
              max={200}
              value={teachers}
              onChange={(e) => setTeachers(parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, var(--tdi-teal) 0%, var(--tdi-teal) ${(teachers - 10) / 190 * 100}%, #e5e7eb ${(teachers - 10) / 190 * 100}%, #e5e7eb 100%)` }}
            />
            <div className="text-center mt-2 text-2xl font-bold" style={{ color: 'var(--tdi-teal)' }}>{teachers}</div>
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

      {/* 3 Emotional Stats */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'var(--tdi-peach)' }}>
            <div 
              className="text-3xl font-black mb-1 transition-transform duration-200"
              style={{ color: 'var(--tdi-coral)', transform: animatingValues ? 'scale(1.05)' : 'scale(1)' }}
            >
              {sundaysBack}
            </div>
            <div className="text-xs text-gray-600 font-medium">Sundays Given Back</div>
          </div>
          
          <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'var(--tdi-peach)' }}>
            <div 
              className="text-3xl font-black mb-1 transition-transform duration-200"
              style={{ color: 'var(--tdi-teal)', transform: animatingValues ? 'scale(1.05)' : 'scale(1)' }}
            >
              {teachersRetained}
            </div>
            <div className="text-xs text-gray-600 font-medium">Teachers Who Stay</div>
          </div>
          
          <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'var(--tdi-peach)' }}>
            <div 
              className="text-3xl font-black mb-1 transition-transform duration-200"
              style={{ color: 'var(--tdi-navy)', transform: animatingValues ? 'scale(1.05)' : 'scale(1)' }}
            >
              {totalStudentYears.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600 font-medium">Students Impacted</div>
          </div>
        </div>
      </div>

      {/* Emotional Tagline */}
      <div className="px-6 pb-5">
        <p className="text-center text-sm" style={{ color: 'var(--tdi-charcoal)', opacity: 0.7 }}>
          This is what's possible when you invest in your teachers.
        </p>
      </div>
    </div>
  );
}
