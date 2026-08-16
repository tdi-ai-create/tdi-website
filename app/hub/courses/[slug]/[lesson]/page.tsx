'use client';

import { useState, useEffect, useCallback, useRef, useSyncExternalStore, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useHub } from '@/components/hub/HubContext';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import { useProgressTracking, type LessonStatus } from '@/lib/hooks/useProgressTracking';
import CourseCompletionModal from '@/components/hub/CourseCompletionModal';
import { useTranslation } from '@/lib/hub/useTranslation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  List,
  X,
  Download,
  FileText,
} from 'lucide-react';
import {
  type QuizQuestion,
  type QuizResponse,
  type QuizOption,
  getCourseQuestions,
  getCourseResponses,
  computeGatePositions,
  saveQuizResponse,
  saveFollowUpReflection,
  checkMultipleChoiceAnswer,
  checkTrueFalseAnswer,
} from '@/lib/hub/quiz';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LessonContentJson {
  body_html?: string;
  video_id?: string;
  text?: string;
  markdown?: string;
  resource_url?: string;
  resource_filename?: string;
  resource_file_size?: number;
  resource_content_type?: string;
  [key: string]: unknown;
}

interface Lesson {
  id: string;
  slug: string;
  title: string;
  content: LessonContentJson | string | null;
  estimated_minutes: number;
  duration_seconds: number | null;
  type: string;
  sort_order: number;
  module_id: string | null;
  transcript: string | null;
  transcript_es: string | null;
}

interface Module {
  id: string;
  title: string;
  sort_order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  slug: string;
  title: string;
  pd_hours: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractVideoId(lesson: Lesson): string | null {
  if (lesson.content && typeof lesson.content === 'object' && lesson.content.video_id) {
    return lesson.content.video_id as string;
  }
  return null;
}

// Cloudflare Stream player SDK. The iframe embed has no documented raw
// postMessage protocol, so player events must go through this SDK.
const CF_STREAM_SDK_SRC = 'https://embed.cloudflarestream.com/embed/sdk.latest.js';

interface CfStreamPlayer {
  addEventListener: (event: string, handler: () => void) => void;
  removeEventListener: (event: string, handler: () => void) => void;
}

type CfStreamWindow = Window & { Stream?: (el: HTMLIFrameElement) => CfStreamPlayer };

let cfStreamSdkPromise: Promise<void> | null = null;

function loadCfStreamSdk(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if ((window as CfStreamWindow).Stream) return Promise.resolve();
  if (cfStreamSdkPromise) return cfStreamSdkPromise;

  cfStreamSdkPromise = new Promise<void>((resolve, reject) => {
    // Guarantees the promise always settles. Without it, a script tag that
    // already fired 'load' without defining window.Stream would leave this
    // pending forever and the player listeners would never attach.
    const timeout = setTimeout(() => onFail(), 15000);

    const onLoad = () => {
      clearTimeout(timeout);
      resolve();
    };

    function onFail() {
      clearTimeout(timeout);
      cfStreamSdkPromise = null;
      reject(new Error('Cloudflare Stream SDK failed to load'));
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CF_STREAM_SDK_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', onLoad);
      existing.addEventListener('error', onFail);
      return;
    }

    const script = document.createElement('script');
    script.src = CF_STREAM_SDK_SRC;
    script.async = true;
    script.onload = onLoad;
    script.onerror = onFail;
    document.head.appendChild(script);
  });

  return cfStreamSdkPromise;
}

function extractResource(lesson: Lesson): { url: string; filename: string; fileSize: number; contentType: string } | null {
  if (!lesson.content || typeof lesson.content !== 'object') return null;
  const c = lesson.content;
  if (c.resource_url) {
    return {
      url: c.resource_url as string,
      filename: (c.resource_filename as string) || 'Download',
      fileSize: (c.resource_file_size as number) || 0,
      contentType: (c.resource_content_type as string) || '',
    };
  }
  return null;
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getGateHeader(questionType: string): string {
  switch (questionType) {
    case 'multiple_choice':
    case 'true_false':
      return "Let's make sure this clicked";
    case 'reflection':
      return 'Your turn to think on this';
    case 'action_step':
      return 'Now put it to work';
    case 'checkpoint':
      return 'Before you go, the big ideas';
    default:
      return "Let's make sure this clicked";
  }
}

/**
 * "Check-in 2 of 3" counts check-ins across the course, and the second line
 * counts the parts inside this one. Counting raw questions here is what made
 * the player promise five check-ins in a course that has three.
 */
function getGateLabel(gateNumber: number, totalGates: number, partIndex: number, totalParts: number): string {
  const base = `Check-in ${gateNumber} of ${totalGates}`;
  return totalParts > 1 ? `${base} · Part ${partIndex + 1} of ${totalParts}` : base;
}

// ---------------------------------------------------------------------------
// localStorage-backed boolean preferences
//
// Read through useSyncExternalStore rather than "setState inside an effect".
// The server snapshot is always false, so SSR and hydration agree; React then
// re-reads the real value from localStorage immediately after hydrating.
// ---------------------------------------------------------------------------

const flagListeners = new Map<string, Set<() => void>>();

function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === 'true';
  } catch {
    return false; // storage blocked (private browsing)
  }
}

function writeFlag(key: string, value: boolean) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    /* storage blocked — preference just won't persist */
  }
  // 'storage' events don't fire in the tab that made the change, so notify here.
  flagListeners.get(key)?.forEach((listener) => listener());
}

