'use client';

import { useMemo, useState } from 'react';
import { Check, X, Sparkles } from 'lucide-react';
import { parseInteractiveLesson } from '@/lib/hub/lessonContentParsers';

interface Props {
  markdown: string;
  isCompleted: boolean;
  onComplete: () => void;
}

/**
 * Renders `interactive`-type lessons (matching pairs and multiple-choice).
 * The learner steps through each question, gets correct/incorrect feedback with
 * a coaching note, and marks the lesson complete once every question is right.
 */
export default function InteractiveLessonRenderer({ markdown, isCompleted, onComplete }: Props) {
  const parsed = useMemo(() => parseInteractiveLesson(markdown), [markdown]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const correctIds = useMemo(() => {
    const s = new Set<string>();
    for (const q of parsed.questions) {
      const picked = answers[q.id];
      if (picked && q.options.find((o) => o.label === picked)?.isCorrect) s.add(q.id);
    }
    return s;
  }, [answers, parsed.questions]);

  const allCorrect = parsed.questions.length > 0 && correctIds.size === parsed.questions.length;

  const handlePick = (qid: string, label: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: label }));
  };

  // Fallback: structured questions couldn't be extracted (sequence / reveal-only).
  if (!parsed.questions.length) {
    return (
      <FallbackReveal
        markdown={parsed.fallbackMarkdown || markdown}
        isCompleted={isCompleted}
        onComplete={onComplete}
      />
    );
  }

  return (
    <div className="space-y-6">
      {parsed.intro && (
        <div
          className="text-sm leading-relaxed rounded-lg p-4"
          style={{ backgroundColor: '#F9FAFB', color: '#374151', fontFamily: "'DM Sans', sans-serif" }}
        >
          <PlainMarkdown text={parsed.intro} />
        </div>
      )}

      <div className="flex items-center gap-2 text-xs font-medium" style={{ color: '#6B7280' }}>
        <span className="uppercase tracking-wider">
          {parsed.format === 'matching' ? 'Match' : 'Choose the best answer'}
        </span>
        <span>·</span>
        <span>
          {correctIds.size} of {parsed.questions.length} correct
        </span>
      </div>

      {parsed.questions.map((q, idx) => {
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
                style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8' }}
              >
                {idx + 1}
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
                const showAsCorrect = picked && isCorrect;
                const showAsWrong = isPicked && !isCorrect;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    disabled={!!picked && (isRight || isCorrect)}
                    onClick={() => handlePick(q.id, opt.label)}
                    className="w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-colors"
                    style={{
                      borderColor: showAsCorrect ? '#10B981' : showAsWrong ? '#F59E0B' : isPicked ? '#93C5FD' : '#E5E7EB',
                      backgroundColor: showAsCorrect ? '#ECFDF5' : showAsWrong ? '#FEF3C7' : isPicked ? '#EFF6FF' : 'white',
                      cursor: picked && (isRight || isCorrect) ? 'default' : 'pointer',
                    }}
                  >
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold"
                      style={{
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: showAsCorrect ? '#10B981' : showAsWrong ? '#F59E0B' : '#D1D5DB',
                        color: showAsCorrect ? '#10B981' : showAsWrong ? '#B45309' : '#6B7280',
                      }}
                    >
                      {showAsCorrect ? <Check size={14} /> : showAsWrong ? <X size={14} /> : opt.label}
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
                className="mt-4 p-3 rounded-lg text-sm leading-relaxed"
                style={{
                  backgroundColor: isRight ? '#F0FDF4' : '#FFFBEB',
                  color: isRight ? '#065F46' : '#78350F',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <div className="flex items-start gap-2">
                  <span className="font-semibold">
                    {isRight ? 'Correct.' : 'Not quite — try again.'}
                  </span>
                  {q.coachingNote && (
                    <span style={{ color: isRight ? '#047857' : '#92400E' }}>{q.coachingNote}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {allCorrect && !isCompleted && (
        <button
          type="button"
          onClick={onComplete}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm"
          style={{ backgroundColor: '#10B981', color: 'white', fontFamily: "'DM Sans', sans-serif" }}
        >
          <Sparkles size={16} />
          You got them all — mark lesson complete
        </button>
      )}

      {isCompleted && (
        <div
          className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium"
          style={{ backgroundColor: '#D1FAE5', color: '#065F46', fontFamily: "'DM Sans', sans-serif" }}
        >
          <Check size={16} />
          Lesson complete
        </div>
      )}
    </div>
  );
}

/** Minimal reveal-based fallback used when the parser can't structure the content. */
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
        style={{ backgroundColor: '#F9FAFB', color: '#374151', fontFamily: "'DM Sans', sans-serif" }}
      >
        <PlainMarkdown text={markdown} />
      </div>

      {!reviewed && !isCompleted && (
        <button
          type="button"
          onClick={() => setReviewed(true)}
          className="w-full py-3 rounded-lg font-medium text-sm border"
          style={{ borderColor: '#93C5FD', color: '#1D4ED8', fontFamily: "'DM Sans', sans-serif" }}
        >
          I've read this activity end-to-end
        </button>
      )}

      {reviewed && !isCompleted && (
        <button
          type="button"
          onClick={onComplete}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm"
          style={{ backgroundColor: '#10B981', color: 'white', fontFamily: "'DM Sans', sans-serif" }}
        >
          <Check size={16} />
          Mark lesson complete
        </button>
      )}

      {isCompleted && (
        <div
          className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium"
          style={{ backgroundColor: '#D1FAE5', color: '#065F46', fontFamily: "'DM Sans', sans-serif" }}
        >
          <Check size={16} />
          Lesson complete
        </div>
      )}
    </div>
  );
}

/**
 * Lightweight markdown renderer that handles headings, bold, italic, paragraphs,
 * unordered/ordered lists, and tables. Written locally to avoid pulling a
 * markdown dependency into the bundle. Not exhaustive — intended for the
 * curated lesson content in hub_lessons.content.markdown.
 */
export function PlainMarkdown({ text }: { text: string }) {
  const blocks = useMemo(() => splitBlocks(text), [text]);
  return (
    <div className="space-y-3">
      {blocks.map((block, i) => (
        <MarkdownBlock key={i} block={block} />
      ))}
    </div>
  );
}

type Block =
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'divider' }
  | { kind: 'table'; header: string[]; rows: string[][] };

function splitBlocks(text: string): Block[] {
  const lines = text.split('\n');
  const out: Block[] = [];
  let para: string[] = [];
  let ul: string[] | null = null;
  let ol: string[] | null = null;
  let table: { header: string[]; rows: string[][] } | null = null;

  const flushPara = () => {
    if (para.length) {
      out.push({ kind: 'paragraph', text: para.join(' ') });
      para = [];
    }
  };
  const flushUl = () => {
    if (ul) { out.push({ kind: 'ul', items: ul }); ul = null; }
  };
  const flushOl = () => {
    if (ol) { out.push({ kind: 'ol', items: ol }); ol = null; }
  };
  const flushTable = () => {
    if (table) { out.push({ kind: 'table', ...table }); table = null; }
  };
  const flushAll = () => { flushPara(); flushUl(); flushOl(); flushTable(); };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { flushAll(); continue; }
    if (/^---+$/.test(line.trim())) { flushAll(); out.push({ kind: 'divider' }); continue; }

    const h = /^(#{1,6})\s+(.+)$/.exec(line);
    if (h) { flushAll(); out.push({ kind: 'heading', level: h[1].length, text: h[2].trim() }); continue; }

    if (line.startsWith('|') && line.endsWith('|')) {
      flushPara(); flushUl(); flushOl();
      const cells = line.slice(1, -1).split('|').map((c) => c.trim());
      const isSep = cells.every((c) => /^:?-+:?$/.test(c));
      if (!table) {
        if (!isSep) table = { header: cells, rows: [] };
        continue;
      }
      if (isSep) continue;
      table.rows.push(cells);
      continue;
    } else {
      flushTable();
    }

    const uli = /^\s*-\s+(.+)$/.exec(line);
    if (uli) {
      flushPara(); flushOl();
      ul = ul || [];
      ul.push(uli[1]);
      continue;
    }
    const oli = /^\s*(\d+)\.\s+(.+)$/.exec(line);
    if (oli) {
      flushPara(); flushUl();
      ol = ol || [];
      ol.push(oli[2]);
      continue;
    }

    flushUl(); flushOl();
    para.push(line.trim());
  }
  flushAll();
  return out;
}

function MarkdownBlock({ block }: { block: Block }) {
  if (block.kind === 'divider') {
    return <hr className="border-t" style={{ borderColor: '#E5E7EB', margin: '0.5rem 0' }} />;
  }
  if (block.kind === 'heading') {
    const size = block.level === 1 ? '18px' : block.level === 2 ? '16px' : '15px';
    return (
      <p
        style={{
          fontSize: size,
          fontWeight: 700,
          color: '#111827',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <Inline text={block.text} />
      </p>
    );
  }
  if (block.kind === 'paragraph') {
    return (
      <p style={{ color: '#374151', fontFamily: "'DM Sans', sans-serif" }}>
        <Inline text={block.text} />
      </p>
    );
  }
  if (block.kind === 'ul') {
    return (
      <ul className="list-disc pl-5 space-y-1" style={{ color: '#374151' }}>
        {block.items.map((it, i) => (
          <li key={i} style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <Inline text={it} />
          </li>
        ))}
      </ul>
    );
  }
  if (block.kind === 'ol') {
    return (
      <ol className="list-decimal pl-5 space-y-1" style={{ color: '#374151' }}>
        {block.items.map((it, i) => (
          <li key={i} style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <Inline text={it} />
          </li>
        ))}
      </ol>
    );
  }
  if (block.kind === 'table') {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border-collapse" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          <thead>
            <tr style={{ backgroundColor: '#F3F4F6' }}>
              {block.header.map((h, i) => (
                <th key={i} className="text-left p-2 border" style={{ borderColor: '#E5E7EB', color: '#111827' }}>
                  <Inline text={h} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((c, ci) => (
                  <td key={ci} className="p-2 border align-top" style={{ borderColor: '#E5E7EB', color: '#374151' }}>
                    <Inline text={c} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return null;
}

/** Renders inline **bold**, *italic*, and `code`. */
function Inline({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  const re = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > i) parts.push(<span key={key++}>{text.slice(i, m.index)}</span>);
    const tok = m[0];
    if (tok.startsWith('**')) {
      parts.push(<strong key={key++}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith('`')) {
      parts.push(
        <code key={key++} style={{ backgroundColor: '#F3F4F6', padding: '1px 4px', borderRadius: 3 }}>
          {tok.slice(1, -1)}
        </code>
      );
    } else {
      parts.push(<em key={key++}>{tok.slice(1, -1)}</em>);
    }
    i = m.index + tok.length;
  }
  if (i < text.length) parts.push(<span key={key++}>{text.slice(i)}</span>);
  return <>{parts}</>;
}
