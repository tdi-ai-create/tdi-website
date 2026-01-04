'use client';

import { useState, useEffect } from 'react';

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the bar
    const dismissed = localStorage.getItem('tdi-announcement-dismissed');
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('tdi-announcement-dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div
      className="w-full py-2 px-4 flex items-center justify-center relative"
      style={{ backgroundColor: '#1e2749' }}
    >
      <p className="text-sm text-center" style={{ color: '#ffffff' }}>
        Already a member?{' '}
        <a
          href="https://tdi.thinkific.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-medium hover:opacity-80 transition-opacity"
          style={{ color: '#ffba06' }}
        >
          Go to Learning Hub →
        </a>
      </p>
      <button
        onClick={handleDismiss}
        className="absolute right-4 p-1 hover:opacity-70 transition-opacity"
        aria-label="Dismiss announcement"
        style={{ color: '#ffffff' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
