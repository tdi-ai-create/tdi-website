'use client';

import { useEffect, useRef, useCallback } from 'react';
import { driver, type DriveStep, type Config, type PopoverDOM, type Driver as DriverInstance } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useHub } from '@/components/hub/HubContext';
import { useTranslation } from '@/lib/hub/useTranslation';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import {
  TOUR_STOPS,
  PROGRESSIVE_DISCLOSURE_PROMPT,
  CONTINUATION_PROMPTS,
} from '@/lib/tour-copy';

interface OnboardingTourProps {
  onComplete: (stopsSeen: number) => void;
}

/**
 * Number of mandatory stops. After this many, the user gets a
 * progressive-disclosure prompt before continuing to optional stops.
 */
const MANDATORY_COUNT = 5;

/**
 * CSS selectors (or null for popover-only) for each tour stop, indexed by stop id (1-based).
 */
const STOP_SELECTORS: Record<number, string | null> = {
  1: 'a[href="/hub/quick-wins"]',
  2: null, // Community section -- popover only
  3: '[data-tour="lift-filter"]',
  4: '[data-tour="moment-mode"]',
  5: null, // Desi -- placeholder, popover only
  6: 'a[href="/hub/certificates"]',
  7: '[data-tour="gift-element"]',
  8: '[data-tour="vibe-check"]',
  9: null, // Transformation Tracker -- popover only
  10: '[data-tour="favorites"]',
  11: '[data-tour="language-toggle"]',
  12: 'a[href="/hub/certificates"]',
};

