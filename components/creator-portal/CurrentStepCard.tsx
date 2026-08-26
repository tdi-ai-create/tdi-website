'use client';

import { MilestoneAction } from './MilestoneAction';
import type { Journey } from '@/lib/creator-journey';

/**
 * The one thing a creator is being asked to do, and the control to do it.
 *
 * MilestoneAction used to live inside the phase list, which meant seeing your
 * road and doing the next thing were the same widget. Separating them is the
 * whole point: one step in front of you, the road underneath it.
 *
 * MilestoneAction is not rewritten. It handles ten plus action types and works;
 * this hands it one step and gets out of the way.
 */

const NAVY = '#1e2749';
const YELLOW = '#ffba06';
const BLUE = '#80a4ed';
const CHANGE = '#b4680d';
const INK_2 = '#4d587a';
const INK_3 = '#7e88a6';
const LINE = '#e2e7f2';

function dueLabel(dueOn: string | null): string | null {
  if (!dueOn) return null;
  const d = new Date(`${dueOn}T00:00:00`);
  return `Suggested by ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`;
}

export function CurrentStepCard({
  journey,
  creatorId,
  creatorName,
  onComplete,
  creator,
  teamNotes,
}: {
  journey: Journey;
  creatorId: string;
  creatorName?: string;
  onComplete: () => void;
  teamNotes?: string;
  creator?: Record<string, unknown>;
}) {
  const step = journey.openStep;
  const action = journey.openStepAction;

  // Everything applicable is finished. Say so plainly rather than showing an
  // empty card where a task used to be.
  if (!step || !action) {
    return (
      <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 12, padding: '26px 24px' }}>
        <p style={{ margin: 0, fontSize: 18, fontWeight: 650, color: NAVY, letterSpacing: '-.015em' }}>
          Nothing waiting on you
        </p>
        <p style={{ margin: '8px 0 0', fontSize: 14.5, color: INK_2, lineHeight: 1.55, maxWidth: '52ch' }}>
          Every step on your journey is done. If something new comes up, it will appear here first.
        </p>
      </div>
    );
  }

  const ours = step.ours;
  const changes = step.status === 'changes_requested';
  const inReview = step.status === 'in_review';

  const accent = changes ? CHANGE : ours || inReview ? BLUE : YELLOW;
  const pill = changes ? 'Changes asked' : inReview ? 'With the TDI team' : ours ? 'With the TDI team' : 'Your turn';

  return (
    <div style={{ background: '#fff', border: `1px solid ${LINE}`, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px 16px', borderTop: `3px solid ${accent}` }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', alignItems: 'center' }}>
          <span style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 10, letterSpacing: '.11em', textTransform: 'uppercase',
            fontWeight: 700, color: NAVY, background: accent, borderRadius: 5, padding: '3px 9px',
          }}>
            {pill}
          </span>
          {journey.openStageName && (
            <span style={{ fontSize: 12.5, color: INK_3 }}>{journey.openStageName}</span>
          )}
          {step.round > 0 && (
            <span style={{ fontSize: 12.5, color: CHANGE }}>Round {step.round} of 2</span>
          )}
        </div>

        <h2 style={{ margin: '10px 0 0', fontSize: 24, fontWeight: 670, letterSpacing: '-.022em', color: NAVY, lineHeight: 1.2 }}>
          {step.name}
        </h2>

        {action.description && (
          <p style={{ margin: '8px 0 0', fontSize: 14.5, color: INK_2, lineHeight: 1.55, maxWidth: '58ch' }}>
            {action.description}
          </p>
        )}

        {dueLabel(step.dueOn) && (
          <p style={{ margin: '10px 0 0', fontSize: 13, color: INK_3 }}>
            {dueLabel(step.dueOn)}. This is a suggestion, never a deadline.
          </p>
        )}
      </div>

      <div style={{ padding: '4px 24px 22px' }}>
        <MilestoneAction
          milestone={{
            id: action.id,
            name: action.name,
            action_type: action.action_type ?? undefined,
            action_config: action.action_config ?? undefined,
            status: action.status,
            submitted_value: action.submitted_value,
            team_status_message: action.team_status_message,
          }}
          creatorId={creatorId}
          creatorName={creatorName}
          teamNotes={teamNotes}
          onComplete={onComplete}
          creator={creator as never}
        />
      </div>
    </div>
  );
}
