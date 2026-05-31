'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { useHub } from '@/components/hub/HubContext';
import { useTranslation } from '@/lib/hub/useTranslation';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import {
  TOUR_STOPS,
  PROGRESSIVE_DISCLOSURE_PROMPT,
  CONTINUATION_PROMPTS,
} from '@/lib/tour-copy';

const TOUR_STORAGE_KEY = 'tdi-hub-tour-step';

interface OnboardingTourProps {
  onComplete: (stopsSeen: number) => void;
  resumeFromStep?: number;
}

/* ------------------------------------------------------------------ */
/*  Tour step definition                                               */
/* ------------------------------------------------------------------ */

interface TourStep {
  title: string;
  body: string;
  /** CSS selector for the element to highlight (null = centered popover) */
  selector: string | null;
}

const MANDATORY_COUNT = 5;

/**
 * 12 stops matching tour-copy.ts exactly, in the approved order.
 * Selectors target nav-bar or dashboard elements on /hub.
 * null = centered popover (element not on dashboard).
 */
const TOUR_STEPS_CONFIG: TourStep[] = [
  // 1. Quick Wins -- points to sidebar explorer section
  {
    title: TOUR_STOPS[0].title,
    body: TOUR_STOPS[0].description,
    selector: '[data-tour="quick-wins"]',
  },
  // 2. Community
  {
    title: TOUR_STOPS[1].title,
    body: TOUR_STOPS[1].description,
    selector: '[data-tour="community-highlights"]',
  },
  // 3. The LIFT Filter
  {
    title: TOUR_STOPS[2].title,
    body: TOUR_STOPS[2].description,
    selector: '[data-tour="lift-filter"]',
  },
  // 4. Moment Mode
  {
    title: TOUR_STOPS[3].title,
    body: TOUR_STOPS[3].description,
    selector: '[data-tour="moment-mode"]',
  },
  // 5. Meet Desi
  {
    title: TOUR_STOPS[4].title,
    body: TOUR_STOPS[4].description,
    selector: '[data-tour="desi-chat"]',
  },
  // --- progressive disclosure break after stop 5 ---
  // 6. Field Notes -- points to celebration card on dashboard
  {
    title: TOUR_STOPS[5].title,
    body: TOUR_STOPS[5].description,
    selector: '[data-tour="field-notes"]',
  },
  // 7. Vibe Check (Gift Element deferred to post-launch)
  {
    title: TOUR_STOPS[7].title,
    body: TOUR_STOPS[7].description,
    selector: '[data-tour="vibe-check"]',
  },
  // 9. Transformation Tracker
  {
    title: TOUR_STOPS[8].title,
    body: TOUR_STOPS[8].description,
    selector: '[data-tour="transformation-tracker"]',
  },
  // 10. Favorites
  {
    title: TOUR_STOPS[9].title,
    body: TOUR_STOPS[9].description,
    selector: '[data-tour="favorites"]',
  },
  // 11. Multilingual Support
  {
    title: TOUR_STOPS[10].title,
    body: TOUR_STOPS[10].description,
    selector: '[data-tour="language-toggle"]',
  },
  // Certificates removed -- same card as Transformation Tracker
];

const TOTAL_STEPS = TOUR_STEPS_CONFIG.length;

/* ------------------------------------------------------------------ */
/*  Positioning helpers                                                */
/* ------------------------------------------------------------------ */

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

const PAD = 8;
const RADIUS = 8;
const TOOLTIP_GAP = 12;
const TOOLTIP_MAX_W = 320;

type Side = 'top' | 'bottom' | 'left' | 'right';

function bestSide(rect: Rect): Side {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const spaceBelow = vh - rect.bottom;
  const spaceAbove = rect.top;
  const spaceRight = vw - rect.right;
  const spaceLeft = rect.left;

  if (spaceBelow >= 200) return 'bottom';
  if (spaceAbove >= 200) return 'top';
  if (spaceRight >= TOOLTIP_MAX_W + 40) return 'right';
  if (spaceLeft >= TOOLTIP_MAX_W + 40) return 'left';
  return spaceBelow >= spaceAbove ? 'bottom' : 'top';
}

