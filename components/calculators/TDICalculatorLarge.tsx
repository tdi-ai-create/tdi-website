'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export function TDICalculatorLarge() {
  const [teachers, setTeachers] = useState(50);
  const [classSize, setClassSize] = useState(25);
  const [years, setYears] = useState(3);
  const [showCascade, setShowCascade] = useState(true);
  const [animatingValues, setAnimatingValues] = useState(false);

  useEffect(() => {
    setAnimatingValues(true);
    const timer = setTimeout(() => setAnimatingValues(false), 400);
    return () => clearTimeout(timer);
  }, [teachers, classSize, years]);

  // All Calculations
  const coachingTouchpoints = teachers * years * 4;
  const communityConnections = teachers * years * 12;
  const resourcesAccessed = teachers * years * 45;
  
  const weeklyTeamHours = teachers * 5;
  const annualHours = weeklyTeamHours * 52;
  const totalHours = annualHours * years;
  const sundaysBack = Math.round(totalHours / 6);
  const lessonsImproved = teachers * years * 40;
  
  const teachersAtRiskBefore = Math.round(teachers * 0.53);
  const teachersExitingBurnout = Math.round(teachersAtRiskBefore * 0.40);
  const teachersNowThriving = teachers - (teachersAtRiskBefore - teachersExitingBurnout);
  const burnoutDaysAvoided = teachersExitingBurnout * years * 15;
  
  const wouldHaveLeft = Math.max(1, Math.round(teachers * 0.16 * years));
  const teachersRetained = Math.max(1, Math.round(wouldHaveLeft * 0.60));
  const retentionSavings = teachersRetained * 20000;
  const experienceYearsKept = teachersRetained * 8;
  const hiringHoursAvoided = teachersRetained * 40;
  
  const students = teachers * classSize;
  const totalStudentYears = students * years;
  const extraHoursPerStudent = Math.round((annualHours / students) * 10) / 10;
  const smallGroupMinutes = teachers * years * 40 * 45;
  const personalCheckins = students * years * 4;
  
  const studentsGainingGround = Math.round(students * 0.15 * years);
  const studentsHittingBenchmark = Math.round(students * 0.12 * years);
  const collegeReadyBoost = Math.round(students * 0.08 * years);
  const lifetimeEarningsM = Math.round((students * years * 8928) / 1000000 * 10) / 10;
  
  const tdiInvestment = (33600 + Math.max(0, (teachers - 50) * 150)) * years;
  const netImpact = retentionSavings - tdiInvestment;

  const cascadeLevels = [
    {
      icon: "🎯",
      title: "TDI Support",
      color: "#0d9488",
      bgLight: "#f0fdfa",
      mainValue: teachers,
      mainLabel: "teachers empowered",
      metrics: [
        { value: coachingTouchpoints, label: "coaching moments" },
        { value: communityConnections, label: "peer connections" },
        { value: resourcesAccessed, label: "resources accessed" }
      ]
    },
    {
      icon: "⚡",
      title: "Efficiency Unlocked", 
      color: "#0891b2",
      bgLight: "#ecfeff",
      mainValue: totalHours.toLocaleString(),
      mainLabel: "hours reclaimed",
      metrics: [
        { value: weeklyTeamHours, label: "hrs saved/week" },
        { value: sundaysBack, label: "Sundays back" },
        { value: lessonsImproved.toLocaleString(), label: "lessons improved" }
      ]
    },
    {
      icon: "💚",
      title: "Wellbeing Restored",
      color: "#10b981", 
      bgLight: "#ecfdf5",
      mainValue: teachersExitingBurnout,
      mainLabel: "exit burnout zone",
      metrics: [
        { value: teachersNowThriving, label: "now thriving" },
        { value: burnoutDaysAvoided, label: "crisis days avoided" },
        { value: teachersAtRiskBefore, label: "were at-risk" }
      ]
    },
    {
      icon: "🏠",
      title: "Teachers Stay",
      color: "#14b8a6",
      bgLight: "#f0fdfa", 
      mainValue: teachersRetained,
      mainLabel: "teachers retained",
      metrics: [
        { value: `$${(retentionSavings / 1000).toFixed(0)}k`, label: "savings" },
        { value: experienceYearsKept, label: "yrs experience kept" },
        { value: hiringHoursAvoided, label: "hiring hrs avoided" }
      ]
    },
    {
      icon: "🎒",
      title: "Students Reached",
      color: "#06b6d4",
      bgLight: "#ecfeff",
      mainValue: totalStudentYears.toLocaleString(),
      mainLabel: "student-years impacted",
      metrics: [
        { value: extraHoursPerStudent, label: "extra hrs/student" },
        { value: personalCheckins.toLocaleString(), label: "1:1 check-ins" },
        { value: `${Math.round(smallGroupMinutes / 60).toLocaleString()}`, label: "small group hrs" }
      ]
    },
    {
      icon: "📈",
      title: "Achievement Lifted",
      color: "#0ea5e9",
      bgLight: "#f0f9ff",
      mainValue: studentsGainingGround,
      mainLabel: "students gaining ground",
      metrics: [
        { value: studentsHittingBenchmark, label: "hit new benchmarks" },
        { value: collegeReadyBoost, label: "college-ready boost" },
        { value: `$${lifetimeEarningsM}M`, label: "lifetime earnings↑" }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--tdi-charcoal)' }}>
          See Your School's Ripple Effect
        </h1>
        <p className="text-lg" style={{ color: 'var(--tdi-charcoal)', opacity: 0.7 }}>
          Every slider move changes everything below. This is your impact.
        </p>
      </div>

      {/* Calculator Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-8">
        {/* Sliders */}
        <div className="px-8 py-6 border-b border-gray-100" style={{ backgroundColor: 'var(--tdi-peach)' }}>
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
                style={{ background: `linear-gradient(to right, var(--tdi-teal) 0%, var(--tdi-teal) ${(teachers - 10) / 490 * 100}%, #d1d5db ${(teachers - 10) / 490 * 100}%, #d1d5db 100%)` }}
              />
              <div className="text-center mt-3 text-3xl font-black" style={{ color: 'var(--tdi-teal)' }}>{teachers}</div>
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
                style={{ background: `linear-gradient(to right, var(--tdi-teal) 0%, var(--tdi-teal) ${(classSize - 15) / 20 * 100}%, #d1d5db ${(classSize - 15) / 20 * 100}%, #d1d5db 100%)` }}
              />
              <div className="text-center mt-3 text-3xl font-black" style={{ color: 'var(--tdi-teal)' }}>{classSize}</div>
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
                style={{ background: `linear-gradient(to right, var(--tdi-teal) 0%, var(--tdi-teal) ${(years - 1) / 4 * 100}%, #d1d5db ${(years - 1) / 4 * 100}%, #d1d5db 100%)` }}
              />
              <div className="text-center mt-3 text-3xl font-black" style={{ color: 'var(--tdi-teal)' }}>{years}</div>
            </div>
          </div>
        </div>

        {/* 4 Big Numbers */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-5 rounded-xl" style={{ backgroundColor: 'var(--tdi-peach)' }}>
              <div 
                className="text-4xl font-black mb-1 transition-transform duration-200"
                style={{ color: 'var(--tdi-teal)', transform: animatingValues ? 'scale(1.05)' : 'scale(1)' }}
              >
                {totalHours.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 font-medium">Hours Saved</div>
            </div>
            
            <div className="text-center p-5 rounded-xl" style={{ backgroundColor: 'var(--tdi-peach)' }}>
              <div 
                className="text-4xl font-black mb-1 transition-transform duration-200"
                style={{ color: 'var(--tdi-teal)', transform: animatingValues ? 'scale(1.05)' : 'scale(1)' }}
              >
                {teachersRetained}
              </div>
              <div className="text-sm text-gray-600 font-medium">Teachers Stay</div>
            </div>
            
            <div className="text-center p-5 rounded-xl" style={{ backgroundColor: 'var(--tdi-peach)' }}>
              <div 
                className="text-4xl font-black mb-1 transition-transform duration-200"
                style={{ color: 'var(--tdi-teal)', transform: animatingValues ? 'scale(1.05)' : 'scale(1)' }}
              >
                {totalStudentYears.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 font-medium">Students Reached</div>
            </div>
            
            <div className="text-center p-5 rounded-xl" style={{ backgroundColor: netImpact >= 0 ? '#ecfdf5' : '#fef2f2' }}>
              <div 
                className="text-4xl font-black mb-1 transition-transform duration-200"
                style={{ color: netImpact >= 0 ? '#10b981' : '#ef4444', transform: animatingValues ? 'scale(1.05)' : 'scale(1)' }}
              >
                {netImpact >= 0 ? '+' : ''}${(netImpact / 1000).toFixed(0)}k
              </div>
              <div className="text-sm text-gray-600 font-medium">Net ROI</div>
            </div>
          </div>
        </div>

        {/* Investment Bar */}
        <div className="px-8 pb-6">
          <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--tdi-navy)' }}>
            <div className="flex justify-between items-center text-white">
              <div className="text-center">
                <div className="text-xs opacity-60 uppercase tracking-wide">Your Investment</div>
                <div className="text-2xl font-bold">${tdiInvestment.toLocaleString()}</div>
              </div>
              <div className="text-3xl opacity-40">→</div>
              <div className="text-center">
                <div className="text-xs opacity-60 uppercase tracking-wide">Retention Savings Alone</div>
                <div className="text-2xl font-bold" style={{ color: '#6ee7b7' }}>${retentionSavings.toLocaleString()}</div>
              </div>
              <div className="text-3xl opacity-40">=</div>
              <div className="text-center">
                <div className="text-xs opacity-60 uppercase tracking-wide">Net Return</div>
                <div 
                  className="text-3xl font-black transition-transform duration-200"
                  style={{ color: netImpact >= 0 ? '#6ee7b7' : '#fca5a5', transform: animatingValues ? 'scale(1.05)' : 'scale(1)' }}
                >
                  {netImpact >= 0 ? '+' : ''}${netImpact.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="px-8 pb-6">
          <div className="flex gap-4 justify-center">
            <Link 
              href="/for-schools/schedule-call" 
              className="btn-primary px-8 py-4 text-lg"
            >
              Schedule a Conversation
            </Link>
            <button 
              onClick={() => window.print()}
              className="btn-secondary px-8 py-4 text-lg"
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Cascade Toggle */}
      <div className="text-center mb-6">
        <button 
          onClick={() => setShowCascade(!showCascade)}
          className="text-sm font-semibold px-6 py-3 rounded-full transition-all"
          style={{ 
            backgroundColor: showCascade ? 'var(--tdi-teal)' : 'var(--tdi-peach)', 
            color: showCascade ? 'white' : 'var(--tdi-charcoal)' 
          }}
        >
          {showCascade ? '▼ Hide Impact Cascade' : '▶ Show Full Impact Cascade'}
        </button>
      </div>

      {/* Impact Cascade */}
      {showCascade && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">The Ripple Effect</p>
          </div>

          {cascadeLevels.map((level, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < cascadeLevels.length - 1 && (
                <div 
                  className="absolute left-8 top-full w-1 h-4 z-0" 
                  style={{ background: `linear-gradient(180deg, ${level.color}60, ${cascadeLevels[index + 1].color}60)` }} 
                />
              )}
              
              <div
                className="relative z-10 bg-white rounded-xl p-5 shadow-md border border-gray-100 transition-all hover:shadow-lg"
                style={{ borderLeft: `4px solid ${level.color}` }}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: `${level.color}15` }}
                  >
                    {level.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 mb-3">
                      <span className="text-sm font-bold text-gray-500 uppercase">{level.title}</span>
                    </div>
                    
                    <div className="flex items-baseline gap-2 mb-3">
                      <span 
                        className="text-3xl font-black transition-transform duration-200"
                        style={{ color: level.color, transform: animatingValues ? 'scale(1.02)' : 'scale(1)' }}
                      >
                        {level.mainValue}
                      </span>
                      <span className="text-base text-gray-600">{level.mainLabel}</span>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      {level.metrics.map((m, mi) => (
                        <div 
                          key={mi}
                          className="rounded-lg px-3 py-2 border-l-2 transition-all duration-200"
                          style={{ 
                            backgroundColor: `${level.color}08`,
                            borderColor: `${level.color}50`,
                            transform: animatingValues ? 'translateY(-1px)' : 'translateY(0)'
                          }}
                        >
                          <div 
                            className="text-lg font-bold leading-tight"
                            style={{ color: level.color }}
                          >
                            {m.value}
                          </div>
                          <div className="text-xs text-gray-500">{m.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
