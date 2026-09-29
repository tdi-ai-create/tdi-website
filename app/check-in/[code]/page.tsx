'use client';

/**
 * A staff check-in, opened from a link a school leader shares in a meeting.
 *
 * Built for a phone held in one hand at a staff meeting: every question on one
 * screen, no account, no pagination, big targets, and an obvious way to hand the
 * same device to the next person.
 *
 * Nothing here identifies the respondent and nothing here should ever start to.
 * The questions come from the row, so this file is never edited to add a school.
 */

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import type { CheckinQuestion } from '@/lib/partners/checkin-aggregate';

const TEAL = '#0ABFB8';
const NAVY = '#1A2B4A';

interface CheckinView {
  title: string;
  intro: string | null;
  questions: CheckinQuestion[];
  status: 'open' | 'closed';
}

type Answers = Record<string, string | number>;

export default function CheckinPage() {
  const params = useParams<{ code: string }>();
  const code = params?.code;

  const [checkin, setCheckin] = useState<CheckinView | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!code) return;
    let live = true;

    (async () => {
      try {
        const res = await fetch(`/api/check-in/${encodeURIComponent(code)}`);
        if (!res.ok) {
          if (!live) return;
          setLoadError(
            res.status === 404
              ? 'This check-in link is not valid. Ask whoever sent it for the current link.'
              : 'This check-in could not be loaded. Please try again in a moment.',
          );
          return;
        }
        const data = (await res.json()) as CheckinView;
        if (live) setCheckin(data);
      } catch {
        if (live) setLoadError('This check-in could not be loaded. Please try again in a moment.');
      }
    })();

    return () => {
      live = false;
    };
  }, [code]);

  const setAnswer = useCallback((id: string, value: string | number) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setSubmitError(null);
  }, []);

  const firstUnanswered = checkin?.questions.find(
    (q) => q.required && (answers[q.id] === undefined || answers[q.id] === ''),
  );

  async function submit() {
    if (!code || !checkin || submitting) return;

    if (firstUnanswered) {
      setSubmitError(`One still to go: ${firstUnanswered.label}`);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/check-in/${encodeURIComponent(code)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      const data = (await res.json().catch(() => null)) as { message?: string } | null;

      if (!res.ok) {
        setSubmitError(
          data?.message ?? 'That did not save. Nothing was recorded, so please try again.',
        );
        return;
      }

      setDone(true);
    } catch {
      setSubmitError('That did not save. Nothing was recorded, so please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <Shell>
        <p style={{ fontSize: 18, lineHeight: 1.6 }}>{loadError}</p>
      </Shell>
    );
  }

  if (!checkin) {
    return (
      <Shell>
        <p style={{ fontSize: 18, opacity: 0.8 }}>Loading your check-in...</p>
      </Shell>
    );
  }

  if (checkin.status === 'closed') {
    return (
      <Shell>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>{checkin.title}</h1>
        <p style={{ fontSize: 18, lineHeight: 1.6 }}>
          This check-in is closed, so nothing can be recorded now. If you were asked to fill it in
          today, tell your school leader and they can reopen it.
        </p>
      </Shell>
    );
  }

  if (done) {
    return (
      <Shell>
        <CheckCircle size={48} color={TEAL} style={{ marginBottom: 16 }} />
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>That is it. Thank you.</h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, marginBottom: 28 }}>
          Your answers are anonymous. Only the totals for your whole team are reported, never
          anything you can be picked out of.
        </p>
        {/* A shared laptop being passed around a table is the normal case in a
            staff meeting, so the next person needs an obvious way in. */}
        <button
          type="button"
          onClick={() => {
            setAnswers({});
            setDone(false);
          }}
          style={{
            background: 'transparent',
            border: `2px solid ${TEAL}`,
            color: TEAL,
            borderRadius: 10,
            padding: '14px 22px',
            fontSize: 16,
            fontWeight: 600,
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          Someone else on this device
        </button>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>
        {checkin.title}
      </h1>
      {checkin.intro && (
        <p style={{ fontSize: 17, lineHeight: 1.6, opacity: 0.9, marginBottom: 32 }}>
          {checkin.intro}
        </p>
      )}

      {checkin.questions.map((question, index) => (
        <div
          key={question.id}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 14,
            padding: 20,
            marginBottom: 18,
          }}
        >
          <p style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.45, marginBottom: 16 }}>
            <span style={{ color: TEAL, marginRight: 8 }}>{index + 1}.</span>
            {question.label}
            {!question.required && (
              <span style={{ opacity: 0.55, fontWeight: 400, fontSize: 15 }}> (optional)</span>
            )}
          </p>

          {question.type === 'scale' && (
            <Scale question={question} value={answers[question.id]} onPick={setAnswer} />
          )}

          {question.type === 'choice' && (
            <Choices question={question} value={answers[question.id]} onPick={setAnswer} />
          )}

          {question.type === 'text' && (
            <textarea
              value={String(answers[question.id] ?? '')}
              onChange={(e) => setAnswer(question.id, e.target.value)}
              placeholder={question.placeholder ?? ''}
              rows={3}
              maxLength={2000}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 10,
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: 16,
                padding: 12,
                resize: 'vertical',
              }}
            />
          )}
        </div>
      ))}

      {submitError && (
        <p
          role="alert"
          style={{
            background: 'rgba(220,38,38,0.15)',
            border: '1px solid rgba(248,113,113,0.5)',
            borderRadius: 10,
            padding: 14,
            fontSize: 16,
            marginBottom: 18,
          }}
        >
          {submitError}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={submitting}
        style={{
          width: '100%',
          background: submitting ? 'rgba(10,191,184,0.5)' : TEAL,
          color: NAVY,
          border: 'none',
          borderRadius: 12,
          padding: '18px 24px',
          fontSize: 18,
          fontWeight: 700,
          fontFamily: 'inherit',
          cursor: submitting ? 'default' : 'pointer',
        }}
      >
        {submitting ? 'Sending...' : 'Send my answers'}
      </button>

      <p style={{ fontSize: 14, opacity: 0.6, marginTop: 16, lineHeight: 1.5 }}>
        Anonymous. No name, no email, nothing that identifies you or your classroom.
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 20px 80px' }}>{children}</div>
  );
}

