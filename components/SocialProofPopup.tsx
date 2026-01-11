'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

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

  // Skip header row
  const dataLines = lines.slice(1);

  return dataLines
    .map(line => {
      // Handle CSV parsing with potential quoted strings
      const matches = line.match(/("([^"]*)"|[^,]*),("([^"]*)"|[^,]*),("([^"]*)"|[^,]*)/);
      if (matches) {
        const message = matches[2] || matches[1] || '';
        const type = matches[4] || matches[3] || '';
        const active = (matches[6] || matches[5] || '').toUpperCase() === 'TRUE';
        return { message: message.trim(), type: type.trim(), active };
      }

      // Fallback simple split
      const parts = line.split(',');
      return {
        message: parts[0]?.replace(/^"|"$/g, '').trim() || '',
        type: parts[1]?.replace(/^"|"$/g, '').trim() || '',
        active: parts[2]?.toUpperCase().includes('TRUE') || false,
      };
    })
    .filter(item => item.active && item.message);
}

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR-xuHhEaqblAmqPT9S2zTU4X4jdsie1l8KTLvsimhf6Qofc1vZIMJ_vMUoBFu2XA/pub?output=csv';
const CACHE_KEY = 'tdi-social-proof-cache';
const CACHE_TIMESTAMP_KEY = 'tdi-social-proof-cache-time';
const DISMISS_COUNT_KEY = 'tdi-social-proof-dismissals';
const MESSAGE_INDEX_KEY = 'tdi-social-proof-index';
const SHUFFLED_ORDER_KEY = 'tdi-social-proof-order';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export function SocialProofPopup() {
  const [messages, setMessages] = useState<NotificationMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<NotificationMessage | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissCount, setDismissCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageIndexRef = useRef(0);
  const shuffledOrderRef = useRef<number[]>([]);

  // Fetch messages from Google Sheet
  const fetchMessages = useCallback(async () => {
    try {
      // Check cache first
      const cachedData = sessionStorage.getItem(CACHE_KEY);
      const cachedTime = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (cachedData && cachedTime) {
        const cacheAge = Date.now() - parseInt(cachedTime, 10);
        if (cacheAge < CACHE_DURATION) {
          return parseCSV(cachedData);
        }
      }

      // Fetch fresh data
      const response = await fetch(SHEET_URL);
      const csvText = await response.text();

      // Cache the data
      sessionStorage.setItem(CACHE_KEY, csvText);
      sessionStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

      return parseCSV(csvText);
    } catch (error) {
      console.error('Failed to fetch social proof messages:', error);
      return [];
    }
  }, []);

  // Initialize shuffled order
  const initializeOrder = useCallback((messageCount: number) => {
    const savedOrder = sessionStorage.getItem(SHUFFLED_ORDER_KEY);
    const savedIndex = sessionStorage.getItem(MESSAGE_INDEX_KEY);

    if (savedOrder && savedIndex) {
      const order = JSON.parse(savedOrder);
      if (order.length === messageCount) {
        shuffledOrderRef.current = order;
        messageIndexRef.current = parseInt(savedIndex, 10);
        return;
      }
    }

    // Create new shuffled order
    shuffledOrderRef.current = shuffleArray(Array.from({ length: messageCount }, (_, i) => i));
    messageIndexRef.current = 0;
    sessionStorage.setItem(SHUFFLED_ORDER_KEY, JSON.stringify(shuffledOrderRef.current));
    sessionStorage.setItem(MESSAGE_INDEX_KEY, '0');
  }, []);

  // Get next message
  const getNextMessage = useCallback((allMessages: NotificationMessage[]): NotificationMessage | null => {
    if (allMessages.length === 0) return null;

    const index = shuffledOrderRef.current[messageIndexRef.current];
    const message = allMessages[index];

    // Move to next index, reshuffle if needed
    messageIndexRef.current++;
    if (messageIndexRef.current >= allMessages.length) {
      shuffledOrderRef.current = shuffleArray(shuffledOrderRef.current);
      messageIndexRef.current = 0;
      sessionStorage.setItem(SHUFFLED_ORDER_KEY, JSON.stringify(shuffledOrderRef.current));
    }
    sessionStorage.setItem(MESSAGE_INDEX_KEY, messageIndexRef.current.toString());

    return message;
  }, []);

  // Show notification
  const showNotification = useCallback(() => {
    if (dismissCount >= 3 || messages.length === 0) return;

    const message = getNextMessage(messages);
    if (message) {
      setCurrentMessage(message);
      setIsVisible(true);

      // Auto-hide after 5 seconds
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        scheduleNextNotification();
      }, 5000);
    }
  }, [messages, dismissCount, getNextMessage]);

  // Schedule next notification with random delay
  const scheduleNextNotification = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Random interval between 30 seconds and 2 minutes
    const delay = randomInRange(30000, 120000);

    timeoutRef.current = setTimeout(() => {
      showNotification();
    }, delay);
  }, [showNotification]);

  // Handle close
  const handleClose = useCallback(() => {
    setIsVisible(false);

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    const newCount = dismissCount + 1;
    setDismissCount(newCount);
    sessionStorage.setItem(DISMISS_COUNT_KEY, newCount.toString());

    if (newCount < 3) {
      scheduleNextNotification();
    }
  }, [dismissCount, scheduleNextNotification]);

  // Initialize
  useEffect(() => {
    // Check dismiss count
    const savedDismissCount = sessionStorage.getItem(DISMISS_COUNT_KEY);
    if (savedDismissCount) {
      const count = parseInt(savedDismissCount, 10);
      setDismissCount(count);
      if (count >= 3) return;
    }

    // Fetch messages
    fetchMessages().then(fetchedMessages => {
      if (fetchedMessages.length > 0) {
        setMessages(fetchedMessages);
        initializeOrder(fetchedMessages.length);

        // Initial delay: random between 10-20 seconds
        const initialDelay = randomInRange(10000, 20000);

        timeoutRef.current = setTimeout(() => {
          showNotification();
        }, initialDelay);
      }
    });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [fetchMessages, initializeOrder]);

  // Re-initialize showNotification when messages change
  useEffect(() => {
    if (messages.length > 0 && dismissCount < 3) {
      // This ensures showNotification has access to updated messages
    }
  }, [messages, dismissCount, showNotification]);

  if (!currentMessage) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`fixed z-[9998] transition-all duration-300 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      style={{
        bottom: '24px',
        left: '24px',
        right: 'auto',
        maxWidth: '320px',
        width: 'calc(100% - 48px)',
      }}
    >
      <div
        className="bg-white rounded-xl shadow-xl p-4 pr-10 relative"
        style={{
          border: '1px solid #e5e7eb',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full transition-colors hover:bg-gray-100"
          style={{ color: '#1e2749', opacity: 0.5 }}
          aria-label="Close notification"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M1 1L11 11M1 11L11 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Icon */}
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#ffba06' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1e2749">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>

          {/* Message */}
          <div className="flex-1 min-w-0">
            <p
              className="text-sm leading-snug"
              style={{ color: '#1e2749' }}
            >
              {currentMessage.message}
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: '#1e2749', opacity: 0.5 }}
            >
              Just now
            </p>
          </div>
        </div>
      </div>

      {/* Mobile styles */}
      <style jsx>{`
        @media (max-width: 640px) {
          div[role="status"] {
            left: 12px !important;
            right: 12px !important;
            max-width: none !important;
            width: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
