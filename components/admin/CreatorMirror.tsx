'use client';

import { CreatorJourney } from '@/components/creator-portal/CreatorJourney';
import type { Journey } from '@/lib/creator-journey';

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
}: {
  journey: Journey | null;
  creatorName: string;
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

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="border-t-4 border-[#ffba06] p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block rounded bg-[#ffba06] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1e2749]">
              {step ? `${firstName}'s turn` : 'Nothing open'}
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
      />
    </div>
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