function tooltipPosition(rect: Rect, side: Side): { top: number; left: number } {
  switch (side) {
    case 'bottom':
      return {
        top: rect.bottom + PAD + TOOLTIP_GAP,
        left: Math.max(16, Math.min(rect.left + rect.width / 2 - TOOLTIP_MAX_W / 2, window.innerWidth - TOOLTIP_MAX_W - 16)),
      };
    case 'top':
      return {
        top: rect.top - PAD - TOOLTIP_GAP,
        left: Math.max(16, Math.min(rect.left + rect.width / 2 - TOOLTIP_MAX_W / 2, window.innerWidth - TOOLTIP_MAX_W - 16)),
      };
    case 'right':
      return {
        top: Math.max(16, rect.top + rect.height / 2 - 80),
        left: rect.right + PAD + TOOLTIP_GAP,
      };
    case 'left':
      return {
        top: Math.max(16, rect.top + rect.height / 2 - 80),
        left: rect.left - PAD - TOOLTIP_GAP - TOOLTIP_MAX_W,
      };
  }
}

/* ------------------------------------------------------------------ */
/*  Arrow SVG                                                          */
/* ------------------------------------------------------------------ */

function Arrow({ side }: { side: Side }) {
  const size = 10;
  const style: React.CSSProperties = { position: 'absolute', width: size * 2, height: size };

  switch (side) {
    case 'bottom':
      return (
        <svg style={{ ...style, top: -size + 1, left: '50%', transform: 'translateX(-50%)' }} viewBox="0 0 20 10">
          <polygon points="10,0 20,10 0,10" fill="white" />
        </svg>
      );
    case 'top':
      return (
        <svg style={{ ...style, bottom: -size + 1, left: '50%', transform: 'translateX(-50%) rotate(180deg)' }} viewBox="0 0 20 10">
          <polygon points="10,0 20,10 0,10" fill="white" />
        </svg>
      );
    case 'right':
      return (
        <svg style={{ ...style, left: -size + 1, top: '30%', width: size, height: size * 2, transform: 'rotate(-90deg)' }} viewBox="0 0 20 10">
          <polygon points="10,0 20,10 0,10" fill="white" />
        </svg>
      );
    case 'left':
      return (
        <svg style={{ ...style, right: -size + 1, top: '30%', width: size, height: size * 2, transform: 'rotate(90deg)' }} viewBox="0 0 20 10">
          <polygon points="10,0 20,10 0,10" fill="white" />
        </svg>
      );
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function OnboardingTour({ onComplete, resumeFromStep }: OnboardingTourProps) {
  const { user } = useHub();
  const { tUI } = useTranslation();

  const initialStep = resumeFromStep ?? 0;
  const [stepIndex, setStepIndex] = useState(initialStep);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [showDisclosure, setShowDisclosure] = useState(false);
  const [showContinuation, setShowContinuation] = useState<number | null>(null);
  const [active, setActive] = useState(true);

  // Transition state for smooth step changes
  const [transitioning, setTransitioning] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(true);

  const hasLoggedRef = useRef(false);

  const step = TOUR_STEPS_CONFIG[stepIndex] as TourStep | undefined;

  /* ---------- persist progress to localStorage ---------- */

  useEffect(() => {
    if (active) {
      try { localStorage.setItem(TOUR_STORAGE_KEY, String(stepIndex)); } catch {}
    }
  }, [stepIndex, active]);

  /* ---------- log completion ---------- */

  const logCompletion = useCallback(
    async (count: number) => {
      if (!user?.id || hasLoggedRef.current) return;
      hasLoggedRef.current = true;
      const supabase = getSupabase();
      await supabase.from('hub_activity_log').insert({
        user_id: user.id,
        action: 'tour_completed',
        metadata: { stops_seen: count },
      });
      // Clear saved progress once fully complete
      if (count >= TOTAL_STEPS) {
        try { localStorage.removeItem(TOUR_STORAGE_KEY); } catch {}
      }
    },
    [user?.id],
  );

  const prevTargetElRef = useRef<Element | null>(null);

  const endTour = useCallback(
    (count: number) => {
      // Clean up any elevated target element
      if (prevTargetElRef.current) {
        (prevTargetElRef.current as HTMLElement).style.removeProperty('z-index');
        (prevTargetElRef.current as HTMLElement).style.removeProperty('position');
        prevTargetElRef.current = null;
      }
      setActive(false);
      logCompletion(count);
      onComplete(count);
    },
    [logCompletion, onComplete],
  );

  /* ---------- find & measure target ---------- */

  const measureTarget = useCallback(() => {
    // Reset previous target's z-index
    if (prevTargetElRef.current) {
      (prevTargetElRef.current as HTMLElement).style.removeProperty('z-index');
      (prevTargetElRef.current as HTMLElement).style.removeProperty('position');
      prevTargetElRef.current = null;
    }

    if (!step?.selector) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(step.selector);
    if (!el) {
      setTargetRect(null);
      return;
    }

    // Elevate the target element above the overlay so it's visible
    const htmlEl = el as HTMLElement;
    const computedPos = window.getComputedStyle(htmlEl).position;
    if (computedPos === 'static') {
      htmlEl.style.position = 'relative';
    }
    htmlEl.style.zIndex = '1000011';
    prevTargetElRef.current = el;

    const r = el.getBoundingClientRect();
    setTargetRect({
      top: r.top,
      left: r.left,
      width: r.width,
      height: r.height,
      bottom: r.bottom,
      right: r.right,
    });

    if (r.top < 0 || r.bottom > window.innerHeight) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      requestAnimationFrame(() => {
        const r2 = el.getBoundingClientRect();
        setTargetRect({
          top: r2.top,
          left: r2.left,
          width: r2.width,
          height: r2.height,
          bottom: r2.bottom,
          right: r2.right,
        });
      });
    }
  }, [step]);

  /* ---------- measure target on step change ---------- */

  useEffect(() => {
    if (!active || !step) return;

    const timer = setTimeout(() => {
      measureTarget();
      // Fade tooltip back in after spotlight has moved
      setTimeout(() => setTooltipVisible(true), 150);
    }, 200);
    return () => clearTimeout(timer);
  }, [active, step, measureTarget]);

  /* ---------- re-measure on scroll / resize ---------- */

  useEffect(() => {
    if (!active) return;

    const handler = () => measureTarget();
    window.addEventListener('resize', handler);
    window.addEventListener('scroll', handler, true);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('scroll', handler, true);
    };
  }, [active, measureTarget]);

  /* ---------- retry measurement if selector not found initially ---------- */

  useEffect(() => {
    if (!active || !step?.selector || targetRect) return;

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      measureTarget();
      if (attempts >= 10) clearInterval(interval);
    }, 250);

    return () => clearInterval(interval);
  }, [active, step, targetRect, measureTarget]);

  /* ---------- step navigation ---------- */

  // Use refs to avoid stale closure issues
  const stepIndexRef = useRef(stepIndex);
  stepIndexRef.current = stepIndex;

  const showDisclosureRef = useRef(showDisclosure);
  showDisclosureRef.current = showDisclosure;

  const goNext = useCallback(() => {
    const currentStep = stepIndexRef.current;
    const nextIndex = currentStep + 1;

    // After mandatory stops (stop 5), show the main progressive disclosure
    if (nextIndex === MANDATORY_COUNT && !showDisclosureRef.current) {
      setShowDisclosure(true);
      return;
    }

    if (nextIndex >= TOTAL_STEPS) {
      endTour(TOTAL_STEPS);
      return;
    }

    // Smooth transition: fade out tooltip, move spotlight, fade in tooltip
    setTransitioning(true);
    setTooltipVisible(false);
    setTimeout(() => {
      setTargetRect(null);
      setStepIndex(nextIndex);
      setTransitioning(false);
    }, 300);
  }, [endTour]);

  const handleDisclosureContinue = useCallback(() => {
    setShowDisclosure(false);
    setTargetRect(null);
    setTooltipVisible(false);
    setTimeout(() => {
      setStepIndex(MANDATORY_COUNT);
      setTooltipVisible(true);
    }, 200);
  }, []);

  const handleDisclosureSkip = useCallback(() => {
    setShowDisclosure(false);
    endTour(MANDATORY_COUNT);
  }, [endTour]);

  const handleContinuationContinue = useCallback(() => {
    const stopNum = showContinuation;
    setShowContinuation(null);
    if (stopNum !== null) {
      setTargetRect(null);
      setTooltipVisible(false);
      setTimeout(() => {
        setStepIndex(stopNum);
        setTooltipVisible(true);
      }, 200);
    }
  }, [showContinuation]);

  const handleContinuationSkip = useCallback(() => {
    const stopNum = showContinuation;
    setShowContinuation(null);
    if (stopNum !== null) {
      endTour(stopNum);
    }
  }, [showContinuation, endTour]);

  const handleSkip = useCallback(() => {
    endTour(stepIndexRef.current + 1);
  }, [endTour]);

  /* ---------- bail if inactive ---------- */

  if (!active || !step) return null;

  /* ---------- progressive disclosure overlay (after stop 5) ---------- */

  if (showDisclosure) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000010,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(30, 39, 73, 0.8)',
          animation: 'tdi-tour-fadein 0.4s ease-out',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: 20,
            padding: 32,
            maxWidth: 360,
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(30, 39, 73, 0.3)',
            animation: 'tdi-tour-scalein 0.4s ease-out',
          }}
        >
          <p
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontSize: 18,
              fontWeight: 600,
              color: '#1e2749',
              margin: '0 0 8px',
              lineHeight: 1.5,
            }}
          >
            {tUI(PROGRESSIVE_DISCLOSURE_PROMPT.title)}
          </p>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: '#6B7280',
              margin: '0 0 24px',
              lineHeight: 1.5,
            }}
          >
            {tUI(PROGRESSIVE_DISCLOSURE_PROMPT.description)}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={handleDisclosureContinue}
              style={{
                background: '#ffba06',
                color: '#1e2749',
                border: 'none',
                borderRadius: 12,
                padding: '12px 24px',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer',
              }}
            >
              {tUI(PROGRESSIVE_DISCLOSURE_PROMPT.continueLabel)}
            </button>
            <button
              onClick={handleDisclosureSkip}
              style={{
                background: 'transparent',
                color: '#9CA3AF',
                border: 'none',
                padding: '10px 24px',
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer',
              }}
            >
              {tUI(PROGRESSIVE_DISCLOSURE_PROMPT.skipLabel)}
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

  /* ---------- continuation prompts between optional stops ---------- */

  if (showContinuation !== null && CONTINUATION_PROMPTS[showContinuation]) {
    const prompt = CONTINUATION_PROMPTS[showContinuation];
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000010,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(30, 39, 73, 0.8)',
          animation: 'tdi-tour-fadein 0.4s ease-out',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: 20,
            padding: 32,
            maxWidth: 360,
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(30, 39, 73, 0.3)',
            animation: 'tdi-tour-scalein 0.4s ease-out',
          }}
        >
          <p
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontSize: 18,
              fontWeight: 600,
              color: '#1e2749',
              margin: '0 0 24px',
              lineHeight: 1.5,
            }}
          >
            {tUI(prompt.text)}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={handleContinuationContinue}
              style={{
                background: '#ffba06',
                color: '#1e2749',
                border: 'none',
                borderRadius: 12,
                padding: '12px 24px',
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer',
              }}
            >
              {tUI(prompt.continueLabel)}
            </button>
            <button
              onClick={handleContinuationSkip}
              style={{
                background: 'transparent',
                color: '#9CA3AF',
                border: 'none',
                padding: '10px 24px',
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer',
              }}
            >
              {tUI(prompt.skipLabel)}
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

  /* ---------- compute spotlight + tooltip layout ---------- */

  const hasTarget = targetRect !== null;
  const side: Side = hasTarget ? bestSide(targetRect!) : 'bottom';
  const tipPos = hasTarget
    ? tooltipPosition(targetRect!, side)
    : {
        top: window.innerHeight / 2,
        left: Math.max(16, window.innerWidth / 2 - TOOLTIP_MAX_W / 2),
      };

  const tipTransform = side === 'top' && hasTarget ? 'translateY(-100%)' : undefined;

  const spotlightStyle: React.CSSProperties = hasTarget
    ? {
        position: 'fixed',
        top: targetRect!.top - PAD,
        left: targetRect!.left - PAD,
        width: targetRect!.width + PAD * 2,
        height: targetRect!.height + PAD * 2,
        borderRadius: RADIUS,
        boxShadow: '0 0 0 9999px rgba(30, 39, 73, 0.75)',
        zIndex: 1000010,
        pointerEvents: 'none',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }
    : {
        position: 'fixed',
        inset: 0,
        background: 'rgba(30, 39, 73, 0.75)',
        zIndex: 1000010,
        pointerEvents: 'none',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      };

  return (
    <>
      {/* Spotlight hole -- pointer-events: none so clicks pass through to the page */}
      <div style={spotlightStyle} />

      {/* Tooltip card */}
      <div
        style={{
          position: 'fixed',
          top: tipPos.top,
          left: tipPos.left,
          maxWidth: TOOLTIP_MAX_W,
          width: TOOLTIP_MAX_W,
          zIndex: 1000011,
          transform: tipTransform,
          opacity: tooltipVisible && !transitioning ? 1 : 0,
          transition: 'opacity 0.3s ease, top 0.5s cubic-bezier(0.4, 0, 0.2, 1), left 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div
          style={{
            position: 'relative',
            background: 'white',
            borderRadius: 16,
            boxShadow: '0 20px 60px rgba(30, 39, 73, 0.25)',
            overflow: 'visible',
          }}
        >
          {/* Arrow */}
          {hasTarget && <Arrow side={side} />}

          {/* Close / skip button */}
          <button
            onClick={handleSkip}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9CA3AF',
              padding: 4,
              lineHeight: 1,
            }}
            aria-label="Skip tour"
          >
            <X size={16} />
          </button>

          {/* Content */}
          <div style={{ padding: '20px 20px 16px' }}>
            <h3
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontSize: 15,
                fontWeight: 600,
                color: '#1e2749',
                margin: '0 0 6px',
                paddingRight: 24,
              }}
            >
              {tUI(step.title)}
            </h3>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                lineHeight: 1.6,
                color: '#6B7280',
                margin: 0,
              }}
            >
              {tUI(step.body)}
            </p>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '0 20px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                color: '#9CA3AF',
              }}
            >
              {stepIndex + 1} of {TOTAL_STEPS}
            </span>
            <button
              onClick={goNext}
              style={{
                background: '#ffba06',
                color: '#1e2749',
                border: 'none',
                borderRadius: 10,
                padding: '8px 20px',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer',
              }}
            >
              {stepIndex >= TOTAL_STEPS - 1 ? tUI('Done') : tUI('Next')}
            </button>
          </div>
        </div>
      </div>

      {/* Skip tour link below tooltip */}
      <div
        style={{
          position: 'fixed',
          top: (tipTransform ? tipPos.top : tipPos.top) + (tipTransform ? -8 : 0),
          left: tipPos.left,
          width: TOOLTIP_MAX_W,
          zIndex: 1000011,
          textAlign: 'center',
          marginTop: tipTransform ? undefined : 8,
          transform: tipTransform ? 'translateY(-100%) translateY(-48px)' : undefined,
          opacity: tooltipVisible && !transitioning ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <button
          onClick={handleSkip}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 12,
            fontFamily: "'DM Sans', sans-serif",
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          {tUI('Skip tour')}
        </button>
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
    </>
  );
}