export default function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const { user } = useHub();
  const { tUI } = useTranslation();
  const driverRef = useRef<DriverInstance | null>(null);
  const stopsSeen = useRef(0);
  const hasRun = useRef(false);

  const logCompletion = useCallback(
    async (count: number) => {
      if (!user?.id) return;
      const supabase = getSupabase();
      await supabase.from('hub_activity_log').insert({
        user_id: user.id,
        action: 'tour_completed',
        metadata: { stops_seen: count },
      });
    },
    [user?.id],
  );

  const completeTour = useCallback(
    (count: number) => {
      stopsSeen.current = count;
      logCompletion(count);
      onComplete(count);
    },
    [logCompletion, onComplete],
  );

  /**
   * Build Driver.js steps. Only includes steps whose selectors actually
   * resolve to a visible DOM element, falling back to popover-only for
   * selectors that are absent.
   */
  const buildSteps = useCallback((): DriveStep[] => {
    return TOUR_STOPS.map((stop) => {
      const selector = STOP_SELECTORS[stop.id];
      const element =
        selector && document.querySelector(selector) ? selector : undefined;

      const step: DriveStep = {
        element,
        popover: {
          title: tUI(stop.title),
          description: tUI(stop.description),
          side: element ? 'bottom' : 'over' as any,
          align: 'center',
          showButtons: ['next', 'close'],
          nextBtnText: stop.id < TOUR_STOPS.length ? tUI('Next') : tUI('Done'),
          popoverClass: 'tdi-tour-popover',
        },
      };

      return step;
    });
  }, [tUI]);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    // Build all steps then split into mandatory + optional
    const allSteps = buildSteps();
    const mandatorySteps = allSteps.slice(0, MANDATORY_COUNT);
    const optionalSteps = allSteps.slice(MANDATORY_COUNT);

    /**
     * Start the optional portion of the tour from a given index within
     * the optional steps array.
     */
    function startOptionalTour(fromIndex: number) {
      const remaining = optionalSteps.slice(fromIndex);
      if (remaining.length === 0) {
        completeTour(MANDATORY_COUNT + fromIndex);
        return;
      }

      // For each optional step, inject an onDeselected hook that shows
      // a continuation prompt before advancing to the next optional stop.
      const stepsWithPrompts: DriveStep[] = remaining.map((step, idx) => {
        const absoluteIdx = MANDATORY_COUNT + fromIndex + idx + 1; // 1-based stop number that just completed
        return {
          ...step,
          popover: {
            ...step.popover,
            nextBtnText:
              idx < remaining.length - 1 ? tUI('Next') : tUI('Done'),
          },
        };
      });

      const optDriver = driver({
        animate: true,
        allowClose: true,
        overlayColor: '#1e2749',
        overlayOpacity: 0.75,
        stagePadding: 12,
        stageRadius: 12,
        popoverOffset: 14,
        showButtons: ['next', 'close'],
        popoverClass: 'tdi-tour-popover',
        steps: stepsWithPrompts,
        onCloseClick: () => {
          const seen = MANDATORY_COUNT + fromIndex + (optDriver.getActiveIndex() ?? 0) + 1;
          optDriver.destroy();
          completeTour(seen);
        },
        onDestroyed: () => {
          const idx = optDriver.getActiveIndex();
          const seen = MANDATORY_COUNT + fromIndex + (idx !== undefined ? idx + 1 : remaining.length);
          // Check if we finished all optional steps
          if (idx !== undefined && idx >= remaining.length - 1) {
            completeTour(TOUR_STOPS.length);
          }
        },
        onNextClick: (element, step, opts) => {
          const currentIdx = optDriver.getActiveIndex() ?? 0;
          const absoluteStopNum = MANDATORY_COUNT + fromIndex + currentIdx + 1;
          const prompt = CONTINUATION_PROMPTS[absoluteStopNum];

          if (prompt && currentIdx < remaining.length - 1) {
            // Show continuation prompt
            optDriver.destroy();
            showContinuationPrompt(
              prompt,
              () => startOptionalTour(fromIndex + currentIdx + 1),
              () => completeTour(absoluteStopNum),
            );
          } else {
            optDriver.moveNext();
          }
        },
      });

      optDriver.drive();
    }

    /**
     * Show a centered prompt overlay asking if the user wants to continue.
     */
    function showContinuationPrompt(
      prompt: { text: string; continueLabel: string; skipLabel: string },
      onContinue: () => void,
      onSkip: () => void,
    ) {
      const overlay = document.createElement('div');
      overlay.className = 'tdi-tour-continuation-overlay';
      overlay.innerHTML = `
        <div class="tdi-tour-continuation-card">
          <p class="tdi-tour-continuation-text">${tUI(prompt.text)}</p>
          <div class="tdi-tour-continuation-buttons">
            <button class="tdi-tour-btn-continue">${tUI(prompt.continueLabel)}</button>
            <button class="tdi-tour-btn-skip">${tUI(prompt.skipLabel)}</button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      const continueBtn = overlay.querySelector('.tdi-tour-btn-continue');
      const skipBtn = overlay.querySelector('.tdi-tour-btn-skip');

      continueBtn?.addEventListener('click', () => {
        overlay.remove();
        onContinue();
      });

      skipBtn?.addEventListener('click', () => {
        overlay.remove();
        onSkip();
      });
    }

    // Build the mandatory driver
    const mandatoryDriver = driver({
      animate: true,
      allowClose: true,
      overlayColor: '#1e2749',
      overlayOpacity: 0.75,
      stagePadding: 12,
      stageRadius: 12,
      popoverOffset: 14,
      showButtons: ['next', 'close'],
      popoverClass: 'tdi-tour-popover',
      steps: mandatorySteps,
      onCloseClick: () => {
        const seen = (mandatoryDriver.getActiveIndex() ?? 0) + 1;
        mandatoryDriver.destroy();
        completeTour(seen);
      },
      onNextClick: (element, step, opts) => {
        const currentIdx = mandatoryDriver.getActiveIndex() ?? 0;

        if (currentIdx >= MANDATORY_COUNT - 1) {
          // Last mandatory step -- show progressive disclosure prompt
          mandatoryDriver.destroy();

          if (optionalSteps.length > 0) {
            showContinuationPrompt(
              {
                text: PROGRESSIVE_DISCLOSURE_PROMPT.title + ' ' + PROGRESSIVE_DISCLOSURE_PROMPT.description,
                continueLabel: PROGRESSIVE_DISCLOSURE_PROMPT.continueLabel,
                skipLabel: PROGRESSIVE_DISCLOSURE_PROMPT.skipLabel,
              },
              () => startOptionalTour(0),
              () => completeTour(MANDATORY_COUNT),
            );
          } else {
            completeTour(MANDATORY_COUNT);
          }
        } else {
          mandatoryDriver.moveNext();
        }
      },
    });

    driverRef.current = mandatoryDriver;
    mandatoryDriver.drive();

    return () => {
      mandatoryDriver.destroy();
    };
  }, [buildSteps, completeTour, tUI]);

  // Inject tour styles
  useEffect(() => {
    const styleId = 'tdi-tour-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .tdi-tour-popover .driver-popover {
        background: white !important;
        border-radius: 16px !important;
        box-shadow: 0 20px 60px rgba(30, 39, 73, 0.25) !important;
        max-width: 340px !important;
        padding: 0 !important;
        border: none !important;
      }

      .tdi-tour-popover .driver-popover-title {
        font-family: 'Source Serif 4', serif !important;
        font-size: 18px !important;
        font-weight: 700 !important;
        color: #1e2749 !important;
        padding: 20px 20px 4px !important;
        margin: 0 !important;
      }

      .tdi-tour-popover .driver-popover-description {
        font-family: 'DM Sans', sans-serif !important;
        font-size: 14px !important;
        line-height: 1.6 !important;
        color: #6B7280 !important;
        padding: 0 20px 16px !important;
        margin: 0 !important;
      }

      .tdi-tour-popover .driver-popover-footer {
        padding: 0 20px 16px !important;
        border-top: none !important;
      }

      .tdi-tour-popover .driver-popover-next-btn {
        background: #ffba06 !important;
        color: #1e2749 !important;
        border: none !important;
        border-radius: 10px !important;
        padding: 8px 20px !important;
        font-size: 13px !important;
        font-weight: 600 !important;
        font-family: 'DM Sans', sans-serif !important;
        cursor: pointer !important;
        text-shadow: none !important;
      }

      .tdi-tour-popover .driver-popover-next-btn:hover {
        background: #e5a805 !important;
      }

      .tdi-tour-popover .driver-popover-close-btn {
        color: #9CA3AF !important;
        font-size: 12px !important;
      }

      .tdi-tour-popover .driver-popover-prev-btn {
        display: none !important;
      }

      .tdi-tour-popover .driver-popover-arrow {
        border: none !important;
      }

      .tdi-tour-popover .driver-popover-arrow-side-bottom {
        border-bottom-color: white !important;
      }

      .tdi-tour-popover .driver-popover-arrow-side-top {
        border-top-color: white !important;
      }

      .tdi-tour-popover .driver-popover-arrow-side-left {
        border-left-color: white !important;
      }

      .tdi-tour-popover .driver-popover-arrow-side-right {
        border-right-color: white !important;
      }

      /* Skip tour button (shown as the close button text) */
      .tdi-tour-popover .driver-popover-close-btn::after {
        content: 'Skip tour';
        font-size: 11px;
        font-family: 'DM Sans', sans-serif;
        color: #9CA3AF;
        margin-left: 4px;
      }

      /* Continuation prompt overlay */
      .tdi-tour-continuation-overlay {
        position: fixed;
        inset: 0;
        z-index: 1000010;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(30, 39, 73, 0.8);
        animation: tdi-fade-in 0.2s ease-out;
      }

      .tdi-tour-continuation-card {
        background: white;
        border-radius: 20px;
        padding: 32px;
        max-width: 360px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(30, 39, 73, 0.3);
      }

      .tdi-tour-continuation-text {
        font-family: 'Source Serif 4', serif;
        font-size: 18px;
        font-weight: 600;
        color: #1e2749;
        margin: 0 0 24px;
        line-height: 1.5;
      }

      .tdi-tour-continuation-buttons {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .tdi-tour-btn-continue {
        background: #ffba06;
        color: #1e2749;
        border: none;
        border-radius: 12px;
        padding: 12px 24px;
        font-size: 14px;
        font-weight: 600;
        font-family: 'DM Sans', sans-serif;
        cursor: pointer;
        transition: background 0.15s;
      }

      .tdi-tour-btn-continue:hover {
        background: #e5a805;
      }

      .tdi-tour-btn-skip {
        background: transparent;
        color: #9CA3AF;
        border: none;
        padding: 10px 24px;
        font-size: 13px;
        font-family: 'DM Sans', sans-serif;
        cursor: pointer;
        transition: color 0.15s;
      }

      .tdi-tour-btn-skip:hover {
        color: #6B7280;
      }

      @keyframes tdi-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;

    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, []);

  return null;
}
