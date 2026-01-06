'use client';

import { useState, useEffect } from 'react';
import { AdminCalculator } from './AdminCalculator';
import { BudgetImpactCalculator } from './BudgetImpactCalculator';
import { BurnoutCalculator } from './BurnoutCalculator';
import { GuiltFreeCalculator } from './GuiltFreeCalculator';
import { JoyCalculator } from './JoyCalculator';

export function TabbedCalculator() {
  const [mainTab, setMainTab] = useState<'schools' | 'teachers'>('schools');
  const [adminTab, setAdminTab] = useState<'success' | 'budget'>('budget');
  const [teacherTab, setTeacherTab] = useState<'burnout' | 'guilt' | 'joy'>('burnout');
  const [hasEngaged, setHasEngaged] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Trigger popup 2 seconds after user engages with calculator
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

  // Listen for slider changes from child calculators
  useEffect(() => {
    const handleSliderChange = () => setHasEngaged(true);
    window.addEventListener('calculator-engaged', handleSliderChange);
    return () => window.removeEventListener('calculator-engaged', handleSliderChange);
  }, []);

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

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* White Card Container */}
      <div className="bg-white rounded-xl p-6 shadow-lg" style={{ border: '1px solid #e5e7eb' }}>

        {/* Main Tabs: Schools vs Teachers */}
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

        {/* SCHOOLS CONTENT */}
        {mainTab === 'schools' && (
          <>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#1e2749' }}>
              What's Possible for Your School
            </h3>
            <p className="text-sm mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
              Choose what matters most to your leadership team.
            </p>

            {/* Admin Assessment Toggle */}
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#1e2749' }}>
                Select Your Focus
              </p>
              <div className="p-1 rounded-xl" style={{ backgroundColor: '#e5e7eb' }}>
                <div className="flex gap-1">
                  <button
                    onClick={() => setAdminTab('success')}
                    className="flex-1 py-3 px-2 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: adminTab === 'success' ? '#ffffff' : 'transparent',
                      color: '#1e2749',
                      boxShadow: adminTab === 'success' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    <span className="block font-bold">Student Success</span>
                    <span className="block text-xs font-normal" style={{ opacity: 0.6 }}>Academic outcomes</span>
                  </button>
                  <button
                    onClick={() => setAdminTab('budget')}
                    className="flex-1 py-3 px-2 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: adminTab === 'budget' ? '#ffffff' : 'transparent',
                      color: '#1e2749',
                      boxShadow: adminTab === 'budget' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    <span className="block font-bold">Budget Impact</span>
                    <span className="block text-xs font-normal" style={{ opacity: 0.6 }}>PD efficiency</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Admin Calculator Content */}
            {adminTab === 'success' && <AdminCalculator />}
            {adminTab === 'budget' && <BudgetImpactCalculator />}
          </>
        )}

        {/* TEACHERS CONTENT */}
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
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#1e2749' }}>
                  You're in!
                </h3>
                <p style={{ opacity: 0.7 }}>
                  Welcome to the movement.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold mb-4 text-center" style={{ color: '#1e2749' }}>
                  Want to see these results in your school?
                </h3>

                <p className="text-center mb-6" style={{ opacity: 0.7 }}>
                  Get practical strategies delivered to your inbox. Join 87,000+ educators.
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
                    style={{ backgroundColor: '#1e2749', color: 'white' }}
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
    </div>
  );
}
