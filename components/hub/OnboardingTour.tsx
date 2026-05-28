'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { useHub } from '@/components/hub/HubContext';
import { useTranslation } from '@/lib/hub/useTranslation';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import {
  PROGRESSIVE_DISCLOSURE_PROMPT,
} from '@/lib/tour-copy';

interface OnboardingTourProps {
  onComplete: (stopsSeen: number) => void;
}

/* ------------------------------------------------------------------ */
/*  Tour step definition                                               */
/* ------------------------------------------------------------------ */

interface TourStep {
  title: string;
  body: string;
  /** URL path the target element lives on */
  page: string;
  /** CSS selector for the element to highlight (null = centered popover) */
  selector: string | null;
}

const MANDATORY_COUNT = 5;

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Grab something useful right now',
    body: 'Quick Wins are short, practical resources built for real school days. No course enrollment, no setup. Just something you can use this week.',
    page: '/hub',
    selector: 'a[href="/hub/quick-wins"]',
  },
  {
    title: 'Learn at your own pace',
    body: 'You are not alone in this. Connect with other educators who get it -- share ideas, ask questions, celebrate wins.',
    page: '/hub',
    selector: 'a[href="/hub/courses"]',
  },
  {
    title: 'The LIFT Filter',
    body: 'Every resource is tagged by what it helps with: Leadership, Instruction, Family engagement, or Teacher wellness. Find what you need fast.',
    page: '/hub/quick-wins',
    selector: '[data-tour="lift-filter"]',
  },
  {
    title: 'Moment Mode',
    body: 'Having a rough day? This is your reset button. Breathing exercises, affirmations, and gentle tools -- right when you need them.',
    page: '/hub/quick-wins',
    selector: '[data-tour="moment-mode"]',
  },
  {
    title: 'Multilingual Support',
    body: 'Toggle between English and Spanish. The whole Hub works in both languages.',
    page: '/hub/quick-wins',
    selector: '[data-tour="language-toggle"]',
  },
  // --- optional stops (6-8) ---
  {
    title: 'The Gift',
    body: 'A 24-hour All-Access pass, on us. Use it when you are ready. No strings, no credit card.',
    page: '/hub',
    selector: '[data-tour="gift-element"]',
  },
  {
    title: 'Our Story',
    body: 'Learn about the team behind TDI, our mission, and how we support educators beyond the Hub.',
    page: '/hub',
    selector: 'a[href="/hub/our-story"]',
  },
  {
    title: 'Certificates',
    body: 'Finish a course, get a certificate. Real PD hours you can submit to your district.',
    page: '/hub',
    selector: 'a[href="/hub/certificates"]',
  },
];

const TOTAL_STEPS = TOUR_STEPS.length;

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

  // Prefer below, then above, then right, then left
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
        top: rect.top - PAD - TOOLTIP_GAP, // will be adjusted via transform
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