function subscribeFlag(key: string, listener: () => void) {
  let listeners = flagListeners.get(key);
  if (!listeners) {
    listeners = new Set();
    flagListeners.set(key, listeners);
  }
  const set = listeners;
  set.add(listener);

  const onStorage = (e: StorageEvent) => {
    if (e.key === key) listener();
  };
  window.addEventListener('storage', onStorage);

  return () => {
    set.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function useStoredFlag(key: string): { value: boolean; toggle: () => void } {
  const subscribe = useCallback((listener: () => void) => subscribeFlag(key, listener), [key]);
  const getSnapshot = useCallback(() => readFlag(key), [key]);
  const getServerSnapshot = useCallback(() => false, []);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const toggle = useCallback(() => writeFlag(key, !readFlag(key)), [key]);

  return { value, toggle };
}

function useDarkMode() {
  const { value: dark, toggle } = useStoredFlag('tdi-lesson-dark-mode');
  return { dark, toggle };
}

function useAutoAdvance() {
  const { value: enabled, toggle } = useStoredFlag('tdi-lesson-auto-advance');
  return { enabled, toggle };
}

// ---------------------------------------------------------------------------
// Gate Card Component
// ---------------------------------------------------------------------------

interface GateCardProps {
  question: QuizQuestion;
  label: string;
  isFinalPart: boolean;
  userId: string;
  dark: boolean;
  onGateCleared: () => void;
}

function GateCard({ question, label, isFinalPart, userId, dark, onGateCleared }: GateCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [reflectionText, setReflectionText] = useState('');
  const [saving, setSaving] = useState(false);
  const [gateCleared, setGateCleared] = useState(false);
  const [committed, setCommitted] = useState(false);
  const [wrongReflection, setWrongReflection] = useState('');
  const [wrongReflectionSaved, setWrongReflectionSaved] = useState(false);
  const [wrongReflectionError, setWrongReflectionError] = useState(false);

  const header = getGateHeader(question.question_type);

  // A check-in can have more than one part. The button says where it leads.
  const advanceLabel = isFinalPart ? 'Keep going' : 'Next part';

  const handleMultipleChoiceSelect = async (idx: number) => {
    if (answered) return;
    setSelectedIndex(idx);

    const options = question.options as QuizOption[];
    const correct = checkMultipleChoiceAnswer(options, idx);
    setWasCorrect(correct);
    setAnswered(true);

    await saveQuizResponse(userId, question.id, question.lesson_id, options[idx].text, correct);
  };

  const handleTrueFalseSelect = async (answer: string) => {
    if (answered) return;
    const idx = answer === 'True' ? 0 : 1;
    setSelectedIndex(idx);

    const correct = checkTrueFalseAnswer(question.correct_answer || '', answer);
    setWasCorrect(correct);
    setAnswered(true);

    await saveQuizResponse(userId, question.id, question.lesson_id, answer, correct);
  };

  const handleSaveReflection = async () => {
    if (reflectionText.trim().length < 50) return;
    setSaving(true);
    await saveQuizResponse(userId, question.id, question.lesson_id, reflectionText, null);
    setSaving(false);
    setAnswered(true);
  };

  const handleActionCommit = async () => {
    if (reflectionText.trim().length < 30) return;
    setSaving(true);
    await saveQuizResponse(userId, question.id, question.lesson_id, reflectionText.trim(), null);
    setSaving(false);
    setCommitted(true);
    setAnswered(true);
  };

  const handleCheckpointContinue = async () => {
    setSaving(true);
    await saveQuizResponse(userId, question.id, question.lesson_id, 'Reviewed', null);
    setSaving(false);
    setAnswered(true);
    setGateCleared(true);
    onGateCleared();
  };

  const handleContinue = () => {
    setGateCleared(true);
    onGateCleared();
  };

  // Wrapping gate-inner card style
  const gateInnerStyle: React.CSSProperties = {
    background: dark ? '#1E2233' : 'white',
    borderRadius: 16,
    padding: '40px 44px',
    boxShadow: '0 4px 24px rgba(30,39,73,0.08)',
    borderLeft: '4px solid #E8B84B',
    maxWidth: 600,
    width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' as const,
    color: '#E8B84B', marginBottom: 8, fontFamily: "'DM Sans', sans-serif",
  };

  const headerStyle: React.CSSProperties = {
    fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 24, fontWeight: 600,
    color: dark ? '#F3F4F6' : '#1E2749', marginBottom: 8, lineHeight: 1.3,
  };

  const questionStyle: React.CSSProperties = {
    fontSize: 15, lineHeight: 1.7, color: dark ? '#D1D5DB' : '#4B5563',
    marginBottom: 20, fontFamily: "'DM Sans', sans-serif",
  };

  const continueButtonStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    marginTop: 20, padding: '14px 32px', background: '#E8B84B',
    color: '#1E2749', border: 'none', borderRadius: 12,
    fontSize: 15, fontWeight: 700, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  };

  // Multiple choice / True-false gate
  if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
    const options: QuizOption[] =
      question.question_type === 'true_false'
        ? [{ text: 'True' }, { text: 'False' }]
        : (question.options as QuizOption[]) || [];

    const correctIndex =
      question.question_type === 'true_false'
        ? question.correct_answer?.toLowerCase() === 'true' ? 0 : 1
        : options.findIndex((o) => o.is_correct);

    return (
      <div style={{ width: '100%', maxWidth: 780, display: 'flex', flexDirection: 'column' }}>
        <div style={gateInnerStyle}>
          <div style={labelStyle}>{label}</div>
          <h2 style={headerStyle}>{header}</h2>
          <p style={questionStyle}>{question.question_text}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {options.map((option, idx) => {
              let borderColor = dark ? 'rgba(255,255,255,0.15)' : '#E5E7EB';
              let bg = dark ? 'rgba(255,255,255,0.05)' : '#FAFBFC';
              let textColor = dark ? '#E5E7EB' : '#1E2749';

              if (answered) {
                if (idx === correctIndex) {
                  borderColor = '#22C55E';
                  bg = dark ? 'rgba(34,197,94,0.1)' : '#F0FDF4';
                  textColor = '#166534';
                }
                if (idx === selectedIndex && idx !== correctIndex) {
                  borderColor = '#EF4444';
                  bg = dark ? 'rgba(239,68,68,0.1)' : '#FEF2F2';
                  textColor = '#991B1B';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() =>
                    question.question_type === 'true_false'
                      ? handleTrueFalseSelect(option.text)
                      : handleMultipleChoiceSelect(idx)
                  }
                  disabled={answered}
                  style={{
                    display: 'block', width: '100%', padding: '14px 18px',
                    background: bg, border: `1.5px solid ${borderColor}`,
                    borderRadius: 10, fontSize: 14, color: textColor,
                    cursor: answered ? 'default' : 'pointer', textAlign: 'left' as const,
                    fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
                    opacity: answered && idx !== selectedIndex && idx !== correctIndex ? 0.5 : 1,
                  }}
                >
                  {option.text}
                </button>
              );
            })}
          </div>

          {answered && question.explanation && (
            <div style={{
              background: dark ? 'rgba(34,197,94,0.1)' : '#F0FDF4', borderRadius: 10,
              padding: '16px 20px', marginTop: 12, fontSize: 14, lineHeight: 1.6,
              color: dark ? '#86EFAC' : '#166534', fontFamily: "'DM Sans', sans-serif",
            }}>
              {question.explanation}
            </div>
          )}

          {answered && !gateCleared && wasCorrect && (
            <button onClick={handleContinue} style={continueButtonStyle}>
              You got it. {advanceLabel}.
              <ArrowRight size={16} />
            </button>
          )}

          {answered && !gateCleared && !wasCorrect && (
            <div style={{ marginTop: 20 }}>
              {!wrongReflectionSaved ? (
                <>
                  <p style={{
                    fontSize: 15, fontWeight: 600, color: dark ? '#F3F4F6' : '#1E2749',
                    fontFamily: "'Source Serif 4', Georgia, serif", marginBottom: 8,
                  }}>
                    Make this yours.
                  </p>
                  <p style={{
                    fontSize: 14, color: dark ? '#D1D5DB' : '#4B5563',
                    fontFamily: "'DM Sans', sans-serif", marginBottom: 14, lineHeight: 1.6,
                  }}>
                    How does this connect to your classroom? One or two sentences is all it takes.
                  </p>
                  <textarea
                    value={wrongReflection}
                    onChange={(e) => setWrongReflection(e.target.value)}
                    placeholder="Connect this to something you have experienced or want to try..."
                    style={{
                      width: '100%', padding: 14, minHeight: 80,
                      background: dark ? 'rgba(255,255,255,0.04)' : 'white',
                      border: `1.5px solid ${dark ? 'rgba(255,255,255,0.12)' : '#E5E7EB'}`,
                      borderRadius: 12, color: dark ? '#E5E7EB' : '#1E2749',
                      fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                      lineHeight: 1.6, resize: 'none' as const,
                    }}
                  />
                  {wrongReflectionError && (
                    <div style={{
                      marginTop: 10, fontSize: 13, lineHeight: 1.5,
                      color: dark ? '#FCA5A5' : '#B91C1C', fontFamily: "'DM Sans', sans-serif",
                    }}>
                      That did not save. Check your connection and try again, and copy your
                      words somewhere safe first so you do not lose them.
                    </div>
                  )}
                  <button
                    onClick={async () => {
                      if (wrongReflection.trim().length < 10) return;
                      // Only move on if the reflection actually landed. Telling an
                      // educator their words were kept when they were not is worse
                      // than asking them to try again.
                      const saved = await saveFollowUpReflection(userId, question.id, wrongReflection.trim());
                      setWrongReflectionError(!saved);
                      setWrongReflectionSaved(saved);
                    }}
                    disabled={wrongReflection.trim().length < 10}
                    style={{
                      marginTop: 10, padding: '10px 24px',
                      background: wrongReflection.trim().length >= 10 ? (dark ? 'rgba(255,255,255,0.08)' : 'white') : 'transparent',
                      border: `1.5px solid ${wrongReflection.trim().length >= 10 ? (dark ? 'rgba(255,255,255,0.15)' : '#E5E7EB') : 'transparent'}`,
                      borderRadius: 10, color: wrongReflection.trim().length >= 10 ? (dark ? '#E5E7EB' : '#4B5563') : (dark ? '#6B7280' : '#D1D5DB'),
                      fontSize: 14, fontWeight: 500, cursor: wrongReflection.trim().length >= 10 ? 'pointer' : 'default',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Save
                  </button>
                </>
              ) : (
                <button onClick={handleContinue} style={continueButtonStyle}>
                  Nice reflection. {advanceLabel}.
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Reflection gate
  if (question.question_type === 'reflection') {
    return (
      <div style={{ width: '100%', maxWidth: 780, display: 'flex', flexDirection: 'column' }}>
        <div style={gateInnerStyle}>
          <div style={labelStyle}>{label}</div>
          <h2 style={headerStyle}>{header}</h2>
          <p style={questionStyle}>{question.question_text}</p>

          {!answered ? (
            <>
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="Write your reflection here..."
                style={{
                  width: '100%', padding: 16, minHeight: 120,
                  background: dark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                  border: `1.5px solid ${dark ? 'rgba(255,255,255,0.15)' : '#E5E7EB'}`,
                  borderRadius: 12, color: dark ? '#E5E7EB' : '#1E2749',
                  fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                  lineHeight: 1.6, resize: 'none' as const, outline: 'none',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#E8B84B'; }}
                onBlur={(e) => { e.target.style.borderColor = dark ? 'rgba(255,255,255,0.15)' : '#E5E7EB'; }}
              />
              <div style={{
                fontSize: 12, color: reflectionText.length >= 50 ? '#16A34A' : '#9CA3AF',
                marginTop: 6, fontFamily: "'DM Sans', sans-serif",
              }}>
                {reflectionText.length}/50 characters minimum. This is just for you. We will never share your reflections.
              </div>
              <button
                onClick={handleSaveReflection}
                disabled={reflectionText.trim().length < 50 || saving}
                style={{
                  marginTop: 14, padding: '12px 28px',
                  background: reflectionText.trim().length >= 50 ? (dark ? 'rgba(255,255,255,0.08)' : 'white') : (dark ? 'rgba(255,255,255,0.03)' : '#F9FAFB'),
                  border: `1.5px solid ${reflectionText.trim().length >= 50 ? (dark ? 'rgba(255,255,255,0.2)' : '#D1D5DB') : (dark ? 'rgba(255,255,255,0.08)' : '#E5E7EB')}`,
                  borderRadius: 10, color: reflectionText.trim().length >= 50 ? (dark ? '#E5E7EB' : '#374151') : '#9CA3AF',
                  fontSize: 14, fontWeight: 500, cursor: reflectionText.trim().length >= 50 ? 'pointer' : 'not-allowed',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {saving ? 'Saving...' : 'Save Reflection'}
              </button>
            </>
          ) : !gateCleared ? (
            <button onClick={handleContinue} style={continueButtonStyle}>
              Nice. {advanceLabel}.
              <ArrowRight size={16} />
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  // Action step gate
  if (question.question_type === 'action_step') {
    return (
      <div style={{ width: '100%', maxWidth: 780, display: 'flex', flexDirection: 'column' }}>
        <div style={gateInnerStyle}>
          <div style={labelStyle}>{label}</div>
          <h2 style={headerStyle}>{header}</h2>

          <div style={{
            background: dark ? 'rgba(232,184,75,0.08)' : '#FEF9EE',
            border: `1px solid ${dark ? 'rgba(232,184,75,0.2)' : '#FDE68A'}`,
            borderLeft: '4px solid #E8B84B',
            borderRadius: '0 12px 12px 0', padding: '20px 24px', marginBottom: 20,
            fontSize: 15, lineHeight: 1.7, color: dark ? '#D1D5DB' : '#4B5563',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {question.question_text}
          </div>

          {!committed ? (
            <>
              <p style={{
                fontSize: 15, fontWeight: 600, color: dark ? '#F3F4F6' : '#1E2749',
                fontFamily: "'Source Serif 4', Georgia, serif", marginBottom: 8,
              }}>
                Your plan
              </p>
              <p style={{
                fontSize: 14, color: dark ? '#D1D5DB' : '#4B5563',
                fontFamily: "'DM Sans', sans-serif", marginBottom: 14, lineHeight: 1.6,
              }}>
                What will you try, and when? Naming the day and the class period is what turns
                a good idea into something that actually happens.
              </p>
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                placeholder="On Tuesday during my third period class, I will..."
                style={{
                  width: '100%', padding: 16, minHeight: 100,
                  background: dark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                  border: `1.5px solid ${dark ? 'rgba(255,255,255,0.15)' : '#E5E7EB'}`,
                  borderRadius: 12, color: dark ? '#E5E7EB' : '#1E2749',
                  fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                  lineHeight: 1.6, resize: 'none' as const, outline: 'none',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#E8B84B'; }}
                onBlur={(e) => { e.target.style.borderColor = dark ? 'rgba(255,255,255,0.15)' : '#E5E7EB'; }}
              />
              <div style={{
                fontSize: 12, color: reflectionText.trim().length >= 30 ? '#16A34A' : '#9CA3AF',
                marginTop: 6, fontFamily: "'DM Sans', sans-serif",
              }}>
                {reflectionText.trim().length}/30 characters minimum. This is yours. We will never share it.
              </div>
              <button
                onClick={handleActionCommit}
                disabled={reflectionText.trim().length < 30 || saving}
                style={{
                  marginTop: 14, padding: '14px 32px',
                  background: dark ? 'rgba(255,255,255,0.05)' : 'white',
                  border: `2px solid ${reflectionText.trim().length >= 30 ? '#E8B84B' : (dark ? 'rgba(255,255,255,0.12)' : '#E5E7EB')}`,
                  borderRadius: 12,
                  color: reflectionText.trim().length >= 30 ? (dark ? '#E8B84B' : '#92400E') : '#9CA3AF',
                  fontSize: 15, fontWeight: 600,
                  cursor: reflectionText.trim().length >= 30 ? 'pointer' : 'not-allowed',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {saving ? 'Saving...' : 'Lock in my plan'}
              </button>
            </>
          ) : !gateCleared ? (
            <button onClick={handleContinue} style={continueButtonStyle}>
              Plan saved. {advanceLabel}.
              <ArrowRight size={16} />
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  // Checkpoint gate
  if (question.question_type === 'checkpoint') {
    const takeaways: string[] = [];
    if (question.options && Array.isArray(question.options)) {
      question.options.forEach((opt: QuizOption) => {
        if (opt.text) takeaways.push(opt.text);
      });
    }
    if (takeaways.length === 0 && question.question_text) {
      question.question_text.split('\n').filter(Boolean).forEach((line) => takeaways.push(line));
    }

    return (
      <div style={{ width: '100%', maxWidth: 780, display: 'flex', flexDirection: 'column' }}>
        <div style={gateInnerStyle}>
          <div style={labelStyle}>{label}</div>
          <h2 style={headerStyle}>{header}</h2>

          <div style={{ marginBottom: 20 }}>
            {takeaways.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '10px 0', fontSize: 15, lineHeight: 1.6,
                color: dark ? '#D1D5DB' : '#4B5563', fontFamily: "'DM Sans', sans-serif",
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', background: '#E8B84B',
                  flexShrink: 0, marginTop: 8,
                }} />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {!gateCleared && (
            <button
              onClick={handleCheckpointContinue}
              disabled={saving}
              style={continueButtonStyle}
            >
              {saving ? 'Saving...' : isFinalPart ? 'Ready to continue' : 'Next part'}
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// Check-in sequence
//
// One check-in can hold more than one part: a comprehension question to confirm
// the lesson landed, then a reflection or an implementation plan. The parts are
// shown one at a time, in sort_order, and the check-in is not cleared until the
// educator has worked through all of them. Parts they answered on an earlier
// visit are skipped.
// ---------------------------------------------------------------------------

interface GateSequenceProps {
  questions: QuizQuestion[];
  gateNumber: number;
  totalGates: number;
  answeredIds: Set<string>;
  userId: string;
  dark: boolean;
  onGateCleared: () => void;
}

function GateSequence({
  questions,
  gateNumber,
  totalGates,
  answeredIds,
  userId,
  dark,
  onGateCleared,
}: GateSequenceProps) {
  const [clearedInSession, setClearedInSession] = useState<Set<string>>(new Set());

  // Reset when the learner moves to a different check-in.
  const gateKey = questions.map((q) => q.id).join('|');
  const lastGateKeyRef = useRef(gateKey);
  useEffect(() => {
    if (lastGateKeyRef.current !== gateKey) {
      lastGateKeyRef.current = gateKey;
      setClearedInSession(new Set());
    }
  }, [gateKey]);

  const isDone = (q: QuizQuestion) => answeredIds.has(q.id) || clearedInSession.has(q.id);
  const currentPartIndex = questions.findIndex((q) => !isDone(q));

  useEffect(() => {
    if (questions.length > 0 && currentPartIndex === -1) onGateCleared();
    // onGateCleared is stable enough for this purpose; re-running on every
    // render would fire the completion handler repeatedly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPartIndex, questions.length]);

  if (currentPartIndex === -1) return null;

  const question = questions[currentPartIndex];
  const isFinalPart = currentPartIndex === questions.length - 1;

  return (
    <GateCard
      key={question.id}
      question={question}
      label={getGateLabel(gateNumber, totalGates, currentPartIndex, questions.length)}
      isFinalPart={isFinalPart}
      userId={userId}
      dark={dark}
      onGateCleared={() => {
        setClearedInSession((prev) => new Set(prev).add(question.id));
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface LessonPageProps {
  params: Promise<{ slug: string; lesson: string }>;
}

export default function LessonPage({ params }: LessonPageProps) {
  const resolvedParams = use(params);
  const { slug, lesson: lessonSlug } = resolvedParams;
  const router = useRouter();
  const { user } = useHub();
  const { tUI } = useTranslation();
  const { dark, toggle: toggleDark } = useDarkMode();
  const { enabled: autoAdvance } = useAutoAdvance();

  // Data state
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Gate state
  const [courseQuestions, setCourseQuestions] = useState<QuizQuestion[]>([]);
  const [courseResponses, setCourseResponses] = useState<Record<string, QuizResponse>>({});
  const [gates, setGates] = useState<Map<number, QuizQuestion[]>>(new Map());
  const [locallyCleared, setLocallyCleared] = useState<Set<string>>(new Set());

  // UI state
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [transcriptLang, setTranscriptLang] = useState<'en' | 'es'>('en');
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);

  // Video auto-completion
  const videoIframeRef = useRef<HTMLIFrameElement>(null);

  // Progress tracking
  const { progress, certificateEarned, clearCertificateEarned, markLessonStatus, refetch } =
    useProgressTracking(course?.id || null, user?.id || null);

  // Celebration modal
  const [showCelebration, setShowCelebration] = useState(false);

  // ---------------------------------------------------------------------------
  // Fetch course and lesson data
  // ---------------------------------------------------------------------------

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;

      const supabase = getSupabase();
      setIsLoading(true);

      try {
        const { data: courseData, error: courseError } = await supabase
          .from('hub_courses')
          .select('id, slug, title, pd_hours')
          .eq('slug', slug)
          .single();

        if (courseError || !courseData) {
          router.push('/hub/courses');
          return;
        }
        setCourse(courseData);

        const { data: enrollment } = await supabase
          .from('hub_enrollments')
          .select('id')
          .eq('course_id', courseData.id)
          .eq('user_id', user.id)
          .single();

        if (!enrollment) {
          router.push(`/hub/courses/${slug}`);
          return;
        }

        const { data: modulesData } = await supabase
          .from('hub_modules')
          .select('id, title, sort_order')
          .eq('course_id', courseData.id)
          .order('sort_order', { ascending: true });

        const moduleIds = (modulesData || []).map((m) => m.id);

        const { data: lessonsData } = moduleIds.length > 0
          ? await supabase
              .from('hub_lessons')
              .select('id, slug, title, content, estimated_minutes, duration_seconds, type, sort_order, module_id, transcript, transcript_es')
              .in('module_id', moduleIds)
              .order('sort_order', { ascending: true })
          : { data: [] as Lesson[] };

        if (!lessonsData || lessonsData.length === 0) {
          router.push(`/hub/courses/${slug}`);
          return;
        }

        const moduleMap = new Map<string, Module>();
        const unassigned: Lesson[] = [];

        modulesData?.forEach((mod) => {
          moduleMap.set(mod.id, { id: mod.id, title: mod.title, sort_order: mod.sort_order, lessons: [] });
        });

        (lessonsData as Lesson[]).forEach((lesson) => {
          if (lesson.module_id && moduleMap.has(lesson.module_id)) {
            moduleMap.get(lesson.module_id)!.lessons.push(lesson);
          } else {
            unassigned.push(lesson);
          }
        });

        let finalModules = Array.from(moduleMap.values()).sort((a, b) => a.sort_order - b.sort_order);

        if (unassigned.length > 0) {
          if (finalModules.length === 0) {
            finalModules = [{ id: 'default', title: tUI('Course Content'), sort_order: 0, lessons: unassigned }];
          } else {
            finalModules[0].lessons = [...unassigned, ...finalModules[0].lessons];
          }
        }

        setModules(finalModules);
        setExpandedModules(new Set(finalModules.map((m) => m.id)));

        const ordered: Lesson[] = [];
        finalModules.forEach((mod) => mod.lessons.forEach((l) => ordered.push(l)));
        setAllLessons(ordered);

        const current = ordered.find((l) => l.slug === lessonSlug || l.id === lessonSlug);
        if (!current) {
          router.push(`/hub/courses/${slug}`);
          return;
        }
        setCurrentLesson(current);

        const allLessonIds = ordered.map((l) => l.id);
        const allQuestions = await getCourseQuestions(allLessonIds);
        setCourseQuestions(allQuestions);

        const questionIds = allQuestions.map((q) => q.id);
        const responseMap = await getCourseResponses(user.id, questionIds);
        setCourseResponses(responseMap);

        const gateMap = computeGatePositions(allQuestions, ordered.length, allLessonIds);
        setGates(gateMap);

        setLocallyCleared(new Set());
      } catch (error) {
        console.error('Error loading lesson data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [slug, lessonSlug, user?.id, router, tUI]);

  useEffect(() => {
    if (certificateEarned) setShowCelebration(true);
  }, [certificateEarned]);

  // Video auto-completion via the Cloudflare Stream player SDK.
  // The latest progress and callbacks live in a ref so they stay out of the
  // effect deps, otherwise every progress update would tear down and re-attach
  // the player listeners. The ref is updated in an effect rather than during
  // render, which React does not allow.
  const videoTrackingRef = useRef({ progress, markLessonStatus, refetch });

  useEffect(() => {
    videoTrackingRef.current = { progress, markLessonStatus, refetch };
  });

  const currentLessonId = currentLesson?.id ?? null;
  const currentVideoId = currentLesson ? extractVideoId(currentLesson) : null;

  useEffect(() => {
    if (!currentVideoId || !currentLessonId) return;

    let player: CfStreamPlayer | null = null;
    let cancelled = false;

    // A lesson with no row in the progress map has not been started. That
    // happens if the viewer hits play before progress finishes loading.
    const statusOf = (): LessonStatus =>
      videoTrackingRef.current.progress.lessonProgress.get(currentLessonId)?.status ?? 'not_started';

    const handlePlay = () => {
      if (statusOf() === 'not_started') {
        videoTrackingRef.current.markLessonStatus(currentLessonId, 'in_progress');
      }
    };

    const handleEnded = () => {
      if (statusOf() !== 'completed') {
        videoTrackingRef.current
          .markLessonStatus(currentLessonId, 'completed')
          .then(() => videoTrackingRef.current.refetch());
      }
    };

    loadCfStreamSdk()
      .then(() => {
        const iframe = videoIframeRef.current;
        const streamFactory = (window as CfStreamWindow).Stream;
        if (cancelled || !iframe || !streamFactory) return;

        player = streamFactory(iframe);
        player.addEventListener('play', handlePlay);
        player.addEventListener('ended', handleEnded);
      })
      .catch(() => {
        // SDK blocked or offline — the manual "Mark complete" button still works.
      });

    return () => {
      cancelled = true;
      if (player) {
        player.removeEventListener('play', handlePlay);
        player.removeEventListener('ended', handleEnded);
      }
    };
  }, [currentLessonId, currentVideoId]);

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const isLastLesson = currentIndex === allLessons.length - 1;
  const lessonStatus = currentLesson
    ? progress.lessonProgress.get(currentLesson.id)?.status || 'not_started'
    : 'not_started';
  const isComplete = lessonStatus === 'completed';

  // Gate logic. A check-in is cleared only once every one of its parts is done,
  // so a two-part check-in cannot be escaped by answering the first question.
  const gateIndices = Array.from(gates.keys()).sort((a, b) => a - b);
  const isQuestionAnswered = (q: QuizQuestion) =>
    !!courseResponses[q.id] || locallyCleared.has(q.id);
  const isGateCleared = (questions: QuizQuestion[]) => questions.every(isQuestionAnswered);

  const currentGateQuestions = gates.get(currentIndex) || null;
  const isGateActive = currentGateQuestions !== null && !isGateCleared(currentGateQuestions);
  const currentGateNumber = currentGateQuestions ? gateIndices.indexOf(currentIndex) + 1 : 0;
  const answeredQuestionIds = new Set(
    courseQuestions.filter(isQuestionAnswered).map((q) => q.id)
  );

  // The plan they wrote in the final check-in, to hand back to them on the
  // completion screen. Reading it from state they already have avoids another
  // round trip at the exact moment the confetti is firing.
  const completedPlan =
    courseQuestions
      .filter((q) => q.question_type === 'action_step')
      .map((q) => courseResponses[q.id]?.response)
      .filter((r): r is string => !!r && r.trim().length > 0)
      .pop() ?? null;

  // Locked lesson indices (lessons after first uncleared gate)
  const lockedLessonIndices = new Set<number>();
  for (const gateIdx of gateIndices) {
    if (!isGateCleared(gates.get(gateIdx)!)) {
      for (let i = gateIdx + 1; i < allLessons.length; i++) {
        lockedLessonIndices.add(i);
      }
      break;
    }
  }

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  // Activity logging helper
  const logActivity = useCallback(async (action: string, metadata: Record<string, unknown> = {}) => {
    if (!user?.id) return;
    try {
      const supabase = getSupabase();
      // Supabase reports row-level failures in `error` rather than throwing, so
      // both paths need handling or a broken insert disappears silently.
      const { error } = await supabase.from('hub_activity_log').insert({
        user_id: user.id,
        action,
        metadata: {
          ...metadata,
          course_id: course?.id,
          course_title: course?.title,
          lesson_id: currentLesson?.id,
          lesson_title: currentLesson?.title,
          timestamp: new Date().toISOString(),
        },
      });
      if (error) console.warn(`[hub] activity log "${action}" failed:`, error.message);
    } catch (err) {
      console.warn(`[hub] activity log "${action}" threw:`, err);
    }
  }, [user?.id, course?.id, course?.title, currentLesson?.id, currentLesson?.title]);

  // Log lesson viewed on page load
  useEffect(() => {
    if (currentLesson?.id && user?.id && !isLoading) {
      logActivity('lesson_viewed');
    }
  }, [currentLesson?.id, user?.id, isLoading, logActivity]);

  // Resource download handler — tracks download + auto-completes resource lessons
  const handleResourceDownload = async (url: string, filename: string, type: string) => {
    logActivity('resource_downloaded', { resource_url: url, filename, content_type: type });

    // Auto-complete resource-type lessons when user downloads the resource
    if (currentLesson && lessonStatus !== 'completed') {
      await markLessonStatus(currentLesson.id, 'completed');
      await refetch();
    }

    // Let the browser handle the actual download via the <a> tag
  };

  // Transcript download handler
  const handleTranscriptDownload = (lang: string) => {
    logActivity('transcript_downloaded', { language: lang });
  };

  const handleMarkComplete = async () => {
    if (!currentLesson) return;
    await markLessonStatus(currentLesson.id, 'completed');
    await refetch();

    if (autoAdvance && nextLesson && !isGateActive) {
      setTimeout(() => {
        router.push(`/hub/courses/${slug}/${nextLesson.slug || nextLesson.id}`);
      }, 800);
    }
  };

  const handleCompleteCourse = async () => {
    if (!currentLesson) return;
    // Always run this, even when the lesson is already complete. Enrollment
    // rollup and certificate generation both hang off markLessonStatus, so
    // skipping it here made the button a no-op in the normal case: the learner
    // finishes the last lesson, then clears the final check-in, then clicks
    // Complete Course and nothing happens. The upsert writes the same values,
    // and both the activity log and the certificate are already guarded
    // against running twice.
    await markLessonStatus(currentLesson.id, 'completed');
    await refetch();
  };

  const toggleModule = (moduleId: string) => {
    const next = new Set(expandedModules);
    if (next.has(moduleId)) next.delete(moduleId);
    else next.add(moduleId);
    setExpandedModules(next);
  };

  const handleCloseCelebration = () => {
    setShowCelebration(false);
    clearCertificateEarned();
  };

  const handleGateCleared = async () => {
    if (!currentGateQuestions || !currentLesson) return;

    await markLessonStatus(currentLesson.id, 'completed');
    await refetch();
    logActivity('checkin_completed', {
      lesson_id: currentLesson.id,
      question_ids: currentGateQuestions.map((q) => q.id),
      question_types: currentGateQuestions.map((q) => q.question_type),
    });
    setLocallyCleared((prev) => {
      const next = new Set(prev);
      currentGateQuestions.forEach((q) => next.add(q.id));
      return next;
    });

    if (autoAdvance && nextLesson) {
      setTimeout(() => {
        router.push(`/hub/courses/${slug}/${nextLesson.slug || nextLesson.id}`);
      }, 800);
    }
  };

  // ---------------------------------------------------------------------------
  // Theme tokens (v2: warm backgrounds)
  // ---------------------------------------------------------------------------

  const theme = dark
    ? {
        contentBg: 'linear-gradient(180deg, #1A1D24 0%, #14171E 100%)',
        text: '#E5E7EB',
        textMuted: '#9CA3AF',
        sidebar: '#151922',
        card: '#1E2233',
        border: 'rgba(255,255,255,0.08)',
        title: '#F3F4F6',
        progressBg: 'rgba(255,255,255,0.06)',
      }
    : {
        contentBg: 'linear-gradient(180deg, #F5F3EE 0%, #EDE9E3 100%)',
        text: '#374151',
        textMuted: '#9CA3AF',
        sidebar: '#FFFFFF',
        card: '#FFFFFF',
        border: '#F3F4F6',
        title: '#1E2749',
        progressBg: '#E5E7EB',
      };

  // ---------------------------------------------------------------------------
  // Loading skeleton
  // ---------------------------------------------------------------------------

  if (isLoading || !course || !currentLesson) {
    return (
      <div style={{
        height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        background: 'linear-gradient(180deg, #F5F3EE 0%, #EDE9E3 100%)',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ height: 2, background: '#E5E7EB' }} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid #E5E7EB', borderTopColor: '#E8B84B', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const videoId = extractVideoId(currentLesson);
  const resource = extractResource(currentLesson);
  const hasTranscript = !!currentLesson.transcript;
  const hasTranscriptEs = !!currentLesson.transcript_es;
  const durationStr = currentLesson.duration_seconds ? formatDuration(currentLesson.duration_seconds) : '';

  // Flat index lookup for sidebar
  const flatLessonIndex = new Map<string, number>();
  allLessons.forEach((l, idx) => flatLessonIndex.set(l.id, idx));

  // ---------------------------------------------------------------------------
  // Sidebar content (shared between desktop and mobile bottom sheet)
  // ---------------------------------------------------------------------------

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Sidebar header */}
      <div style={{ padding: '16px 18px', borderBottom: `1px solid ${theme.border}`, flexShrink: 0 }}>
        <Link
          href={`/hub/courses/${slug}`}
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 14, fontWeight: 600,
            color: theme.title, textDecoration: 'none', display: 'block', marginBottom: 10,
          }}
        >
          {course.title}
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: theme.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
            {progress.completedLessons + progress.completedChecks} {tUI('of')} {allLessons.length + progress.totalChecks} {tUI('complete')}
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#E8B84B' }}>
            {progress.progressPct}%
          </span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: dark ? 'rgba(255,255,255,0.1)' : '#F3F4F6' }}>
          <div style={{
            height: '100%', borderRadius: 2,
            width: `${progress.progressPct}%`,
            background: progress.isComplete
              ? 'linear-gradient(90deg, #16A34A, #22C55E)'
              : 'linear-gradient(90deg, #E8B84B, #F59E0B)',
            transition: 'width 0.5s',
          }} />
        </div>
      </div>

      {/* Scrollable lesson list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {modules.map((mod) => {
          const isExpanded = expandedModules.has(mod.id);
          const showHeader = modules.length > 1 || mod.title !== tUI('Course Content');

          return (
            <div key={mod.id}>
              {showHeader && (
                <button
                  onClick={() => toggleModule(mod.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 18px', background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left' as const,
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown size={12} style={{ color: theme.textMuted }} />
                  ) : (
                    <ChevronRight size={12} style={{ color: theme.textMuted }} />
                  )}
                  <span style={{
                    fontSize: 10, fontWeight: 600, textTransform: 'uppercase' as const,
                    letterSpacing: '0.06em', color: theme.textMuted,
                  }}>
                    {mod.title}
                  </span>
                </button>
              )}

              {(isExpanded || !showHeader) && mod.lessons.map((l) => {
                const isActive = l.id === currentLesson?.id;
                const isDone = progress.lessonProgress.get(l.id)?.status === 'completed';
                const lessonGlobalIdx = flatLessonIndex.get(l.id) ?? -1;
                const isLocked = lockedLessonIndices.has(lessonGlobalIdx);
                const gateOnThisLesson = gates.get(lessonGlobalIdx);
                const gateIsCleared = gateOnThisLesson ? isGateCleared(gateOnThisLesson) : false;
                const gateNumberHere = gateOnThisLesson ? gateIndices.indexOf(lessonGlobalIdx) + 1 : 0;
                const lessonDuration = l.duration_seconds ? formatDuration(l.duration_seconds) : '';

                return (
                  <div key={l.id}>
                    <button
                      onClick={() => {
                        if (isLocked) return;
                        router.push(`/hub/courses/${slug}/${l.slug || l.id}`);
                        setBottomSheetOpen(false);
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: isActive ? '10px 15px' : '10px 18px', width: '100%',
                        background: isActive ? (dark ? 'rgba(232,184,75,0.12)' : '#FFF8E7') : 'transparent',
                        borderLeft: isActive ? '3px solid #E8B84B' : '3px solid transparent',
                        border: 'none', cursor: isLocked ? 'default' : 'pointer',
                        opacity: isLocked ? 0.3 : 1, textAlign: 'left' as const,
                        transition: 'background 0.15s', fontSize: 13,
                        color: isDone && !isActive ? theme.textMuted : (isActive ? theme.title : (dark ? '#D1D5DB' : '#4B5563')),
                        fontWeight: isActive ? 600 : 400,
                        fontFamily: "'DM Sans', sans-serif",
                        borderRight: 'none', borderTop: 'none', borderBottom: 'none',
                      }}
                    >
                      {/* Number/check circle */}
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: isDone ? 9 : 11, fontWeight: 600,
                        border: isDone ? 'none' : `2px solid ${isActive ? '#E8B84B' : (dark ? 'rgba(255,255,255,0.2)' : '#E5E7EB')}`,
                        background: isDone ? '#22C55E' : (isActive ? (dark ? 'rgba(232,184,75,0.1)' : '#FFFDF7') : 'transparent'),
                        color: isDone ? 'white' : (isActive ? '#E8B84B' : theme.textMuted),
                      }}>
                        {isDone ? <Check size={11} /> : (flatLessonIndex.get(l.id) ?? 0) + 1}
                      </div>

                      {/* Title */}
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                        {l.title}
                      </span>

                      {/* Duration */}
                      {lessonDuration && (
                        <span style={{ fontSize: 10, color: dark ? 'rgba(255,255,255,0.25)' : '#D1D5DB', fontWeight: 500, flexShrink: 0 }}>
                          {lessonDuration}
                        </span>
                      )}
                    </button>

                    {/* Gate indicator between lessons */}
                    {gateOnThisLesson && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '4px 18px 4px 36px', fontSize: 10, fontWeight: 500,
                        color: gateIsCleared ? '#16A34A' : '#B45309',
                      }}>
                        <div style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: gateIsCleared ? '#22C55E' : '#E8B84B',
                        }} />
                        {gateIsCleared
                          ? `Check-in ${gateNumberHere} (done)`
                          : `Check-in ${gateNumberHere} of ${gateIndices.length}`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div style={{
      height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      fontFamily: "'DM Sans', sans-serif", background: dark ? '#0F1219' : '#F0EDE8',
    }}>

      {/* ================================================================ */}
      {/* Progress strip (2px gold gradient)                               */}
      {/* ================================================================ */}
      <div style={{ height: 2, background: theme.progressBg, flexShrink: 0 }}>
        <div style={{
          height: '100%', width: `${progress.progressPct}%`,
          background: 'linear-gradient(90deg, #E8B84B, #F59E0B)',
          transition: 'width 0.5s',
        }} />
      </div>

      {/* ================================================================ */}
      {/* Main area: content + sidebar                                     */}
      {/* ================================================================ */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Content area: centered vertically and horizontally */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '16px 28px',
          background: theme.contentBg,
          overflow: 'auto',
        }}>

          {/* VIDEO/RESOURCE + INLINE CHECK-IN */}
          <div style={{ width: '100%', maxWidth: 780, display: 'flex', flexDirection: 'column' }}>

              {/* Back row */}
              <div style={{ marginBottom: 10 }}>
                <Link
                  href={`/hub/courses/${slug}`}
                  style={{
                    color: '#9CA3AF', textDecoration: 'none', fontSize: 14,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <ArrowLeft size={12} />
                  {course.title}
                </Link>
              </div>

              {/* Title row */}
              <div style={{
                display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                marginBottom: 10,
              }}>
                <div>
                  <h1 style={{
                    fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 28, fontWeight: 600,
                    color: dark ? '#F3F4F6' : '#1E2749', lineHeight: 1.2, margin: 0,
                  }}>
                    {currentLesson.title}
                  </h1>
                  <p style={{
                    fontSize: 14, color: '#9CA3AF', marginTop: 4,
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    {nextLesson
                      ? `Watch, then continue to ${nextLesson.title}`
                      : (isLastLesson ? 'Last lesson in this course' : '')
                    }
                  </p>
                </div>
                <div style={{
                  fontSize: 12, color: '#9CA3AF', textAlign: 'right' as const,
                  whiteSpace: 'nowrap' as const,
                }}>
                  {tUI('Lesson')} {currentIndex + 1} {tUI('of')} {allLessons.length}
                  {durationStr ? ` . ${durationStr}` : ''}
                </div>
              </div>

              {/* Video or Resource */}
              {videoId ? (
                <>
                  <div style={{
                    borderRadius: 12, overflow: 'hidden',
                    boxShadow: '0 4px 24px rgba(30,39,73,0.1)',
                    background: '#000', aspectRatio: '16/9',
                  }}>
                    <iframe
                      ref={videoIframeRef}
                      src={`https://customer-4n38x6badamh5yps.cloudflarestream.com/${videoId}/iframe`}
                      style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  {/* Transcript panel (collapsible below video) */}
                  {transcriptOpen && (hasTranscript || hasTranscriptEs) && (
                    <div style={{
                      background: dark ? '#1E2233' : '#FAFBFC',
                      border: `1px solid ${theme.border}`,
                      borderTop: 'none',
                      borderRadius: '0 0 12px 12px',
                      overflow: 'hidden',
                    }}>
                      <div style={{ padding: '14px 20px' }}>
                        {/* Language tabs */}
                        {hasTranscript && hasTranscriptEs && (
                          <div style={{ display: 'flex', gap: 14, marginBottom: 8, borderBottom: `1px solid ${theme.border}` }}>
                            <button
                              onClick={() => setTranscriptLang('en')}
                              style={{
                                fontSize: 12, color: transcriptLang === 'en' ? theme.title : theme.textMuted,
                                cursor: 'pointer', padding: '4px 0', border: 'none', background: 'none',
                                fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                                borderBottom: transcriptLang === 'en' ? '2px solid #E8B84B' : '2px solid transparent',
                                marginBottom: -1,
                              }}
                            >
                              English
                            </button>
                            <button
                              onClick={() => setTranscriptLang('es')}
                              style={{
                                fontSize: 12, color: transcriptLang === 'es' ? theme.title : theme.textMuted,
                                cursor: 'pointer', padding: '4px 0', border: 'none', background: 'none',
                                fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                                borderBottom: transcriptLang === 'es' ? '2px solid #E8B84B' : '2px solid transparent',
                                marginBottom: -1,
                              }}
                            >
                              Espa&ntilde;ol
                            </button>
                          </div>
                        )}
                        <div style={{
                          fontSize: 12, lineHeight: 1.7, color: dark ? '#9CA3AF' : '#6B7280',
                          maxHeight: 120, overflowY: 'auto', whiteSpace: 'pre-wrap' as const,
                          fontFamily: "'DM Sans', sans-serif",
                        }}>
                          {transcriptLang === 'es' && hasTranscriptEs
                            ? currentLesson.transcript_es
                            : currentLesson.transcript}
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          {hasTranscript && (
                            <a
                              href={`/api/hub/transcripts/${currentLesson.id}?lang=en`}
                              download
                              onClick={() => handleTranscriptDownload('en')}
                              style={{
                                fontSize: 11, color: theme.title, textDecoration: 'none',
                                padding: '3px 10px', border: `1px solid ${theme.border}`,
                                borderRadius: 5, fontFamily: "'DM Sans', sans-serif",
                              }}
                            >
                              English
                            </a>
                          )}
                          {hasTranscriptEs && (
                            <a
                              href={`/api/hub/transcripts/${currentLesson.id}?lang=es`}
                              download
                              onClick={() => handleTranscriptDownload('es')}
                              style={{
                                fontSize: 11, color: theme.title, textDecoration: 'none',
                                padding: '3px 10px', border: `1px solid ${theme.border}`,
                                borderRadius: 5, fontFamily: "'DM Sans', sans-serif",
                              }}
                            >
                              Espa&ntilde;ol
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : resource ? (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: dark ? '#1E2233' : 'white',
                  borderRadius: 12, boxShadow: '0 4px 24px rgba(30,39,73,0.1)',
                  padding: '48px 40px',
                }}>
                  <div style={{ textAlign: 'center' as const, maxWidth: 400 }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: 16, margin: '0 auto 20px',
                      background: dark ? 'rgba(232,184,75,0.1)' : '#FEF9EE',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FileText size={28} style={{ color: '#E8B84B' }} />
                    </div>
                    <p style={{
                      fontSize: 18, fontWeight: 600, color: theme.title,
                      fontFamily: "'Source Serif 4', Georgia, serif", marginBottom: 6,
                    }}>
                      Course Resource Packet
                    </p>
                    <p style={{ fontSize: 13, color: theme.textMuted, marginBottom: 6, lineHeight: 1.6 }}>
                      This is yours. Print it, mark it up, dog-ear the pages, share it with a colleague, stick it on your desk, toss it in your bag. Whatever helps you put these ideas into practice.
                    </p>
                    {resource.fileSize > 0 && (
                      <p style={{ fontSize: 11, color: theme.textMuted, marginBottom: 20, opacity: 0.6 }}>
                        PDF, {formatFileSize(resource.fileSize)}
                      </p>
                    )}
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleResourceDownload(resource.url, resource.filename, resource.contentType)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '12px 28px', background: '#E8B84B', color: '#1E2749',
                        borderRadius: 10, fontSize: 14, fontWeight: 600,
                        textDecoration: 'none', fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      <Download size={16} />
                      Download
                    </a>
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: dark ? '#1E2233' : 'white',
                  borderRadius: 12, boxShadow: '0 4px 24px rgba(30,39,73,0.1)',
                  padding: '48px 40px',
                }}>
                  <p style={{ color: theme.textMuted, fontSize: 14 }}>No content available for this lesson.</p>
                </div>
              )}

              {/* Controls row: directly below video, part of the card */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0', marginTop: 10,
              }}>
                {/* Left controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Mark complete / completed */}
                  {!isComplete ? (
                    <button
                      onClick={handleMarkComplete}
                      style={{
                        padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                        border: '1.5px solid #E8B84B', background: dark ? 'rgba(254,249,238,0.08)' : '#FEF9EE',
                        color: '#92400E',
                        display: 'flex', alignItems: 'center', gap: 6,
                        transition: 'all 0.15s',
                      }}
                    >
                      <Check size={13} />
                      {tUI('Mark complete')}
                    </button>
                  ) : (
                    <span style={{
                      padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                      fontFamily: "'DM Sans', sans-serif",
                      border: '1.5px solid #22C55E', background: dark ? 'rgba(34,197,94,0.08)' : '#F0FDF4',
                      color: '#166534',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <Check size={13} />
                      {tUI('Completed')}
                    </span>
                  )}

                  {/* Transcript toggle */}
                  {videoId && (hasTranscript || hasTranscriptEs) && (
                    <button
                      onClick={() => setTranscriptOpen(!transcriptOpen)}
                      style={{
                        padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                        border: `1.5px solid ${dark ? 'rgba(255,255,255,0.15)' : '#E5E7EB'}`,
                        background: dark ? 'rgba(255,255,255,0.05)' : 'white',
                        color: dark ? '#D1D5DB' : '#4B5563',
                        display: 'flex', alignItems: 'center', gap: 6,
                        transition: 'all 0.15s',
                      }}
                    >
                      <List size={13} />
                      Transcript
                    </button>
                  )}

                  {/* Dark mode toggle */}
                  <button
                    onClick={toggleDark}
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      border: `1.5px solid ${dark ? 'rgba(255,255,255,0.15)' : '#E5E7EB'}`,
                      background: dark ? 'rgba(255,255,255,0.05)' : 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: dark ? '#9CA3AF' : '#6B7280',
                    }}
                    title={dark ? 'Light mode' : 'Dark mode'}
                  >
                    {dark ? <Sun size={14} /> : <Moon size={14} />}
                  </button>
                </div>

                {/* Right controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Prev arrow */}
                  <button
                    onClick={() => prevLesson && router.push(`/hub/courses/${slug}/${prevLesson.slug || prevLesson.id}`)}
                    disabled={!prevLesson}
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      border: `1.5px solid ${dark ? 'rgba(255,255,255,0.15)' : '#E5E7EB'}`,
                      background: dark ? 'rgba(255,255,255,0.05)' : 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: prevLesson ? 'pointer' : 'default',
                      color: dark ? '#9CA3AF' : '#6B7280',
                      opacity: prevLesson ? 1 : 0.25,
                      fontSize: 16,
                    }}
                    title={prevLesson ? `Previous: ${prevLesson.title}` : ''}
                  >
                    <ArrowLeft size={16} />
                  </button>

                  {/* Next button (disabled when a check-in gate needs completing) */}
                  {isLastLesson && progress.isComplete ? (
                    <button
                      onClick={handleCompleteCourse}
                      disabled={isGateActive}
                      style={{
                        background: isGateActive ? '#9CA3AF' : '#E8B84B',
                        border: `1.5px solid ${isGateActive ? '#9CA3AF' : '#E8B84B'}`, borderRadius: 10,
                        padding: '9px 22px', color: '#1E2749', fontSize: 14, fontWeight: 600,
                        cursor: isGateActive ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif",
                        display: 'flex', alignItems: 'center', gap: 6,
                        opacity: isGateActive ? 0.5 : 1,
                      }}
                    >
                      {tUI('Complete Course')}
                      <Check size={14} />
                    </button>
                  ) : nextLesson ? (
                    <button
                      onClick={() => !isGateActive && router.push(`/hub/courses/${slug}/${nextLesson.slug || nextLesson.id}`)}
                      disabled={isGateActive}
                      style={{
                        background: isGateActive ? '#9CA3AF' : '#1E2749',
                        border: `1.5px solid ${isGateActive ? '#9CA3AF' : '#1E2749'}`, borderRadius: 10,
                        padding: '9px 22px', color: 'white', fontSize: 14, fontWeight: 600,
                        cursor: isGateActive ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif",
                        display: 'flex', alignItems: 'center', gap: 6,
                        opacity: isGateActive ? 0.5 : 1,
                      }}
                      title={isGateActive ? 'Complete the check-in below to continue' : ''}
                    >
                      <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                        {nextLesson.title}
                      </span>
                      <ArrowRight size={14} />
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Mobile: course outline button (below controls on small screens) */}
              <div className="lg:hidden" style={{ marginTop: 4 }}>
                <button
                  onClick={() => setBottomSheetOpen(true)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 8, padding: '10px 0', fontSize: 13, fontWeight: 500,
                    background: dark ? 'rgba(255,255,255,0.05)' : 'white',
                    border: `1.5px solid ${dark ? 'rgba(255,255,255,0.15)' : '#E5E7EB'}`,
                    borderRadius: 10,
                    color: theme.title, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <List size={16} />
                  {tUI('Course Outline')}
                </button>
              </div>

              {/* Check-in: renders BELOW the lesson content, not replacing it */}
              {isGateActive && currentGateQuestions && user && (
                <div style={{ marginTop: 24 }}>
                  <GateSequence
                    questions={currentGateQuestions}
                    gateNumber={currentGateNumber}
                    totalGates={gateIndices.length}
                    answeredIds={answeredQuestionIds}
                    userId={user.id}
                    dark={dark}
                    onGateCleared={handleGateCleared}
                  />
                </div>
              )}
            </div>

        </div>

        {/* ================================================================ */}
        {/* Desktop Sidebar (280px, white, right side)                       */}
        {/* ================================================================ */}
        <aside
          className="hidden lg:flex"
          style={{
            width: 280, background: theme.sidebar,
            borderLeft: `1px solid ${theme.border}`,
            flexDirection: 'column', flexShrink: 0, overflow: 'hidden',
          }}
        >
          {sidebarContent}
        </aside>
      </div>

      {/* ================================================================ */}
      {/* Mobile Bottom Sheet                                              */}
      {/* ================================================================ */}
      {bottomSheetOpen && (
        <div className="lg:hidden" style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setBottomSheetOpen(false)}
          />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            borderRadius: '16px 16px 0 0',
            background: theme.sidebar, maxHeight: '70vh',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{
                width: 40, height: 4, borderRadius: 2,
                background: dark ? 'rgba(255,255,255,0.2)' : '#D1D5DB',
              }} />
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 20px 12px',
            }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: theme.title, fontFamily: "'DM Sans', sans-serif" }}>
                {tUI('Course Outline')}
              </span>
              <button
                onClick={() => setBottomSheetOpen(false)}
                style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: theme.textMuted }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 24px' }}>
              {sidebarContent}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* Course Completion Modal                                          */}
      {/* ================================================================ */}
      {showCelebration && certificateEarned && course && (
        <CourseCompletionModal
          isOpen={showCelebration}
          onClose={handleCloseCelebration}
          courseTitle={course.title}
          pdHours={course.pd_hours}
          verificationCode={certificateEarned.verificationCode}
          courseSlug={slug}
          plan={completedPlan}
        />
      )}
    </div>
  );
}
