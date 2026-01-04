'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export function TDICalculator() {
  const [teachers, setTeachers] = useState(50);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setAnimating(true);
    const timer = setTimeout(() => setAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [teachers]);

  // Calculations
  const costPerTeacher = 672; // simplified annual cost
  const hoursPerWeekSaved = teachers * 5; // 5 hrs saved per teacher per week
  const lessonsImproved = teachers * 40 * 3; // 40 weeks × 3 years
  const cultureBoost = 15; // percentage potential

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 max-w-xl mx-auto">
      {/* Header */}
      <div className="px-6 py-5 text-center" style={{ backgroundColor: 'var(--tdi-teal)', color: 'white' }}>
        <h3 className="text-xl font-bold">See What's Possible for Your School</h3>
      </div>

      {/* Slider */}
      <div className="px-6 py-6 border-b border-gray-100">
        <label className="block text-sm font-bold text-gray-600 mb-3 text-center">
          How many teachers in your school?
        </label>
        <input
          type="range"
          min={10}
          max={200}
          value={teachers}
          onChange={(e) => setTeachers(parseInt(e.target.value))}
          className="w-full h-3 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--tdi-teal) 0%, var(--tdi-teal) ${(teachers - 10) / 190 * 100}%, #e5e7eb ${(teachers - 10) / 190 * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="text-center mt-3 text-4xl font-black" style={{ color: 'var(--tdi-teal)' }}>
          {teachers}
        </div>
      </div>

      {/* Four Metrics */}
      <div className="px-6 py-6 space-y-4">

        {/* Budget */}
        <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: '#f0fdf4' }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <span className="font-medium text-gray-700">Budget</span>
          </div>
          <div
            className="text-2xl font-black transition-transform duration-200"
            style={{ color: '#10b981', transform: animating ? 'scale(1.05)' : 'scale(1)' }}
          >
            ${costPerTeacher}/teacher/yr
          </div>
        </div>

        {/* Teacher Time */}
        <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: '#fef3c7' }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏰</span>
            <span className="font-medium text-gray-700">Teacher Time</span>
          </div>
          <div
            className="text-2xl font-black transition-transform duration-200"
            style={{ color: '#d97706', transform: animating ? 'scale(1.05)' : 'scale(1)' }}
          >
            {hoursPerWeekSaved} hrs/week saved
          </div>
        </div>

        {/* Student Impact */}
        <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: '#e0f2fe' }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎒</span>
            <span className="font-medium text-gray-700">Student Impact</span>
          </div>
          <div
            className="text-2xl font-black transition-transform duration-200"
            style={{ color: '#0284c7', transform: animating ? 'scale(1.05)' : 'scale(1)' }}
          >
            {lessonsImproved.toLocaleString()} lessons improved
          </div>
        </div>

        {/* School Ratings */}
        <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: '#fae8ff' }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">⭐</span>
            <span className="font-medium text-gray-700">School Culture</span>
          </div>
          <div
            className="text-2xl font-black transition-transform duration-200"
            style={{ color: '#a21caf', transform: animating ? 'scale(1.05)' : 'scale(1)' }}
          >
            +{cultureBoost}% potential
          </div>
        </div>

      </div>

      {/* CTA */}
      <div className="px-6 pb-6">
        <Link
          href="/for-schools/schedule-call"
          className="btn-primary w-full text-center block py-4"
        >
          Schedule a Conversation
        </Link>
      </div>

      {/* Source */}
      <div className="px-6 pb-4">
        <p className="text-xs text-gray-400 text-center">
          Based on TDI Partner Data 2024-25
        </p>
      </div>
    </div>
  );
}
