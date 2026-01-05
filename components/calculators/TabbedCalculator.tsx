'use client';

import { useState } from 'react';
import { AdminCalculator } from './AdminCalculator';
import { BurnoutCalculator } from './BurnoutCalculator';
import { GuiltFreeCalculator } from './GuiltFreeCalculator';
import { JoyCalculator } from './JoyCalculator';

export function TabbedCalculator() {
  const [mainTab, setMainTab] = useState<'schools' | 'teachers'>('schools');
  const [teacherTab, setTeacherTab] = useState<'burnout' | 'guilt' | 'joy'>('burnout');

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* White Card Container */}
      <div className="bg-white rounded-xl p-6 shadow-lg" style={{ border: '1px solid #e5e7eb' }}>

        {/* Main Tabs: Schools vs Teachers - NOW INSIDE THE CARD */}
        <div className="flex gap-2 mb-6 p-1 rounded-lg" style={{ backgroundColor: '#e5e7eb' }}>
          <button
            onClick={() => setMainTab('schools')}
            className="flex-1 py-3 px-4 font-bold text-center rounded-md transition-all"
            style={{
              backgroundColor: mainTab === 'schools' ? '#1e2749' : 'transparent',
              color: mainTab === 'schools' ? '#ffffff' : '#1e2749'
            }}
          >
            For Schools
          </button>
          <button
            onClick={() => setMainTab('teachers')}
            className="flex-1 py-3 px-4 font-bold text-center rounded-md transition-all"
            style={{
              backgroundColor: mainTab === 'teachers' ? '#1e2749' : 'transparent',
              color: mainTab === 'teachers' ? '#ffffff' : '#1e2749'
            }}
          >
            For Teachers
          </button>
        </div>

        {/* Content */}
        {mainTab === 'schools' && (
          <>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#1e2749' }}>
              What's Possible for Your School
            </h3>
            <p className="text-sm mb-6" style={{ color: '#1e2749', opacity: 0.7 }}>
              See the potential impact of partnering with TDI.
            </p>
            <AdminCalculator />
          </>
        )}

        {mainTab === 'teachers' && (
          <>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#1e2749' }}>
              What Could Change for You
            </h3>
            <p className="text-sm mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
              Choose an assessment to see your personalized results.
            </p>

            {/* Teacher Assessment Toggle */}
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#1e2749' }}>
                Select Your Assessment
              </p>
              <div className="p-1 rounded-xl" style={{ backgroundColor: '#e5e7eb' }}>
                <div className="flex gap-1">
                  <button
                    onClick={() => setTeacherTab('burnout')}
                    className="flex-1 py-3 px-2 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: teacherTab === 'burnout' ? '#ffffff' : 'transparent',
                      color: '#1e2749',
                      boxShadow: teacherTab === 'burnout' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    <span className="block font-bold">Burnout</span>
                    <span className="block text-xs font-normal" style={{ opacity: 0.6 }}>Stress levels</span>
                  </button>
                  <button
                    onClick={() => setTeacherTab('guilt')}
                    className="flex-1 py-3 px-2 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: teacherTab === 'guilt' ? '#ffffff' : 'transparent',
                      color: '#1e2749',
                      boxShadow: teacherTab === 'guilt' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    <span className="block font-bold">Guilt-Free</span>
                    <span className="block text-xs font-normal" style={{ opacity: 0.6 }}>Work-life balance</span>
                  </button>
                  <button
                    onClick={() => setTeacherTab('joy')}
                    className="flex-1 py-3 px-2 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: teacherTab === 'joy' ? '#ffffff' : 'transparent',
                      color: '#1e2749',
                      boxShadow: teacherTab === 'joy' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    <span className="block font-bold">Joy</span>
                    <span className="block text-xs font-normal" style={{ opacity: 0.6 }}>Teaching passion</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Teacher Calculator Content */}
            {teacherTab === 'burnout' && <BurnoutCalculator />}
            {teacherTab === 'guilt' && <GuiltFreeCalculator />}
            {teacherTab === 'joy' && <JoyCalculator />}
          </>
        )}
      </div>
    </div>
  );
}
