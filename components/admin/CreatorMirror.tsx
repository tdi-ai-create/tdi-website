'use client';

import { CreatorJourney } from '@/components/creator-portal/CreatorJourney';
import type { Journey, JourneyStep } from '@/lib/creator-journey';

/**
 * What the creator sees, shown to the admin.
 *
 * The stage rail is not redrawn here. It is the creator's own CreatorJourney
 * component, given the creator's own journey object. That is the whole point:
 * the admin page previously rendered its own view of progress out of raw
 * milestones grouped by database phase, so when the portal moved to stages the
 * admin view silently stayed behind. Importing the component means the next
 * portal change lands here too, without anyone remembering to do it.
 *
 * The open step is summarised rather than rendered with CurrentStepCard, and
 * that is deliberate rather than laziness. CurrentStepCard carries the
 * creator's own controls: submit, upload, confirm. Putting those in front of an
 * admin would let us act as the creator on their own step. Everything shown
 * below still comes from the same `journey` object, so the words stay in sync
 * even though the controls do not.
 */
export function CreatorMirror({
  journey,
  creatorName,
  canEdit = false,
  busyRecordId = null,
  onApprove,
  onRequestRevision,
  onToggleComplete,
}: {
  journey: Journey | null;
  creatorName: string;
  /** False hides every control, so a read-only admin sees the rail alone. */
  canEdit?: boolean;
  /** The record currently being written, so its buttons can be disabled. */
  busyRecordId?: string | null;
  onApprove?: (recordId: string, stepName: string) => void;
  onRequestRevision?: (recordId: string, stepName: string) => void;
  onToggleComplete?: (recordId: string, stepName: string, rawStatus: string) => void;
}) {
  if (!journey || journey.stages.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="text-sm text-gray-500">
          No journey to show. This creator has no active project, so there is
          nothing for them to be looking at either.
        </p>
      </div>
    );
  }

  const step = journey.openStep;
  const firstName = creatorName?.trim().split(/\s+/)[0] || 'They';

  // No drawable step open, but something open is being held off the road. That
  // is a broken board, not a finished one, and it must never be reported as
  // finished. See Journey.strandedOpen.
  const stranded = !step && journey.strandedOpen > 0;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className={`border-t-4 p-5 ${stranded ? 'border-[#9c1f31]' : 'border-[#ffba06]'}`}>
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`inline-block rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                stranded ? 'bg-[#9c1f31] text-white' : 'bg-[#ffba06] text-[#1e2749]'
              }`}
            >
              {step ? `${firstName}'s turn` : stranded ? 'Board needs repair' : 'Nothing open'}
            </span>
            {journey.openStageName && (
              <span className="text-xs text-gray-500">{journey.openStageName}</span>
            )}
          </div>

          {step ? (
            <>
              <h3 className="mb-1 text-lg font-bold text-[#1e2749]">{step.name}</h3>
              {journey.openStepAction?.description && (
                <p className="mb-3 text-sm text-gray-600">
                  {journey.openStepAction.description}
                </p>
              )}
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
                {step.ours && <span>We do this one, not them</span>}
                {step.dueOn && <span>Suggested by {formatDue(step.dueOn)}</span>}
                <span>Round {step.round + 1} of 2</span>
                {step.extensions > 0 && (
                  <span>
                    Moved {step.extensions} {step.extensions === 1 ? 'time' : 'times'}
                  </span>
                )}
              </div>
            </>
          ) : stranded ? (
            <>
              <h3 className="mb-1 text-lg font-bold text-[#9c1f31]">
                {journey.strandedOpen === 1 ? 'A step is open that this journey cannot show' : `${journey.strandedOpen} steps are open that this journey cannot show`}
              </h3>
              <p className="mb-2 text-sm text-gray-600">
                {journey.strandedNames.join(', ')}.{' '}
                {journey.strandedOpen === 1 ? 'It was' : 'They were'} retired,
                collapsed, or belong to the other path, so the road above leaves{' '}
                {journey.strandedOpen === 1 ? 'it' : 'them'} out. This creator is
                not finished. Their board needs placing.
              </p>
              <p className="text-xs text-gray-500">
                The nightly sweep repairs this. If it is still here tomorrow,
                check that the sweep ran.
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-600">
              Every applicable step is finished. There is nothing waiting on
              them and nothing waiting on us.
            </p>
          )}
        </div>
      </div>

      <CreatorJourney
        journey={journey}
        heading="Their journey"
        hereLabel="they are here"
        renderStepControl={
          canEdit
            ? (step) => (
                <StepControls
                  step={step}
                  busy={busyRecordId === step.recordId}
                  onApprove={onApprove}
                  onRequestRevision={onRequestRevision}
                  onToggleComplete={onToggleComplete}
                />
              )
            : undefined
        }
      />
    </div>
  );
}

/**
 * The reviewer's controls, shown inline on the step they belong to.
 *
 * These used to live in a second flat list further down the page, which meant
 * the same sixteen steps were drawn twice under two different sets of names.
 * Approve and Request changes are reviewer actions, not the creator's own
 * submit or upload, so putting them here does not let an admin act as the
 * creator on their step.
 */
function StepControls({
  step,
  busy,
  onApprove,
  onRequestRevision,
  onToggleComplete,
}: {
  step: JourneyStep;
  busy: boolean;
  onApprove?: (recordId: string, stepName: string) => void;
  onRequestRevision?: (recordId: string, stepName: string) => void;
  onToggleComplete?: (recordId: string, stepName: string, rawStatus: string) => void;
}) {
  const awaitingReview = step.rawStatus === 'waiting_approval';
  const locked = step.rawStatus === 'locked';
  const done = step.rawStatus === 'completed';

  const base: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 8px',
    marginLeft: 7,
    borderRadius: 5,
    cursor: busy ? 'default' : 'pointer',
    opacity: busy ? 0.5 : 1,
    verticalAlign: 'middle',
  };

  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      {awaitingReview && onApprove && (
        <button
          type="button"
          disabled={busy}
          onClick={() => onApprove(step.recordId, step.name)}
          style={{ ...base, border: '1px solid #86efac', background: '#f0fdf4', color: '#166534' }}
        >
          Approve
        </button>
      )}
      {awaitingReview && onRequestRevision && (
        <button
          type="button"
          disabled={busy}
          onClick={() => onRequestRevision(step.recordId, step.name)}
          style={{ ...base, border: '1px solid #fcd34d', background: '#fffbeb', color: '#92400e' }}
        >
          Request changes
        </button>
      )}
      {!awaitingReview && !locked && onToggleComplete && (
        <button
          type="button"
          disabled={busy}
          onClick={() => onToggleComplete(step.recordId, step.name, step.rawStatus)}
          style={{ ...base, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280' }}
        >
          {done ? 'Reopen' : 'Mark complete'}
        </button>
      )}
    </span>
  );
}

/**
 * Dates from Postgres `date` columns are date-only. Building a Date from them
 * and formatting in local time renders the day before for anyone west of UTC,
 * which has already been a bug here, so the parts are read directly.
 */
function formatDue(value: string): string {
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return value;
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${d} ${months[m - 1]}`;
}
