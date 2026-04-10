'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export function SubstackPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  // Don't show on get-started (they're already converting) or admin/hub pages
  const excludedPaths = ['/get-started', '/tdi-admin', '/hub', '/creator-portal', '/partners'];
  const isExcluded = excludedPaths.some(path => pathname?.startsWith(path));

  const showPopup = useCallback(() => {
    // Don't show if another popup is active
    if ((window as any).__tdiPopupActive) return;
    (window as any).__tdiPopupActive = true;
    setIsVisible(true);
  }, []);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    (window as any).__tdiPopupActive = false;
    localStorage.setItem('tdi-substack-popup-dismissed', new Date().toISOString());
  }, []);

  useEffect(() => {
    if (isExcluded) return;

    // Check if dismissed within last 7 days
    const dismissedAt = localStorage.getItem('tdi-substack-popup-dismissed');
    if (dismissedAt) {
      const daysSince = (Date.now() - new Date(dismissedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }

    // Check if already shown this session
    if (sessionStorage.getItem('tdi-substack-popup-shown')) return;

    let triggered = false;

    // Scroll trigger - 60% scroll
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 60 && !triggered) {
        triggered = true;
        showPopup();
        window.removeEventListener('scroll', handleScroll);
      }
    };

    // Time trigger - 45 seconds
    const timer = setTimeout(() => {
      if (!triggered) {
        triggered = true;
        showPopup();
        window.removeEventListener('scroll', handleScroll);
      }
    }, 45000);

    // Exit intent (desktop only)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 10 && !triggered) {
        triggered = true;
        showPopup();
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mouseleave', handleMouseLeave);

    sessionStorage.setItem('tdi-substack-popup-shown', 'true');

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timer);
    };
  }, [isExcluded, showPopup]);

  // Close on Escape
  useEffect(() => {
    if (!isVisible) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleDismiss();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, handleDismiss]);

  if (!isVisible || isExcluded) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) handleDismiss(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Join the TDI email list"
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close popup"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="1" y1="1" x2="13" y2="13" />
            <line x1="13" y1="1" x2="1" y2="13" />
          </svg>
        </button>

        {/* Content */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#1e2749' }}>
            Stay in the Loop
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Join 87,000+ educators getting strategies that actually work - delivered weekly.
          </p>

          {/* Substack embed */}
          <iframe
            src="https://teachersdeserveit.substack.com/embed"
            width="100%"
            height="150"
            style={{ border: 'none', background: 'transparent' }}
            frameBorder="0"
            scrolling="no"
          />

          {/* Dismiss link */}
          <button
            onClick={handleDismiss}
            className="mt-4 text-sm text-gray-400 hover:text-gray-600 hover:underline transition-colors"
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
