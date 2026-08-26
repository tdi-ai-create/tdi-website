/**
 * Recording what happened to a grant.
 *
 * No grant has ever been marked awarded. Not one, across 38 opportunities.
 * Six denials are recorded and zero awards, so TDI cannot currently answer
 * "how much grant money have we won for schools", which is the only number
 * that says whether any of this works.
 *
 * The reason is not that nobody tried. It is that three separate columns can
 * each claim a grant was awarded, and there is no single correct way to do it:
 *
 *   status         'awarded' | 'denied'
 *   work_state     'awarded' | 'denied'
 *   window_status  'closed_awarded' | 'closed_denied'
 *
 * A person updating one leaves the other two disagreeing. So this is the one
 * place an outcome gets written, and it writes all three together.
 */

export type GrantOutcome = 'awarded' | 'denied';

export type OutcomeFields = {
  status: GrantOutcome;
  work_state: GrantOutcome;
  window_status: 'closed_awarded' | 'closed_denied';
  decision_date: string;
  awarded_amount: number | null;
  denial_reason: string | null;
  waiting_on: 'none';
  updated_at: string;
};

export type OutcomeInput = {
  outcome: GrantOutcome;
  /** The day the funder decided, not the day we found out. */
  decidedOn: string;
  /** Required for an award. An award with no amount cannot be counted. */
  amount?: number | null;
  reason?: string | null;
};

export class OutcomeError extends Error {}

/**
 * Builds the full set of fields for an outcome, or refuses.
 *
 * Refusing matters here. An award recorded without an amount looks like
 * success and contributes nothing to the total, which is worse than not
 * recording it, because it stops anyone asking.
 */
export function buildOutcome(input: OutcomeInput, now: Date = new Date()): OutcomeFields {
  const { outcome, decidedOn, amount, reason } = input;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(decidedOn ?? '')) {
    throw new OutcomeError('A decision date is required, in YYYY-MM-DD form.');
  }

  if (outcome === 'awarded') {
    if (amount == null || !Number.isFinite(amount) || amount <= 0) {
      throw new OutcomeError(
        'An award needs its amount. Without it the grant counts as won and adds nothing to the total, which is how a system ends up reporting zero.'
      );
    }
  }

  if (outcome === 'denied' && !reason?.trim()) {
    throw new OutcomeError(
      'A denial needs a reason. It is the only thing that makes the next application to this funder better.'
    );
  }

  return {
    status: outcome,
    work_state: outcome,
    window_status: outcome === 'awarded' ? 'closed_awarded' : 'closed_denied',
    decision_date: decidedOn,
    awarded_amount: outcome === 'awarded' ? Number(amount) : null,
    denial_reason: outcome === 'denied' ? (reason as string).trim() : null,
    // Nobody is waiting on anything once a funder has decided.
    waiting_on: 'none',
    updated_at: now.toISOString(),
  };
}
