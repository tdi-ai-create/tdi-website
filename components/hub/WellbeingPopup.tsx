'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { useHub } from '@/components/hub/HubContext';
import { useTranslation } from '@/lib/hub/useTranslation';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';

/* ------------------------------------------------------------------ */
/*  Wellbeing dimensions                                               */
/* ------------------------------------------------------------------ */

interface WellbeingDimension {
  key: string;
  prompt: string;
}

const DIMENSIONS: WellbeingDimension[] = [
  { key: 'belonging', prompt: 'Right now, I feel like I belong in my school community.' },
  { key: 'purpose', prompt: 'Today, I feel connected to why I became an educator.' },
  { key: 'energy', prompt: 'My energy level right now feels...' },
  { key: 'connection', prompt: 'I feel supported by the people around me.' },
  { key: 'growth', prompt: 'I am learning and growing in my practice.' },
];

/** Colored dots for the 1-5 scale */
const SCORE_COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#16A34A'];

/** Random interval between 5-20 minutes in ms */
function randomInterval(): number {
  return 300000 + Math.floor(Math.random() * 900000);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function WellbeingPopup() {
  const { user } = useHub();
  const { tUI } = useTranslation();

  const [visible, setVisible] = useState(false);
  const [dimension, setDimension] = useState<WellbeingDimension>(DIMENSIONS[0]);
  const [thanking, setThanking] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dimensionIndexRef = useRef(0);

  /* ---------- pick next dimension (rotate) ---------- */

  const pickNextDimension = useCallback(() => {
    const idx = dimensionIndexRef.current % DIMENSIONS.length;
    dimensionIndexRef.current = idx + 1;
    setDimension(DIMENSIONS[idx]);
  }, []);

  /* ---------- schedule next popup ---------- */

  const scheduleNext = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      pickNextDimension();
      setThanking(false);
      setVisible(true);
    }, randomInterval());
  }, [pickNextDimension]);

  /* ---------- mount / unmount ---------- */

  useEffect(() => {
    if (!user?.id) return;
    scheduleNext();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user?.id, scheduleNext]);

  /* ---------- handle score ---------- */

  const handleScore = useCallback(
    async (score: number) => {
      setThanking(true);

      // Log to hub_activity_log
      if (user?.id) {
        try {
          const supabase = getSupabase();
          await supabase.from('hub_activity_log').insert({
            user_id: user.id,
            action: 'wellbeing_check',
            metadata: {
              dimension: dimension.key,
              score,
              responded_at: new Date().toISOString(),
            },
          });
        } catch {
          // Silent fail -- wellbeing checks are non-critical
        }
      }

      // Show thank you briefly, then dismiss
      setTimeout(() => {
        setVisible(false);
        setThanking(false);
        scheduleNext();
      }, 1500);
    },
    [user?.id, dimension, scheduleNext],
  );

  /* ---------- dismiss without logging ---------- */

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setThanking(false);
    scheduleNext();
  }, [scheduleNext]);

  /* ---------- render ---------- */

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 280,
        background: 'white',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(30, 39, 73, 0.12)',
        zIndex: 10000,
        padding: '20px 20px 16px',
        fontFamily: "'DM Sans', sans-serif",
        animation: 'tdi-wellbeing-slidein 0.3s ease-out',
      }}
    >
      {thanking ? (
        <p
          style={{
            textAlign: 'center',
            fontSize: 15,
            fontWeight: 600,
            color: '#1e2749',
            margin: 0,
            padding: '12px 0',
          }}
        >
          {tUI('Thank you')}
        </p>
      ) : (
        <>
          {/* Close button */}
          <button
            onClick={handleDismiss}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9CA3AF',
              padding: 4,
              lineHeight: 1,
            }}
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>

          {/* Prompt */}
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.5,
              color: '#1e2749',
              margin: '0 0 16px',
              paddingRight: 20,
            }}
          >
            {tUI(dimension.prompt)}
          </p>

          {/* Score dots */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {SCORE_COLORS.map((color, i) => (
              <button
                key={i}
                onClick={() => handleScore(i + 1)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: color,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.transform = 'scale(1.15)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.transform = 'scale(1)';
                }}
                aria-label={`Score ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Not now link */}
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button
              onClick={handleDismiss}
              style={{
                background: 'none',
                border: 'none',
                color: '#9CA3AF',
                fontSize: 11,
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {tUI('Not now')}
            </button>
          </div>
        </>
      )}

      <style>{`
        @keyframes tdi-wellbeing-slidein {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
