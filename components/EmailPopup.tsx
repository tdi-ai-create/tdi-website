'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface EmailPopupProps {
  delay?: number;
}

export function EmailPopup({ delay = 90000 }: EmailPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  // Don't show on conversion pages, admin, hub, or partner pages
  const excludedPaths = ['/get-started', '/tdi-admin', '/hub', '/creator-portal', '/partners'];
  const isExcluded = excludedPaths.some(path => pathname?.startsWith(path));

  const showNudge = useCallback(() => {
    if ((window as any).__tdiPopupActive) return;
    setIsVisible(true);
  }, []);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    // Don't show again for 14 days
    localStorage.setItem('tdi-email-nudge-dismissed', new Date().toISOString());
  }, []);

  useEffect(() => {
    if (isExcluded) return;

    // Check if dismissed within last 14 days
    const dismissedAt = localStorage.getItem('tdi-email-nudge-dismissed');
    if (dismissedAt) {
      const daysSince = (Date.now() - new Date(dismissedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 14) return;
    }

    // Check if already shown this session
    if (sessionStorage.getItem('tdi-email-nudge-shown')) return;

    // Only trigger: 90 seconds on site (no scroll trigger - keep it rare)
    const timer = setTimeout(() => {
      showNudge();
      sessionStorage.setItem('tdi-email-nudge-shown', 'true');
    }, delay);

    return () => clearTimeout(timer);
  }, [isExcluded, delay, showNudge]);

  if (!isVisible || isExcluded) return null;

  return (
    <div
      className="fixed bottom-20 left-4 z-[45] max-w-xs w-full animate-slideUp"
      role="complementary"
      aria-label="Join the email list"
    >
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 relative">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="1" y1="1" x2="9" y2="9" />
            <line x1="9" y1="1" x2="1" y2="9" />
          </svg>
        </button>

        <p className="text-sm font-semibold mb-1" style={{ color: '#1e2749' }}>
          Want strategies that actually work?
        </p>
        <p className="text-xs text-gray-500 mb-3">
          Join 100,000+ educators. Weekly, no spam.
        </p>
        <a
          href="https://teachersdeserveit.substack.com"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleDismiss}
          className="block w-full text-center text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
          style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e5a805')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffba06')}
        >
          Join the list
        </a>
      </div>
    </div>
  );
}

// Keep the export for backwards compatibility but it's no longer used
export function triggerEmailPopup() {}