export default function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const { user } = useHub();
  const { tUI } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [navigating, setNavigating] = useState(false);
  const [showDisclosure, setShowDisclosure] = useState(false);
  const [active, setActive] = useState(true);

  const hasLoggedRef = useRef(false);

  const step = TOUR_STEPS[stepIndex] as TourStep | undefined;

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
    },
    [user?.id],
  );

  const endTour = useCallback(
    (count: number) => {
      setActive(false);
      logCompletion(count);
      onComplete(count);
    },
    [logCompletion, onComplete],
  );

  /* ---------- find & measure target ---------- */

  const measureTarget = useCallback(() => {
    if (!step?.selector) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(step.selector);
    if (!el) {
      setTargetRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setTargetRect({
      top: r.top,
      left: r.left,
      width: r.width,
      height: r.height,
      bottom: r.bottom,
      right: r.right,
    });

    // Scroll element into view if needed
    if (r.top < 0 || r.bottom > window.innerHeight) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Re-measure after scroll
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

  /* ---------- navigate if needed, then measure ---------- */

  useEffect(() => {
    if (!active || !step) return;

    // Normalise paths for comparison
    const currentPath = pathname.replace(/\/$/, '') || '/hub';
    const targetPath = step.page.replace(/\/$/, '') || '/hub';

    if (currentPath !== targetPath) {
      setNavigating(true);
      router.push(step.page);
    } else {
      // Already on the right page -- try to find the element
      // Use a short delay to let the DOM settle (esp. after navigation)
      const timer = setTimeout(() => {
        setNavigating(false);
        measureTarget();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [active, step, pathname, router, measureTarget]);

  /* ---------- after navigation, wait for target page ---------- */

  useEffect(() => {
    if (!navigating || !active || !step) return;

    const currentPath = pathname.replace(/\/$/, '') || '/hub';
    const targetPath = step.page.replace(/\/$/, '') || '/hub';

    if (currentPath === targetPath) {
      // Page has loaded -- wait a moment for DOM to populate then measure
      const timer = setTimeout(() => {
        setNavigating(false);
        measureTarget();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [pathname, navigating, active, step, measureTarget]);

  /* ---------- re-measure on scroll / resize ---------- */

  useEffect(() => {
    if (!active || navigating) return;

    const handler = () => measureTarget();
    window.addEventListener('resize', handler);
    window.addEventListener('scroll', handler, true);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('scroll', handler, true);
    };
  }, [active, navigating, measureTarget]);

  /* ---------- retry measurement if selector not found initially ---------- */

  useEffect(() => {
    if (!active || navigating || !step?.selector || targetRect) return;

    // Retry up to 10 times (2.5 seconds total)
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      measureTarget();
      if (attempts >= 10) clearInterval(interval);
    }, 250);

    return () => clearInterval(interval);
  }, [active, navigating, step, targetRect, measureTarget]);

  /* ---------- step navigation ---------- */

  const goNext = useCallback(() => {
    const nextIndex = stepIndex + 1;

    // After mandatory stops, show progressive disclosure
    if (nextIndex === MANDATORY_COUNT && !showDisclosure) {
      setShowDisclosure(true);
      return;
    }

    if (nextIndex >= TOTAL_STEPS) {
      endTour(TOTAL_STEPS);
      return;
    }

    setTargetRect(null);
    setStepIndex(nextIndex);
  }, [stepIndex, showDisclosure, endTour]);

  const handleDisclosureContinue = useCallback(() => {
    setShowDisclosure(false);
    setTargetRect(null);
    setStepIndex(MANDATORY_COUNT);
  }, []);

  const handleDisclosureSkip = useCallback(() => {
    setShowDisclosure(false);
    endTour(MANDATORY_COUNT);
  }, [endTour]);

  const handleSkip = useCallback(() => {
    endTour(stepIndex + 1);
  }, [stepIndex, endTour]);

  /* ---------- bail if inactive ---------- */

  if (!active || !step) return null;

  /* ---------- progressive disclosure overlay ---------- */

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
          animation: 'tdi-tour-fadein 0.2s ease-out',
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
            {tUI('Three features still ahead.')}
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
        `}</style>
      </div>
    );
  }

  /* ---------- loading state while navigating ---------- */

  if (navigating) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000010,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(30, 39, 73, 0.75)',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid rgba(255,255,255,0.2)',
            borderTopColor: '#ffba06',
            borderRadius: '50%',
            animation: 'tdi-tour-spin 0.8s linear infinite',
          }}
        />
        <style>{`
          @keyframes tdi-tour-spin {
            to { transform: rotate(360deg); }
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

  // For 'top' side, the tooltip renders above and we use translateY(-100%)
  const tipTransform = side === 'top' && hasTarget ? 'translateY(-100%)' : undefined;

  // Box-shadow spotlight: a huge spread creates the overlay, with a transparent
  // "hole" where the target element is.
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
        transition: 'all 0.3s ease',
      }
    : {
        position: 'fixed',
        inset: 0,
        background: 'rgba(30, 39, 73, 0.75)',
        zIndex: 1000010,
        pointerEvents: 'none',
      };

  return (
    <>
      {/* Click-blocker behind spotlight */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000009,
        }}
        onClick={handleSkip}
      />

      {/* Spotlight hole */}
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
          animation: 'tdi-tour-fadein 0.2s ease-out',
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
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
