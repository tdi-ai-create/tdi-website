'use client';

import { useMemo, useState } from 'react';
import { Check, KeyRound, Lightbulb, Sparkles } from 'lucide-react';
import { parseEscapeRoomStage } from '@/lib/hub/lessonContentParsers';
import { PlainMarkdown } from './InteractiveLessonRenderer';

interface Props {
  markdown: string;
  isCompleted: boolean;
  onComplete: () => void;
  // Progress across the whole course/module tree — used to render the "Stage X of N" indicator.
  stageIndex?: number; // 1-based
  stageTotal?: number;
}

/**
 * Renders `escape-room-stage`-type lessons. Each stage is one puzzle with an
 * unlock code (digits like "3907" or a word like "PEACE"). The learner answers
 * per-scenario multiple choice, entering the code to unlock and complete the
 * stage. When all stages in the course are unlocked, existing course progress
 * marks the module/course complete.
 */
export default function EscapeRoomStageRenderer({
  markdown,
  isCompleted,
  onComplete,
  stageIndex,
  stageTotal,
}: Props) {
  const parsed = useMemo(() => parseEscapeRoomStage(markdown), [markdown]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [code, setCode] = useState('');
  const [wrongTries, setWrongTries] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const correctIds = useMemo(() => {
    const s = new Set<string>();
    for (const q of parsed.scenarios) {
      const picked = answers[q.id];
      if (picked && q.options.find((o) => o.label === picked)?.isCorrect) s.add(q.id);
    }
    return s;
  }, [answers, parsed.scenarios]);

  const allCorrect = parsed.scenarios.length > 0 && correctIds.size === parsed.scenarios.length;

  // No structured scenarios AND no unlock code → fallback reveal
  if (!parsed.scenarios.length && !parsed.unlockCode) {
    return <FallbackReveal
      markdown={parsed.fallbackMarkdown || markdown}
      isCompleted={isCompleted}
      onComplete={onComplete}
      stageIndex={stageIndex}
      stageTotal={stageTotal}
    />;
  }

  const handlePick = (qid: string, label: string) => setAnswers((prev) => ({ ...prev, [qid]: label }));

  const handleSubmit = () => {
    const target = parsed.unlockCode.toUpperCase();
    const guess = code.trim().replace(/[\s—\-–,]/g, '').toUpperCase();
    if (guess === target) {
      setUnlocked(true);
    } else {
      setWrongTries((n) => n + 1);
    }
  };

  const isDigitLock = /^\d+$/.test(parsed.unlockCode);
  const codeHint = isDigitLock
    ? `${parsed.unlockCode.length}-digit code`
    : `${parsed.unlockCode.length}-letter word`;

  return (
    <div className="space-y-6">
      <StageHeader stageIndex={stageIndex} stageTotal={stageTotal} />

      {parsed.intro && (
        <div
          className="rounded-lg p-4 text-sm leading-relaxed"
          style={{
            backgroundColor: '#FAF5FF',
            borderLeft: '3px solid #7C3AED',
            color: '#4C1D95',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <PlainMarkdown text={parsed.intro} />
        </div>
      )}

      {parsed.scenarios.length > 0 && (
        <>
          <div className="flex items-center gap-2 text-xs font-medium" style={{ color: '#6B7280' }}>
            <span className="uppercase tracking-wider">Solve each scenario to reveal the code</span>
            <span>·</span>
            <span>
              {correctIds.size} of {parsed.scenarios.length} solved
            </span>
          </div>

          {parsed.scenarios.map((q, idx) => {
            const picked = answers[q.id];
            const pickedOpt = picked ? q.options.find((o) => o.label === picked) : undefined;
            const isRight = pickedOpt?.isCorrect;
            return (
              <div
                key={q.id}
                className="rounded-xl border p-5"
                style={{
                  borderColor: isRight ? '#10B981' : picked ? '#F59E0B' : '#E5E7EB',
                  backgroundColor: 'white',
                }}
              >
                <div className="flex items-baseline gap-2 mb-3">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#F5F3FF', color: '#6D28D9' }}
                  >
                    Scenario {idx + 1}
                  </span>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: '#111827', fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {q.prompt}
                  </p>
                </div>

                <div className="space-y-2 mt-3">
                  {q.options.map((opt) => {
                    const isPicked = picked === opt.label;
                    const isCorrect = opt.isCorrect;
                    const showCorrect = picked && isCorrect;
                    const showWrong = isPicked && !isCorrect;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        disabled={!!picked && (isRight || isCorrect)}
                        onClick={() => handlePick(q.id, opt.label)}
                        className="w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-colors"
                        style={{
                          borderColor: showCorrect ? '#10B981' : showWrong ? '#F59E0B' : isPicked ? '#93C5FD' : '#E5E7EB',
                          backgroundColor: showCorrect ? '#ECFDF5' : showWrong ? '#FEF3C7' : 'white',
                          cursor: picked && (isRight || isCorrect) ? 'default' : 'pointer',
                        }}
                      >
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold"
                          style={{
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: showCorrect ? '#10B981' : showWrong ? '#F59E0B' : '#D1D5DB',
                            color: showCorrect ? '#10B981' : showWrong ? '#B45309' : '#6B7280',
                          }}
                        >
                          {opt.label}
                        </span>
                        <span
                          className="text-sm leading-snug"
                          style={{ color: '#111827', fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {opt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {picked && q.coachingNote && (
                  <div
                    className="mt-3 p-3 rounded-lg text-sm"
                    style={{
                      backgroundColor: isRight ? '#F0FDF4' : '#FFFBEB',
                      color: isRight ? '#065F46' : '#78350F',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {q.coachingNote}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* Unlock panel */}
      <div
        className="rounded-xl p-5 space-y-3"
        style={{
          background: unlocked
            ? 'linear-gradient(135deg, #ECFDF5, #F0FDF4)'
            : 'linear-gradient(135deg, #1B2A4A, #2B3A67)',
          color: unlocked ? '#065F46' : 'white',
        }}
      >
        <div className="flex items-center gap-2">
          {unlocked ? <Check size={20} /> : <KeyRound size={20} />}
          <p className="font-bold text-sm uppercase tracking-wider" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {unlocked ? 'Stage unlocked' : 'Enter unlock code'}
          </p>
        </div>

        {!unlocked && (
          <>
            <p className="text-xs opacity-80" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {allCorrect
                ? `Assemble the ${codeHint} from your correct answers.`
                : `Solve every scenario above, then enter the ${codeHint} below.`}
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={isDigitLock ? '0000' : 'PEACE'}
                maxLength={parsed.unlockCode.length + 4}
                inputMode={isDigitLock ? 'numeric' : 'text'}
                className="flex-1 px-4 py-3 rounded-lg font-mono text-lg tracking-widest text-center"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  fontFamily: "'DM Mono', monospace",
                }}
              />
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!code.trim()}
                className="px-6 py-3 rounded-lg font-semibold text-sm"
                style={{
                  backgroundColor: '#E8B84B',
                  color: '#1B2A4A',
                  fontFamily: "'DM Sans', sans-serif",
                  opacity: code.trim() ? 1 : 0.5,
                }}
              >
                Try code
              </button>
            </div>

            {wrongTries > 0 && !unlocked && (
              <p className="text-xs" style={{ color: '#FDBA74', fontFamily: "'DM Sans', sans-serif" }}>
                Not quite — {wrongTries} incorrect attempt{wrongTries === 1 ? '' : 's'}.
              </p>
            )}

            {wrongTries >= 2 && parsed.hint && !showHint && (
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="flex items-center gap-2 text-xs underline"
                style={{ color: '#FDE68A', fontFamily: "'DM Sans', sans-serif" }}
              >
                <Lightbulb size={14} />
                Show hint
              </button>
            )}

            {showHint && parsed.hint && (
              <div
                className="text-xs p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(253, 224, 71, 0.15)', color: '#FDE68A', fontFamily: "'DM Sans', sans-serif" }}
              >
                <strong>Hint:</strong> {parsed.hint}
              </div>
            )}
          </>
        )}

        {unlocked && (
          <div>
            <p className="text-sm mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {parsed.completeMessage || `Stage ${stageIndex || ''} unlocked.`}
            </p>
            {!isCompleted ? (
              <button
                type="button"
                onClick={onComplete}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm"
                style={{ backgroundColor: '#10B981', color: 'white', fontFamily: "'DM Sans', sans-serif" }}
              >
                <Sparkles size={16} />
                {stageTotal && stageIndex === stageTotal ? 'Complete the escape room' : 'Continue to next stage'}
              </button>
            ) : (
              <div
                className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium"
                style={{ backgroundColor: '#A7F3D0', color: '#065F46', fontFamily: "'DM Sans', sans-serif" }}
              >
                <Check size={16} />
                Stage complete
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StageHeader({ stageIndex, stageTotal }: { stageIndex?: number; stageTotal?: number }) {
  if (!stageIndex || !stageTotal) return null;
  return (
    <div>
      <p
        className="text-xs font-bold uppercase tracking-wider mb-2"
        style={{ color: '#6D28D9', fontFamily: "'DM Sans', sans-serif" }}
      >
        Stage {stageIndex} of {stageTotal}
      </p>
      <div className="flex gap-1">
        {Array.from({ length: stageTotal }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1.5 rounded-full transition-colors"
            style={{
              backgroundColor: i + 1 <= stageIndex ? '#7C3AED' : '#E5E7EB',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function FallbackReveal({
  markdown,
  isCompleted,
  onComplete,
  stageIndex,
  stageTotal,
}: {
  markdown: string;
  isCompleted: boolean;
  onComplete: () => void;
  stageIndex?: number;
  stageTotal?: number;
}) {
  const [reviewed, setReviewed] = useState(false);
  return (
    <div className="space-y-6">
      <StageHeader stageIndex={stageIndex} stageTotal={stageTotal} />
      <div className="rounded-lg p-4 text-sm" style={{ backgroundColor: '#F9FAFB', color: '#374151' }}>
        <PlainMarkdown text={markdown} />
      </div>
      {!reviewed && !isCompleted && (
        <button
          type="button"
          onClick={() => setReviewed(true)}
          className="w-full py-3 rounded-lg font-medium text-sm border"
          style={{ borderColor: '#93C5FD', color: '#1D4ED8' }}
        >
          I've solved this stage
        </button>
      )}
      {reviewed && !isCompleted && (
        <button
          type="button"
          onClick={onComplete}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm"
          style={{ backgroundColor: '#10B981', color: 'white' }}
        >
          <Check size={16} />
          Mark stage complete
        </button>
      )}
      {isCompleted && (
        <div
          className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium"
          style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}
        >
          <Check size={16} />
          Stage complete
        </div>
      )}
    </div>
  );
}
