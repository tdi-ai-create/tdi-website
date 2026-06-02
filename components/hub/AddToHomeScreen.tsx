'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const DISMISSED_KEY = 'tdi-hub-a2hs-dismissed';

/**
 * Subtle prompt to add the Hub to the home screen.
 * Shows once after 3+ visits, dismissible, remembers dismissal.
 */
export default function AddToHomeScreen() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed
    if (localStorage.getItem(DISMISSED_KEY)) return;

    // Don't show if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Track visit count
    const visits = parseInt(localStorage.getItem('tdi-hub-visits') || '0', 10) + 1;
    localStorage.setItem('tdi-hub-visits', String(visits));

    // Show after 3rd visit
    if (visits < 3) return;

    // Detect iOS
    const ua = navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(iOS);

    // Small delay so it doesn't flash immediately
    const timer = setTimeout(() => setShow(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISSED_KEY, 'true');
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        maxWidth: 420,
        width: '92%',
        background: '#1e2749',
        borderRadius: 16,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        boxShadow: '0 12px 40px rgba(30, 39, 73, 0.4)',
        animation: 'a2hs-slide-up 0.4s ease-out',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: '#E8B84B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#1e2749" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: 'white', margin: '0 0 2px' }}>
          Add the Hub to your home screen
        </p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.4 }}>
          {isIOS
            ? 'Tap the share button, then "Add to Home Screen"'
            : 'Quick access between classes -- no app store needed'}
        </p>
      </div>

      {/* Dismiss */}
      <button
        onClick={dismiss}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4, flexShrink: 0 }}
        aria-label="Dismiss"
      >
        <X size={18} />
      </button>

      <style>{`
        @keyframes a2hs-slide-up {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
