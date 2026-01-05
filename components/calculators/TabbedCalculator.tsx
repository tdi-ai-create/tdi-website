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
      {/* Main Tabs: Schools vs Teachers */}
      <div className="flex mb-6">
        <button
          onClick={() => setMainTab('schools')}
          className={`flex-1 py-3 px-4 font-bold text-center transition-all ${
            mainTab === 'schools' ? 'border-b-4' : 'opacity-60 hover:opacity-80'
          }`}
          style={{
            borderColor: mainTab === 'schools' ? '#ffba06' : 'transparent',
            color: '#1e2749'
          }}
        >
          For Schools
        </button>
        <button
          onClick={() => setMainTab('teachers')}
          className={`flex-1 py-3 px-4 font-bold text-center transition-all ${
            mainTab === 'teachers' ? 'border-b-4' : 'opacity-60 hover:opacity-80'
          }`}
          style={{
            borderColor: mainTab === 'teachers' ? '#ffba06' : 'transparent',
            color: '#1e2749'
          }}
        >
          For Teachers
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl p-6 shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
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
              Choose what matters most to you right now.
            </p>

            {/* Teacher Sub-Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setTeacherTab('burnout')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                  teacherTab === 'burnout' ? 'text-white' : ''
                }`}
                style={{
                  backgroundColor: teacherTab === 'burnout' ? '#ef4444' : '#f3f4f6',
                  color: teacherTab === 'burnout' ? '#ffffff' : '#1e2749'
                }}
              >
                🔥 Burnout
              </button>
              <button
                onClick={() => setTeacherTab('guilt')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                  teacherTab === 'guilt' ? 'text-white' : ''
                }`}
                style={{
                  backgroundColor: teacherTab === 'guilt' ? '#8b5cf6' : '#f3f4f6',
                  color: teacherTab === 'guilt' ? '#ffffff' : '#1e2749'
                }}
              >
                😅 Guilt-Free
              </button>
              <button
                onClick={() => setTeacherTab('joy')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                  teacherTab === 'joy' ? 'text-white' : ''
                }`}
                style={{
                  backgroundColor: teacherTab === 'joy' ? '#f59e0b' : '#f3f4f6',
                  color: teacherTab === 'joy' ? '#ffffff' : '#1e2749'
                }}
              >
                💛 Joy
              </button>
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
