'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useHub } from './HubContext';
import { useTranslation } from '@/lib/hub/useTranslation';
import { usePopupQueue } from '@/lib/hub/PopupQueueContext';

const POPUP_ID = 'capacity-feedback';
const POPUP_PRIORITY = 40;

const CAPACITY_COLORS: Record<string, string> = {
  low: '#6BA368',
  medium: '#E8B84B',
  high: '#E8927C',
};

const STORAGE_PREFIX = 'cap_fb_done_';

interface CapacityFeedbackPromptProps {
  contentType: 'course' | 'quick_win';
  contentId: string;
  officialCapacity: 'low' | 'medium' | 'high';
  onDismiss: () => void;
}

export default function CapacityFeedbackPrompt({
  contentType,
  contentId,
  officialCapacity,
  onDismiss,
}: CapacityFeedbackPromptProps) {
  const { user } = useHub();
  const { tUI } = useTranslation();
  const { enqueue, dequeue, isActive } = usePopupQueue();
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Register with popup queue on mount
  useEffect(() => {
    enqueue(POPUP_ID, POPUP_PRIORITY);
    return () => { dequeue(POPUP_ID); };
  }, [enqueue, dequeue]);

  const borderColor = CAPACITY_COLORS[officialCapacity] || '#E8B84B';

  const dismiss = () => {
    setIsAnimatingOut(true);
    dequeue(POPUP_ID);
    setTimeout(onDismiss, 300);
  };

  const handleResponse = (response: 'lower_than_rated' | 'about_right' | 'higher_than_rated') => {
    if (!user?.id) { dismiss(); return; }

    fetch('/api/hub/capacity-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, contentType, contentId, officialCapacity, response }),
    }).catch(() => {});

    try {
      localStorage.setItem(`${STORAGE_PREFIX}${contentType}_${contentId}`, '1');
    } catch { /* ignore */ }

    setIsDone(true);
    setTimeout(dismiss, 1200);
  };

  if (!isActive(POPUP_ID)) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-40 w-[300px] bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
        isAnimatingOut ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
      }`}
      style={{ borderTop: `3px solid ${borderColor}` }}
    >
      <button
        onClick={dismiss}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close"
      >
        <X size={16} />
      </button>

      <div className="p-4">
        {isDone ? (
          <p
            className="font-medium text-center py-1"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67', fontSize: '14px' }}
          >
            {tUI("Thanks for the feedback!")}
          </p>
        ) : (
          <>
            <p
              className="font-medium pr-6 mb-3"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#2B3A67' }}
            >
              {tUI("Quick check — how did the effort level feel?")}
            </p>

            <div className="flex flex-col gap-1.5">
              {[
                { value: 'lower_than_rated' as const, label: tUI('Lighter than expected') },
                { value: 'about_right' as const, label: tUI('Right where I thought') },
                { value: 'higher_than_rated' as const, label: tUI('Heavier than expected') },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleResponse(opt.value)}
                  className="w-full text-left px-3 py-2 rounded-lg border text-sm transition-all"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#2B3A67',
                    borderColor: '#E5E7EB',
                    backgroundColor: 'white',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = borderColor;
                    e.currentTarget.style.backgroundColor = `${borderColor}15`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="mt-2.5 text-right">
              <button
                onClick={dismiss}
                className="text-xs text-gray-400 hover:text-gray-600"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {tUI("Skip")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function shouldShowCapacityFeedback(contentType: 'course' | 'quick_win', contentId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return !localStorage.getItem(`${STORAGE_PREFIX}${contentType}_${contentId}`);
  } catch {
    return false;
  }
}
