'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { isPopupBlocked } from '@/lib/popup-policy';

export function SubstackPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const isExcluded = isPopupBlocked(pathname);

  const showPopup = useCallback(() => {
    setIsVisible(true);
  }, []);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    localStorage.setItem('tdi-substack-popup-dismissed', new Date().toISOString());
  }, []);

  useEffect(() => {
    if (isExcluded) return;

    // Someone who said no is not asked again next week
    const dismissedAt = localStorage.getItem('tdi-substack-popup-dismissed');
    if (dismissedAt) {
      const daysSince = (Date.now() - new Date(dismissedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 90) return;
    }

    // Check if already shown this session
    if (sessionStorage.getItem('tdi-substack-popup-shown')) return;

    let triggered = false;

    // Scroll trigger. 70% means they read most of it, so this is not an interruption.
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 70 && !triggered) {
        triggered = true;
        showPopup();
        window.removeEventListener('scroll', handleScroll);
      }
    };

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
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-4 pointer-events-none"
      role="region"
      aria-label="Join the TDI email list"
    >
      <div
        className="pointer-events-auto w-full animate-slideUp"
        style={{
          maxWidth: 520,
          position: 'relative',
          background: '#ffffff',
          border: '1px solid #E2E5EA',
          borderTop: '4px solid #ffba06',
          borderRadius: 14,
          boxShadow: '0 -6px 34px rgba(30,39,73,0.18)',
          padding: '18px 20px 16px',
        }}
      >
        <button
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            top: 10,
            right: 12,
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 999,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#8A93A3',
          }}
          aria-label="Dismiss"
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="1" y1="1" x2="13" y2="13" />
            <line x1="13" y1="1" x2="1" y2="13" />
          </svg>
        </button>

        <p style={{ fontSize: 15, fontWeight: 700, color: '#1e2749', margin: '0 0 3px', paddingRight: 28 }}>
          Three practical strategies a week.
        </p>
        <p style={{ fontSize: 13.5, color: '#6B7280', margin: '0 0 12px', lineHeight: 1.5 }}>
          No theory, no fluff. Join 100,000+ educators.
        </p>

        <form
          action="https://raehughart.substack.com/api/v1/free?nojs=true"
          method="post"
          target="_blank"
          style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
          onSubmit={() => {
            setTimeout(() => handleDismiss(), 1000);
          }}
        >
          <input
            type="email"
            name="email"
            placeholder="Your email address"
            required
            style={{
              flex: '1 1 190px',
              minWidth: 0,
              padding: '10px 13px',
              borderRadius: 9,
              border: '1px solid #D8DCE3',
              fontSize: 14,
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              flex: '0 0 auto',
              padding: '10px 20px',
              borderRadius: 9,
              fontWeight: 700,
              fontSize: 14,
              backgroundColor: '#ffba06',
              color: '#1e2749',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
}
