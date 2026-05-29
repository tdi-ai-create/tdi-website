'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { useHub } from '@/components/hub/HubContext';
import { useTranslation } from '@/lib/hub/useTranslation';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import { useMomentMode } from './MomentModeContext';
import {
  CHECK_IN_QUESTIONS,
  getNextQuestion,
  scoreResponse,
  type CheckInQuestion,
  type CheckInOption,
} from '@/lib/hub/checkInQuestions';

/** Random interval between 5-20 minutes in ms */
function randomInterval(): number {
  return 300000 + Math.floor(Math.random() * 900000);
}

export default function WellbeingPopup() {
  const { user } = useHub();
  const { tUI } = useTranslation();
  const { isMomentModeActive: momentModeActive } = useMomentMode();

  const [visible, setVisible] = useState(false);
  const [question, setQuestion] = useState<CheckInQuestion>(CHECK_IN_QUESTIONS[0]);
  const [thanking, setThanking] = useState(false);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQuestionIdRef = useRef<string | null>(null);

  /* ---------- pick next question ---------- */

  const pickNext = useCallback(() => {
    const next = getNextQuestion(lastQuestionIdRef.current);
    lastQuestionIdRef.current = next.id;
    setQuestion(next);
    setSelectedWords([]);
  }, []);

  /* ---------- schedule next popup ---------- */

  const scheduleNext = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (momentModeActive) {
        scheduleNext();
        return;
      }
      pickNext();
      setThanking(false);
      setVisible(true);
    }, randomInterval());
  }, [pickNext, momentModeActive]);

  useEffect(() => {
    if (!user?.id) return;
    scheduleNext();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user?.id, scheduleNext]);

  /* ---------- handle response ---------- */

  const handleResponse = useCallback(
    async (value: string | number) => {
      setThanking(true);

      if (user?.id) {
        try {
          const supabase = getSupabase();
          const score = scoreResponse(question, value);
          await supabase.from('hub_activity_log').insert({
            user_id: user.id,
            action: 'wellbeing_check',
            metadata: {
              question_id: question.id,
              category: question.category,
              response_type: question.responseType,
              value,
              score,
              responded_at: new Date().toISOString(),
            },
          });
        } catch {
          // Silent fail
        }
      }

      setTimeout(() => {
        setVisible(false);
        setThanking(false);
        scheduleNext();
      }, 1500);
    },
    [user?.id, question, scheduleNext],
  );

  const handleWordToggle = (val: string) => {
    const max = question.maxSelect || 3;
    setSelectedWords(prev => {
      if (prev.includes(val)) return prev.filter(w => w !== val);
      if (prev.length >= max) return prev;
      return [...prev, val];
    });
  };

  const handleWordSubmit = () => {
    if (selectedWords.length > 0) {
      handleResponse(selectedWords.join(','));
    }
  };

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setThanking(false);
    scheduleNext();
  }, [scheduleNext]);

  if (!visible) return null;

  /* ---------- render question by type ---------- */

  const renderQuestion = () => {
    const opts = question.options || [];

    switch (question.responseType) {
      case 'color_scale':
        return (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {opts.map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => handleResponse(opt.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 20,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                  background: opt.color || '#E5E7EB',
                  color: opt.textColor || '#fff',
                  transition: 'transform 0.15s',
                }}
                onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'scale(1.08)'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'scale(1)'; }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        );

      case 'emoji_tap':
        return (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {opts.map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => handleResponse(opt.value)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '8px 10px',
                  borderRadius: 12,
                  border: '1px solid #E5E7EB',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: 11,
                  color: '#6B7280',
                  transition: 'all 0.15s',
                  minWidth: 52,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#FFBA06'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'; }}
              >
                <span style={{ fontSize: 20 }}>{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        );

      case 'word_cloud':
        return (
          <>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {opts.map((opt) => {
                const selected = selectedWords.includes(String(opt.value));
                return (
                  <button
                    key={String(opt.value)}
                    onClick={() => handleWordToggle(String(opt.value))}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 20,
                      border: selected ? '2px solid #1B2A4A' : '1px solid #E5E7EB',
                      background: selected ? '#1B2A4A' : 'white',
                      color: selected ? 'white' : '#4B5563',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 500,
                      transition: 'all 0.15s',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {question.hint && (
              <p style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 8 }}>{tUI(question.hint)}</p>
            )}
            {selectedWords.length > 0 && (
              <button
                onClick={handleWordSubmit}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#FFBA06',
                  color: '#1B2A4A',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {tUI('Submit')}
              </button>
            )}
          </>
        );

      case 'fill_blank':
        return (
          <>
            {question.blankPrefix && (
              <p style={{ fontSize: 13, color: '#1B2A4A', marginBottom: 10, fontWeight: 500 }}>
                {tUI(question.blankPrefix)} <span style={{ borderBottom: '2px solid #FFBA06', padding: '0 16px' }}>____</span>{question.blankSuffix || ''}
              </p>
            )}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {opts.map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => handleResponse(opt.value)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 8,
                    border: '1px solid #E5E7EB',
                    background: 'white',
                    color: '#4B5563',
                    cursor: 'pointer',
                    fontSize: 12,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#FFBA06'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'; }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        );

      case 'two_choice':
        return (
          <div style={{ display: 'flex', gap: 8 }}>
            {opts.map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => handleResponse(opt.value)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '12px 8px',
                  borderRadius: 12,
                  border: '1px solid #E5E7EB',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: 12,
                  color: '#1B2A4A',
                  fontWeight: 500,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#FFBA06'; (e.currentTarget as HTMLElement).style.background = '#FFFDF5'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLElement).style.background = 'white'; }}
              >
                {opt.emoji && <span style={{ fontSize: 24 }}>{opt.emoji}</span>}
                {opt.label}
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 300,
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

          <p
            style={{
              fontSize: 14,
              lineHeight: 1.5,
              color: '#1e2749',
              margin: '0 0 14px',
              paddingRight: 20,
              fontWeight: 500,
            }}
          >
            {tUI(question.question)}
          </p>

          {renderQuestion()}

          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button
              onClick={handleDismiss}
              style={{
                background: 'none',
                border: 'none',
                color: '#9CA3AF',
                fontSize: 11,
                cursor: 'pointer',
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
