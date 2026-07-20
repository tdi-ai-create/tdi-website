'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useHub } from '@/components/hub/HubContext';
import { useTranslation } from '@/lib/hub/useTranslation';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import { TOUR_STOPS } from '@/lib/tour-copy';
import { usePopupQueue } from '@/lib/hub/PopupQueueContext';

const POPUP_ID = 'onboarding-tour';
const POPUP_PRIORITY = 100;

const TOUR_STORAGE_KEY = 'tdi-hub-tour-step';

interface OnboardingTourProps {
  onComplete: (stopsSeen: number) => void;
  resumeFromStep?: number;
}

/** All features shown in a single wide scrollable card */
const ALL_FEATURES = TOUR_STOPS.map(stop => ({ title: stop.title, description: stop.description }));

const FEATURE_ICONS: Record<string, string> = {
  'Quick Wins': 'M13 10V3L4 14h7v7l9-11h-7z',
  'Community': 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  'Effort Level Filter': 'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
  'Moment Mode': 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  'Meet Desi': 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  'Field Notes': 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  'The Gift': 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7',
  'Vibe Check': 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  'Transformation Tracker': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  'Favorites': 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  'Multilingual Support': 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129',
  'Certificates': 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
};

const FEATURE_COLORS = ['#E8B84B', '#2A9D8F', '#F97316', '#EC4899', '#8B5CF6', '#2563EB', '#10B981', '#EF4444', '#0891B2', '#D97706', '#6366F1', '#14B8A6'];

export default function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const { user } = useHub();
  const { tUI } = useTranslation();
  const { enqueue, dequeue, isActive } = usePopupQueue();
  const [dismissed, setDismissed] = useState(false);
  const hasLoggedRef = useRef(false);

  // Register with popup queue on mount
  useEffect(() => {
    enqueue(POPUP_ID, POPUP_PRIORITY);
    return () => { dequeue(POPUP_ID); };
  }, [enqueue, dequeue]);

  const logCompletion = useCallback(async () => {
    if (!user?.id || hasLoggedRef.current) return;
    hasLoggedRef.current = true;
    const supabase = getSupabase();
    await supabase.from('hub_activity_log').insert({
      user_id: user.id,
      action: 'tour_completed',
      metadata: { type: 'feature_card' },
    });
    try { localStorage.removeItem(TOUR_STORAGE_KEY); } catch {}
  }, [user?.id]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    dequeue(POPUP_ID);
    logCompletion();
    onComplete(ALL_FEATURES.length);
  }, [logCompletion, onComplete, dequeue]);

  if (dismissed) return null;
  if (!isActive(POPUP_ID)) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000010,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(30, 39, 73, 0.85)',
        animation: 'tdi-tour-fadein 0.4s ease-out',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 24,
          maxWidth: 740,
          width: '94%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(30, 39, 73, 0.35)',
          animation: 'tdi-tour-scalein 0.4s ease-out',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '28px 32px 0', textAlign: 'center' }}>
          <p
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontSize: 24,
              fontWeight: 700,
              color: '#1e2749',
              margin: '0 0 6px',
            }}
          >
            {tUI("Here's what you can do in the Hub")}
          </p>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: '#9CA3AF',
              margin: '0 0 24px',
            }}
          >
            {tUI('Scroll through or jump straight in. You can always find these in the nav.')}
          </p>
        </div>

        {/* Scrollable feature grid */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 28px 8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {ALL_FEATURES.map((feature, i) => {
              const iconPath = FEATURE_ICONS[feature.title];
              const color = FEATURE_COLORS[i % FEATURE_COLORS.length];
              return (
                <div
                  key={i}
                  style={{
                    padding: 18,
                    borderRadius: 16,
                    backgroundColor: '#FAFBFC',
                    border: '1px solid #F3F4F6',
                    display: 'flex',
                    gap: 14,
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 11,
                      backgroundColor: `${color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {iconPath ? (
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d={iconPath} />
                      </svg>
                    ) : (
                      <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: color, opacity: 0.3 }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#1e2749',
                        margin: '0 0 3px',
                      }}
                    >
                      {tUI(feature.title)}
                    </p>
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 12,
                        color: '#6B7280',
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {tUI(feature.description)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 28px 24px', textAlign: 'center' }}>
          <button
            onClick={handleDismiss}
            style={{
              background: '#E8B84B',
              color: '#1e2749',
              border: 'none',
              borderRadius: 12,
              padding: '14px 40px',
              fontSize: 15,
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              cursor: 'pointer',
              width: '100%',
              maxWidth: 340,
            }}
          >
            {tUI("Got it -- let me explore")}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes tdi-tour-fadein {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes tdi-tour-scalein {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
