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

  // Calculations
  const sundaysBack = Math.round((teachers * 5 * 52 * years) / 6);
  const teachersAtRiskBefore = Math.round(teachers * 0.53);
  const teachersExitingBurnout = Math.round(teachersAtRiskBefore * 0.40);
  const wouldHaveLeft = Math.max(1, Math.round(teachers * 0.16 * years));
  const teachersRetained = Math.max(1, Math.round(wouldHaveLeft * 0.60));
  const students = teachers * 25;
  const lessonsImproved = teachers * years * 40;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="px-6 py-4 text-center" style={{ backgroundColor: 'var(--tdi-yellow)' }}>
        <h3 className="text-xl font-bold" style={{ color: 'var(--tdi-charcoal)' }}>
          What's Possible for Your School
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

      {/* Key Stats - Admin Friendly */}
      <div className="px-6 pb-6 space-y-4">
        
        {/* Teachers Row */}
        <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--tdi-peach)' }}>
          <span className="text-sm font-medium text-gray-700">👩‍🏫 Teachers exiting burnout</span>
          <span 
            className="text-2xl font-black transition-transform duration-200"
            style={{ color: 'var(--tdi-coral)', transform: animatingValues ? 'scale(1.05)' : 'scale(1)' }}
          >
            {teachersExitingBurnout}
          </span>
        </div>
        
        {/* Retention Row */}
        <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--tdi-peach)' }}>
          <span className="text-sm font-medium text-gray-700">🏫 Teachers you won't have to replace</span>
          <span 
            className="text-2xl font-black transition-transform duration-200"
            style={{ color: 'var(--tdi-teal)', transform: animatingValues ? 'scale(1.05)' : 'scale(1)' }}
          >
            {teachersRetained}
          </span>
        </div>

        {/* Lessons Row */}
        <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--tdi-peach)' }}>
          <span className="text-sm font-medium text-gray-700">🎒 Lessons improved for students</span>
          <span 
            className="text-2xl font-black transition-transform duration-200"
            style={{ color: 'var(--tdi-navy)', transform: animatingValues ? 'scale(1.05)' : 'scale(1)' }}
          >
            {lessonsImproved.toLocaleString()}
          </span>
        </div>

        {/* Sundays Row */}
        <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--tdi-peach)' }}>
          <span className="text-sm font-medium text-gray-700">☀️ Sundays given back to teachers</span>
          <span 
            className="text-2xl font-black transition-transform duration-200"
            style={{ color: '#d97706', transform: animatingValues ? 'scale(1.05)' : 'scale(1)' }}
          >
            {sundaysBack}
          </span>
        </div>

      </div>

      {/* Tagline */}
      <div className="px-6 pb-5">
        <p className="text-center text-sm" style={{ color: 'var(--tdi-charcoal)', opacity: 0.7 }}>
          This is what happens when you invest in your teachers.
        </p>
      </div>
    </div>
  );
}
