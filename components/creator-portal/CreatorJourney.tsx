'use client';

import { useState } from 'react';
import type { Journey, JourneyStage, JourneyStep } from '@/lib/creator-journey';

/**
 * The road a creator is on.
 *
 * Eight stages for a course, five for a download, rather than twenty seven
 * tasks. A course is 27 steps and 8 of them are ours, so a flat list reads as
 * homework and overstates their workload by about a third.
 *
 * Only the stage holding their open step is expanded. Everything else is a name
 * and a count, and any of it can be opened if they want to look ahead.
 *
 * Our steps stay visible and marked as ours. A download sitting with Lily for
 * seven days used to be silence, and silence is what made people stop.
 */

const NAVY = '#1e2749';
const YELLOW = '#ffba06';
const BLUE = '#80a4ed';
const PASS = '#1f7a5c';
const CHANGE = '#b4680d';
const INK_2 = '#4d587a';
const INK_3 = '#7e88a6';
const LINE = '#e2e7f2';

function markFor(step: JourneyStep): { glyph: string; color: string } {
  if (step.status === 'complete') return { glyph: '✓', color: PASS };
  if (step.status === 'changes_requested') return { glyph: '●', color: CHANGE };
  if (step.status === 'in_review') return { glyph: '◐', color: BLUE };
  if (step.status === 'open') return { glyph: '●', color: YELLOW };
  // A square for our steps, not a blue circle. Colour alone is not a
  // distinction: it reads the same at a glance and disappears entirely for
  // anyone colourblind. The shape does the work and the colour reinforces it.
  return step.ours ? { glyph: '▪', color: BLUE } : { glyph: '○', color: INK_3 };
}

function StageRow({ stage, expanded, onToggle }: { stage: JourneyStage; expanded: boolean; onToggle: () => void }) {
  const allDone = stage.done === stage.total;
  const glyph = stage.current ? '●' : allDone ? '✓' : '○';
  const glyphColor = stage.current ? YELLOW : allDone ? PASS : INK_3;

  return (
    <div style={{ borderBottom: `1px solid #eef1f7` }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        style={{
          width: '100%', display: 'grid', gridTemplateColumns: '22px 1fr auto',
          gap: 11, alignItems: 'center', padding: '12px 16px',
          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', font: 'inherit',
        }}
      >
        <span aria-hidden style={{ color: glyphColor, fontSize: 13, textAlign: 'center', lineHeight: 1 }}>{glyph}</span>
        <span style={{
          fontSize: 14.5,
          fontWeight: stage.current ? 660 : 560,
          color: stage.current ? NAVY : allDone ? INK_3 : INK_2,
        }}>
          {stage.name}
        </span>
        <span style={{ fontSize: 11.5, color: INK_3, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {stage.done} of {stage.total}
        </span>
      </button>

      {expanded && (
        <div style={{ padding: '0 16px 12px 49px' }}>
          {stage.steps.map((s) => {
            const mark = markFor(s);
            const isNow = s.status === 'open' || s.status === 'changes_requested' || s.status === 'in_review';
            return (
              <div key={s.recordId} style={{ display: 'grid', gridTemplateColumns: '16px 1fr', gap: 9, alignItems: 'baseline', padding: '4px 0', lineHeight: 1.45 }}>
                <span aria-hidden style={{ color: mark.color, fontSize: 11 }}>{mark.glyph}</span>
                <span style={{ fontSize: 13.5, color: isNow ? NAVY : INK_3, fontWeight: isNow ? 620 : 400 }}>
                  {s.name}
                  {s.ours && (
                    <span style={{ fontSize: 9.5, letterSpacing: '.08em', textTransform: 'uppercase', color: BLUE, marginLeft: 7, fontWeight: 700 }}>
                      we do this
                    </span>
                  )}
                  {s.status === 'in_review' && (
                    <span style={{ fontSize: 9.5, letterSpacing: '.08em', textTransform: 'uppercase', color: BLUE, marginLeft: 7, fontWeight: 700 }}>
                      with us
                    </span>
                  )}
                  {s.round > 0 && s.status === 'changes_requested' && (
                    <span style={{ fontSize: 11.5, color: CHANGE, marginLeft: 7 }}>
                      round {s.round} of 2
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CreatorJourney({
  journey,
  /**
   * The rail's heading. Defaults to the creator's own wording; the admin view
   * passes "Their journey" so the same component reads correctly when someone
   * is looking at a creator rather than at themselves. A prop rather than a
   * second copy of the component, because a second copy is exactly how the
   * admin view fell three months behind the portal in the first place.
   */
  heading = 'Your journey',
  /**
   * How the legend names the open step. "you are here" is right when a creator
   * reads their own rail and wrong when an admin reads someone else's.
   */
  hereLabel = 'you are here',
}: {
  journey: Journey;
  heading?: string;
  hereLabel?: string;
}) {
  const currentKey = journey.stages.find((s) => s.current)?.key ?? null;
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set(currentKey ? [currentKey] : []));

  if (journey.stages.length === 0) return null;

  function toggle(key: string) {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  return (
    <div>
      <p style={{
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 10.5, letterSpacing: '.11em', textTransform: 'uppercase',
        color: INK_3, fontWeight: 700, margin: '0 0 10px',
      }}>
        {heading}
        <span style={{ marginLeft: 8, fontWeight: 400 }}>
          {journey.completedSteps} of {journey.totalSteps} done
        </span>
      </p>

      <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 12, overflow: 'hidden' }}>
        {journey.stages.map((stage) => (
          <StageRow
            key={stage.key}
            stage={stage}
            expanded={openKeys.has(stage.key)}
            onToggle={() => toggle(stage.key)}
          />
        ))}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px', padding: '12px 16px', background: '#f4f6fb', borderTop: `1px solid ${LINE}`, fontSize: 12.5, color: INK_3 }}>
          <span><span aria-hidden style={{ color: PASS, fontSize: 11 }}>{'✓'}</span> done</span>
          <span><span aria-hidden style={{ color: YELLOW, fontSize: 11 }}>{'●'}</span> {hereLabel}</span>
          <span><span aria-hidden style={{ color: BLUE, fontSize: 11 }}>{'▪'}</span> we do this</span>
          <span><span aria-hidden style={{ color: INK_3, fontSize: 11 }}>{'○'}</span> still to come</span>
        </div>
      </div>
    </div>
  );
}