function Scale({
  question,
  value,
  onPick,
}: {
  question: CheckinQuestion;
  value: string | number | undefined;
  onPick: (id: string, value: number) => void;
}) {
  const max = question.max ?? 5;
  const points = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <>
      <div style={{ display: 'flex', gap: 8 }}>
        {points.map((point) => {
          const picked = Number(value) === point;
          return (
            <button
              key={point}
              type="button"
              onClick={() => onPick(question.id, point)}
              aria-pressed={picked}
              style={{
                flex: 1,
                minHeight: 56,
                background: picked ? TEAL : 'rgba(255,255,255,0.07)',
                color: picked ? NAVY : '#fff',
                border: picked ? `2px solid ${TEAL}` : '1px solid rgba(255,255,255,0.2)',
                borderRadius: 10,
                fontSize: 19,
                fontWeight: 700,
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              {point}
            </button>
          );
        })}
      </div>
      {(question.low_label || question.high_label) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            marginTop: 8,
            fontSize: 14,
            opacity: 0.7,
          }}
        >
          <span>{question.low_label}</span>
          <span style={{ textAlign: 'right' }}>{question.high_label}</span>
        </div>
      )}
    </>
  );
}

function Choices({
  question,
  value,
  onPick,
}: {
  question: CheckinQuestion;
  value: string | number | undefined;
  onPick: (id: string, value: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {(question.options ?? []).map((option) => {
        const picked = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onPick(question.id, option)}
            aria-pressed={picked}
            style={{
              textAlign: 'left',
              background: picked ? 'rgba(10,191,184,0.18)' : 'rgba(255,255,255,0.05)',
              border: picked ? `2px solid ${TEAL}` : '1px solid rgba(255,255,255,0.18)',
              borderRadius: 10,
              color: '#fff',
              fontSize: 16,
              fontFamily: 'inherit',
              lineHeight: 1.4,
              padding: '14px 16px',
              cursor: 'pointer',
            }}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
