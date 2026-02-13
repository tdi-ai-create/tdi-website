'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useMomentMode } from './hub/MomentModeContext';

interface NotificationMessage {
  message: string;
  type: string;
  active: boolean;
}

// Helper to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Helper to get random number in range
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Parse CSV string to array of objects
function parseCSV(csv: string): NotificationMessage[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const dataLines = lines.slice(1);
  return dataLines
    .map((line) => {
      const parts = line.split(',').map(p => p.replace(/^"|"$/g, '').trim());
      return {
        message: parts[0] || '',
        type: parts[1] || '',
        active: (parts[2] || '').toUpperCase() === 'TRUE',
      };
    })
    .filter(item => item.active && item.message);
}

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR-xuHhEaqblAmqPT9S2zTU4X4jdsie1l8KTLvsimhf6Qofc1vZIMJ_vMUoBFu2XA/pub?output=csv';
const CACHE_KEY = 'tdi-social-proof-cache';
const CACHE_TIMESTAMP_KEY = 'tdi-social-proof-cache-time';
const DISMISS_COUNT_KEY = 'tdi-social-proof-dismissals';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const ANIMATION_DURATION = 10000; // 10 seconds for comfortable reading time
const BURST_CHANCE = 0.3; // 30% chance of burst mode

export function SocialProofPopup() {
  const [currentMessage, setCurrentMessage] = useState<NotificationMessage | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dismissCount, setDismissCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();

  // Check if Moment Mode is active (sacred space - no distractions)
  const { isMomentModeActive } = useMomentMode();

  // Hide on internal team pages, creator portal, admin pages, partner pages, hub, and paragametools
  const isInternalPage = pathname?.includes('dashboard-creation') ||
    pathname?.startsWith('/creator-portal') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/partner-setup') ||
    pathname?.startsWith('/partners') ||
    pathname?.startsWith('/hub') ||
    pathname?.startsWith('/paragametools');

  const messagesRef = useRef<NotificationMessage[]>([]);
  const messageIndexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingBurstRef = useRef(false); // Track if next notification should be a burst
  const momentModeActiveRef = useRef(false); // Track Moment Mode state for callbacks

  // Get next message from shuffled list
  const getNextMessage = (): NotificationMessage | null => {
    const messages = messagesRef.current;
    if (messages.length === 0) return null;

    const message = messages[messageIndexRef.current];
    messageIndexRef.current = (messageIndexRef.current + 1) % messages.length;

    if (messageIndexRef.current === 0) {
      messagesRef.current = shuffleArray(messages);
    }

    return message;
  };

  // Keep ref in sync with state so timeout callbacks have current value
  useEffect(() => {
    momentModeActiveRef.current = isMomentModeActive;
  }, [isMomentModeActive]);

  // Show a notification with floating animation
  const showNotification = (isBurstFollow: boolean = false) => {
    // Check ref for current Moment Mode state (callbacks may have stale closure)
    if (momentModeActiveRef.current) return;
    if (dismissCount >= 3 || messagesRef.current.length === 0) return;

    const message = getNextMessage();
    if (message) {
      setCurrentMessage(message);
      setIsAnimating(true);

      // Decide if this notification triggers a burst (only if not already a burst follow-up)
      const willBurst = !isBurstFollow && Math.random() < BURST_CHANCE;
      pendingBurstRef.current = willBurst;

      // Animation completes after ANIMATION_DURATION
      animationTimeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
        setCurrentMessage(null);

        if (pendingBurstRef.current) {
          // Burst mode: show next bubble quickly (1-3 seconds)
          pendingBurstRef.current = false;
          const burstDelay = randomInRange(1000, 3000);
          timeoutRef.current = setTimeout(() => {
            showNotification(true); // Mark as burst follow-up
          }, burstDelay);
        } else {
          // Normal mode: schedule with regular interval
          scheduleNextNotification();
        }
      }, ANIMATION_DURATION);
    }
  };

  // Schedule next notification with random delay
  const scheduleNextNotification = () => {
    // Don't schedule if Moment Mode is active
    if (momentModeActiveRef.current) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Random interval between 6-20 seconds
    const delay = randomInRange(6000, 20000);

    timeoutRef.current = setTimeout(() => {
      showNotification();
    }, delay);
  };

  // Handle close button
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnimating(false);
    setCurrentMessage(null);
    pendingBurstRef.current = false; // Cancel any pending burst

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    const newCount = dismissCount + 1;
    setDismissCount(newCount);
    sessionStorage.setItem(DISMISS_COUNT_KEY, newCount.toString());

    if (newCount < 3) {
      scheduleNextNotification();
    }
  };

  // Fetch messages from Google Sheet
  useEffect(() => {
    // Skip on internal pages
    if (isInternalPage) return;

    const savedDismissCount = sessionStorage.getItem(DISMISS_COUNT_KEY);
    if (savedDismissCount) {
      const count = parseInt(savedDismissCount, 10);
      setDismissCount(count);
      if (count >= 3) return;
    }

    const fetchAndInit = async () => {
      try {
        const cachedData = sessionStorage.getItem(CACHE_KEY);
        const cachedTime = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);

        let csvText: string;

        if (cachedData && cachedTime) {
          const cacheAge = Date.now() - parseInt(cachedTime, 10);
          if (cacheAge < CACHE_DURATION) {
            csvText = cachedData;
          } else {
            const response = await fetch(SHEET_URL);
            csvText = await response.text();
            sessionStorage.setItem(CACHE_KEY, csvText);
            sessionStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
          }
        } else {
          const response = await fetch(SHEET_URL);
          csvText = await response.text();
          sessionStorage.setItem(CACHE_KEY, csvText);
          sessionStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
        }

        const messages = parseCSV(csvText);

        if (messages.length > 0) {
          messagesRef.current = shuffleArray(messages);

          // Initial delay: random between 2-5 seconds
          const initialDelay = randomInRange(2000, 5000);

          timeoutRef.current = setTimeout(() => {
            showNotification();
          }, initialDelay);
        }
      } catch (error) {
        console.error('[SocialProof] Failed to fetch messages:', error);
      }
    };

    fetchAndInit();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    };
  }, [isInternalPage]);

  // Clear any active notification when Moment Mode becomes active
  // Moment Mode is a sacred space - no distractions allowed
  useEffect(() => {
    if (isMomentModeActive) {
      // Immediately hide any visible notification
      setIsAnimating(false);
      setCurrentMessage(null);
      pendingBurstRef.current = false;

      // Clear any pending timeouts so notifications don't queue up
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
    }
  }, [isMomentModeActive]);

  // Don't render on internal pages, during Moment Mode, or if no message
  if (isInternalPage || isMomentModeActive || !currentMessage || !isAnimating) {
    return null;
  }

  return (
    <>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="social-proof-bubble"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Close button - subtle, appears more visible on hover */}
        <button
          onClick={handleClose}
          className="close-button"
          style={{ opacity: isHovered ? 0.8 : 0.3 }}
          aria-label="Close notification"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M1 1L9 9M1 9L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Bubble content */}
        <div className="bubble-content">
          <span className="bubble-icon">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#1e2749">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </span>
          <span className="bubble-text">{currentMessage.message}</span>
        </div>
      </div>

      <style jsx>{`
        .social-proof-bubble {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9998;
          display: inline-flex;
          align-items: center;
          padding: 10px 16px;
          padding-right: 32px;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          border-radius: 50px;
          box-shadow: 0 4px 20px rgba(30, 39, 73, 0.15);
          max-width: 320px;
          animation: floatUp 10s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
          cursor: default;
        }

        .close-button {
          position: absolute;
          top: 50%;
          right: 10px;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: #1e2749;
          cursor: pointer;
          transition: opacity 0.2s ease;
          padding: 0;
        }

        .close-button:hover {
          opacity: 1 !important;
        }

        .bubble-content {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .bubble-icon {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: #ffba06;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bubble-text {
          font-size: 13px;
          color: #1e2749;
          line-height: 1.3;
          font-weight: 500;
        }

        @keyframes floatUp {
          0% {
            opacity: 0;
            transform: translateY(20px) translateX(0);
          }
          5% {
            opacity: 1;
            transform: translateY(0) translateX(0);
          }
          75% {
            opacity: 1;
            transform: translateY(-120px) translateX(-3px);
          }
          100% {
            opacity: 0;
            transform: translateY(-200px) translateX(-5px);
            pointer-events: none;
          }
        }

        @media (max-width: 640px) {
          .social-proof-bubble {
            left: 12px;
            right: 12px;
            max-width: none;
            bottom: 16px;
          }

          .bubble-text {
            font-size: 12px;
          }

          @keyframes floatUp {
            0% {
              opacity: 0;
              transform: translateY(20px) translateX(0);
            }
            5% {
              opacity: 1;
              transform: translateY(0) translateX(0);
            }
            75% {
              opacity: 1;
              transform: translateY(-100px) translateX(0);
            }
            100% {
              opacity: 0;
              transform: translateY(-160px) translateX(0);
              pointer-events: none;
            }
          }
        }
      `}</style>
    </>
  );
}
