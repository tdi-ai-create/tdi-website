'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from '@/lib/hub/useTranslation';
import { usePopupQueue } from '@/lib/hub/PopupQueueContext';

const DISMISSED_KEY = 'tdi-hub-a2hs-dismissed';
const POPUP_ID = 'add-to-homescreen';
const POPUP_PRIORITY = 20;

/**
 * Subtle prompt to add the Hub to the home screen.
 * Shows once after 3+ visits, dismissible, remembers dismissal.
 * On supported browsers, triggers the native install prompt.
 * On iOS, shows share instructions.
 */
export default function AddToHomeScreen() {
  const { tUI } = useTranslation();
  const { enqueue, dequeue, isActive } = usePopupQueue();
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

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

    // Listen for the browser install prompt (Chrome/Edge/Android)
    const handlePrompt = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);

    // Small delay so it doesn't flash immediately
    const timer = setTimeout(() => {
      setShow(true);
      enqueue(POPUP_ID, POPUP_PRIORITY);
    }, 2000);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handlePrompt);
    };
  }, [enqueue]);

  const dismiss = () => {
    setShow(false);
    dequeue(POPUP_ID);
    localStorage.setItem(DISMISSED_KEY, 'true');
  };

  const handleInstall = async () => {
    if (deferredPromptRef.current) {
      deferredPromptRef.current.prompt();
      const result = await deferredPromptRef.current.userChoice;
      if (result.outcome === 'accepted') {
        dismiss();
      }
      deferredPromptRef.current = null;
    }
  };

  if (!show || !isActive(POPUP_ID)) return null;

  const hasNativePrompt = !!deferredPromptRef.current;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
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
          {tUI('Add the Hub to your home screen')}
        </p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.4 }}>
          {isIOS
            ? tUI('Tap the share button, then "Add to Home Screen"')
            : tUI('Quick access between classes, no app store needed')}
        </p>
      </div>

      {/* Install button (non-iOS browsers with native prompt) */}
      {hasNativePrompt && (
        <button
          onClick={handleInstall}
          style={{
            background: '#E8B84B',
            border: 'none',
            borderRadius: 10,
            padding: '8px 16px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 700,
            color: '#1e2749',
            cursor: 'pointer',
            flexShrink: 0,
            letterSpacing: '0.01em',
          }}
        >
          {tUI('Add')}
        </button>
      )}

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

// Type for the beforeinstallprompt event (not in standard TS types)
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
