'use client';

import React, { useState, useEffect } from 'react';

const SURVEY_DEADLINE = new Date('2026-03-31T23:59:59');
const MAX_DISMISSALS = 3;

export function SurveyPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    // Check if we should show the popup
    const now = new Date();

    // Don't show after deadline
    if (now > SURVEY_DEADLINE) {
      return;
    }

    // Calculate days left
    const timeDiff = SURVEY_DEADLINE.getTime() - now.getTime();
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    setDaysLeft(days);

    // Check localStorage
    const completed = localStorage.getItem('tdi_survey_completed') === 'true';
    if (completed) {
      return;
    }

    const dismissCount = parseInt(localStorage.getItem('tdi_survey_dismissed_count') || '0', 10);
    if (dismissCount >= MAX_DISMISSALS) {
      return;
    }

    // Show popup after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    const currentCount = parseInt(localStorage.getItem('tdi_survey_dismissed_count') || '0', 10);
    localStorage.setItem('tdi_survey_dismissed_count', String(currentCount + 1));
    setIsVisible(false);
  };

  const handleTakeSurvey = () => {
    localStorage.setItem('tdi_survey_completed', 'true');
    window.open('/creator-survey', '_blank');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleDismiss}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#1D9E75] text-white px-6 py-5 relative">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="text-xs uppercase tracking-wider text-white/70 mb-1">Creator Feedback</p>
          <h2 className="text-xl font-bold">Share your experience with us</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-slate-600 leading-relaxed mb-4">
            We want to hear what&apos;s working and what&apos;s not &mdash; from application to launch. This 5-minute survey helps us improve the Creator Program for you and every educator after you.
          </p>

          {/* Deadline badge */}
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">Deadline: March 31, 2026</span>
            <span className="text-amber-600">|</span>
            <span>{daysLeft} days left</span>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleTakeSurvey}
              className="w-full px-4 py-3 bg-[#1D9E75] text-white font-medium rounded-lg hover:bg-[#178a64] transition-colors"
            >
              Take the survey
            </button>
            <button
              onClick={handleDismiss}
              className="w-full px-4 py-3 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Remind me later
            </button>
          </div>

          {/* Fine print */}
          <p className="text-xs text-slate-400 text-center mt-4">
            Dismissing will remind you again next time you log in (up to 3 times).
          </p>
        </div>
      </div>
    </div>
  );
}
