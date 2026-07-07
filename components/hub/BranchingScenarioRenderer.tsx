'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { parseBranchingLesson } from '@/lib/hub/lessonContentParsers';
import { PlainMarkdown } from './InteractiveLessonRenderer';

interface Props {
  markdown: string;
  isCompleted: boolean;
  onComplete: () => void;
}

/**
 * Renders `branching-scenario`-type lessons. The learner reads a setup, then
 * navigates a decision tree by picking options. Each choice shows the outcome
 * plus coaching feedback. Reaching a terminal/optimal path enables the
 * "mark complete" affordance.
 */
export default function BranchingScenarioRenderer({ markdown, isCompleted, onComplete }: Props) {
  const parsed = useMemo(() => parseBranchingLesson(markdown), [markdown]);
  const [pointId, setPointId] = useState<string>(parsed.startPointId);
  const [pickedLabel, setPickedLabel] = useState<string | null>(null);
  const [history, setHistory] = useState<{ pointId: string; picked: string }[]>([]);
  const [showFinal, setShowFinal] = useState(false);

  if (!parsed.points.length) {
    return <FallbackReveal markdown={parsed.fallbackMarkdown || markdown} isCompleted={isCompleted} onComplete={onComplete} />;
  }

  const point = parsed.points.find((p) => p.id === pointId) || parsed.points[0];
  const picked = pickedLabel ? point.options.find((o) => o.label === pickedLabel) : null;

  const handlePick = (label: string) => setPickedLabel(label);

  const handleContinue = () => {
    if (!picked) return;
    const next = picked.nextPointId;
    setHistory((prev) => [...prev, { pointId: point.id, picked: picked.label }]);
    if (next && parsed.points.find((p) => p.id === next)) {
      setPointId(next);
      setPickedLabel(null);
    } else {
      setShowFinal(true);
    }
  };

  const handleBack = () => {
    if (!history.length) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setPointId(last.pointId);
    setPickedLabel(last.picked);
    setShowFinal(false);
  };

  const handleRestart = () => {
    setPointId(parsed.startPointId);
    setPickedLabel(null);
    setHistory([]);
    setShowFinal(false);
  };

  if (showFinal) {
    return (
      <div className="space-y-6">
        <div
          className="rounded-xl p-6 text-center"
          style={{ backgroundColor: '#F0FDF4', border: '1px solid #10B981' }}
        >
          <Sparkles size={32} style={{ color: '#10B981', margin: '0 auto 8px' }} />
          <h3
            className="text-lg font-bold mb-2"
            style={{ color: '#065F46', fontFamily: "'DM Sans', sans-serif" }}
          >
            End of scenario
          </h3>
          <p className="text-sm" style={{ color: '#047857', fontFamily: "'DM Sans', sans-serif" }}>
            You walked {history.length + 1} decision{history.length ? 's' : ''} in this scenario.
          </p>
        </div>

        {parsed.takeaways.length > 0 && (
          <div>
            <p
              className="text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}
            >
              Key Takeaways
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-sm" style={{ color: '#374151' }}>
              {parsed.takeaways.map((t, i) => (
                <li key={i} style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {t}
                </li>
              ))}
            </ol>
          </div>
        )}

        {parsed.reflectionPrompt && (
          <div
            className="rounded-lg p-4 text-sm"
            style={{ backgroundColor: '#FFFBEB', color: '#78350F', fontFamily: "'DM Sans', sans-serif" }}
          >
            <span className="font-semibold">Reflection prompt: </span>
            {parsed.reflectionPrompt}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleRestart}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm border"
            style={{ borderColor: '#D1D5DB', color: '#374151', fontFamily: "'DM Sans', sans-serif" }}
          >
            Walk through again
          </button>
          {!isCompleted ? (
            <button
              type="button"
              onClick={onComplete}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm"
              style={{ backgroundColor: '#10B981', color: 'white', fontFamily: "'DM Sans', sans-serif" }}
            >
              <Check size={16} />
              Mark lesson complete
            </button>
          ) : (
            <div
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium"
              style={{ backgroundColor: '#D1FAE5', color: '#065F46', fontFamily: "'DM Sans', sans-serif" }}
            >
              <Check size={16} />
              Lesson complete
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {parsed.setup && history.length === 0 && (
        <div
          className="rounded-lg p-4 text-sm leading-relaxed"
          style={{
            backgroundColor: '#EFF6FF',
            borderLeft: '3px solid #1D4ED8',
            color: '#1E3A8A',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <p className="font-semibold mb-1">Setup</p>
          <p>{parsed.setup}</p>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs" style={{ color: '#6B7280' }}>
        {history.length > 0 && (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1 hover:text-gray-800"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <ArrowLeft size={14} />
            Back
          </button>
        )}
        <span className="uppercase tracking-wider font-medium">{point.heading}</span>
      </div>

      <p
        className="text-sm md:text-base leading-relaxed font-medium"
        style={{ color: '#111827', fontFamily: "'DM Sans', sans-serif" }}
      >
        {point.prompt}
      </p>

      <div className="space-y-2">
        {point.options.map((opt) => {
          const isPicked = pickedLabel === opt.label;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => handlePick(opt.label)}
              className="w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-colors"
              style={{
                borderColor: isPicked ? '#1D4ED8' : '#E5E7EB',
                backgroundColor: isPicked ? '#EFF6FF' : 'white',
              }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold"
                style={{
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: isPicked ? '#1D4ED8' : '#D1D5DB',
                  color: isPicked ? '#1D4ED8' : '#6B7280',
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

      {picked && (
        <div
          className="rounded-lg p-4 space-y-3"
          style={{
            backgroundColor: picked.isOptimal || picked.isBestPath ? '#F0FDF4' : '#F9FAFB',
            borderLeft: `3px solid ${picked.isOptimal || picked.isBestPath ? '#10B981' : '#9CA3AF'}`,
          }}
        >
          {picked.outcome && (
            <div>
              <p
                className="text-xs font-bold uppercase tracking-wider mb-1"
                style={{ color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}
              >
                Outcome
              </p>
              <p className="text-sm leading-relaxed" style={{ color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>
                {picked.outcome}
              </p>
            </div>
          )}
          {picked.feedback && (
            <div>
              <p
                className="text-xs font-bold uppercase tracking-wider mb-1"
                style={{
                  color: picked.isOptimal || picked.isBestPath ? '#059669' : '#6B7280',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Coaching feedback
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: picked.isOptimal || picked.isBestPath ? '#065F46' : '#374151',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {picked.feedback}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={handleContinue}
            className="w-full py-2.5 rounded-lg font-semibold text-sm"
            style={{
              backgroundColor: '#1D4ED8',
              color: 'white',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {picked.nextPointId ? 'Continue' : 'Finish scenario'}
          </button>
        </div>
      )}
    </div>
  );
}

function FallbackReveal({
  markdown,
  isCompleted,
  onComplete,
}: {
  markdown: string;
  isCompleted: boolean;
  onComplete: () => void;
}) {
  const [reviewed, setReviewed] = useState(false);
  return (
    <div className="space-y-6">
      <div
        className="text-sm leading-relaxed rounded-lg p-4"
        style={{ backgroundColor: '#F9FAFB', color: '#374151' }}
      >
        <PlainMarkdown text={markdown} />
      </div>
      {!reviewed && !isCompleted && (
        <button
          type="button"
          onClick={() => setReviewed(true)}
          className="w-full py-3 rounded-lg font-medium text-sm border"
          style={{ borderColor: '#93C5FD', color: '#1D4ED8' }}
        >
          I've walked through this scenario
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
          Mark lesson complete
        </button>
      )}
      {isCompleted && (
        <div
          className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium"
          style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}
        >
          <Check size={16} />
          Lesson complete
        </div>
      )}
    </div>
  );
}
