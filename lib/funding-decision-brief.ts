// ---------------------------------------------------------------------------
// A decision you can answer, rather than a decision you have to research.
//
// Two items sat on Rae's list on Saunemin, both titled only "<grant>: decide
// whether to keep pursuing it", both due 15 September, both untouched. To
// answer either one she would have had to go and find out the three things the
// answer depends on. So they sat, and one of them was the largest opportunity
// on the account with its window already showing closed.
//
// The dead-end item already carries the research agent's note and the three
// options. What it never carried is the state of the facts the choice turns on:
//
//   is the window actually open, and when does it shut
//   how much is on the table
//   does this funder's model pay for the services we deliver
//
// Those are on the row. Printing them turns a research task into a yes or no.
//
// It also carries a recommendation, because a decision with no recommendation
// is a decision somebody has to build from scratch. The recommendation is never
// the last word: it says what it is based on, so it can be disagreed with
// cheaply.
// ---------------------------------------------------------------------------

import { isWindowOpen, daysUntilClose } from './funding-rules';

/** Everything the brief reads. All of it already sits on the opportunity row. */
export interface BriefSubject {
  name?: string | null;
  amount?: number | string | null;
  window_status?: string | null;
  application_closes?: string | null;
  window_checked_at?: string | null;
  research_status?: string | null;
}

/**
 * Below this, a dead path is not worth a decision from Rae.
 *
 * Assumed at 2,500 on 15 September 2026 and not yet confirmed. It is a single
 * constant so that changing it is a one-line edit rather than a hunt, and
 * nothing enforces it until the auto-stop flag is switched on.
 *
 * A closed window or a funder that does not fund our services is not a
 * judgement call at any amount. Those are facts, and they stop the path on
 * their own.
 */
export const DECISION_THRESHOLD_USD = 2500;

export type Recommendation = 'stop' | 'pursue' | 'ask_rae';

export interface DecisionBrief {
  /** The three facts, each as a line a person reads. */
  facts: string[];
  recommendation: Recommendation;
  /** Why the recommendation says what it says, in one sentence. */
  basis: string;
  /** True when this is small enough to be closed without Rae. */
  belowThreshold: boolean;
}

function amountOf(subject: BriefSubject): number | null {
  if (subject.amount === null || subject.amount === undefined) return null;
  const n = Number(subject.amount);
  return Number.isFinite(n) ? n : null;
}

/**
 * Money on the table, said honestly.
 *
 * Null and zero mean different things and must not be collapsed. Null is "we
 * never recorded it". Zero is what every federal formula programme on these
 * pursuits carries, because the amount is a set-aside nobody has calculated
 * yet, not a grant worth nothing.
 */
function amountLine(subject: BriefSubject): string {
  const n = amountOf(subject);
  if (n === null) return 'Amount: not recorded.';
  if (n === 0) {
    return 'Amount: nothing recorded, which on a formula or set-aside programme means it has not been calculated rather than that it is worth nothing.';
  }
  return `Amount: $${n.toLocaleString('en-US')}.`;
}

function windowLine(subject: BriefSubject, asOf: Date): string {
  const status = subject.window_status ?? 'unknown';

  if (!subject.application_closes) {
    const checked = subject.window_checked_at
      ? `Last checked ${String(subject.window_checked_at).slice(0, 10)}.`
      : 'Nobody has checked it.';
    return `Window: recorded as "${status}" with no closing date, so it cannot be relied on. ${checked}`;
  }

  const closes = String(subject.application_closes).slice(0, 10);
  const days = daysUntilClose({ ...subject, application_closes: closes }, asOf);

  if (!isWindowOpen({ ...subject, application_closes: closes }, asOf)) {
    return `Window: closed ${closes}${days === null ? '' : `, ${Math.abs(days)} days ago`}.`;
  }
  return `Window: open, closing ${closes}${days === null ? '' : ` in ${days} days`}.`;
}

/**
 * Does this funder pay for what we deliver.
 *
 * Read from the name rather than from a field, because there is no field for
 * it. That is a real limitation and the line says so rather than implying a
 * check happened. The one case worth naming is the classroom-materials grant:
 * IAA Foundation failed QA precisely because the award funds materials for the
 * applying teacher and routes nothing to TDI, and it went to the school anyway.
 */
function fundingModelLine(subject: BriefSubject): string {
  const name = (subject.name ?? '').toLowerCase();
  const materialsOnly = /(agriculture in the classroom|cash for classrooms|classroom materials|mini-?grant)/.test(
    name,
  );

  if (materialsOnly) {
    return 'Funding model: likely funds classroom materials for a teacher rather than our contract services, so it may route no money to TDI. Worth confirming before any more work goes in.';
  }
  return 'Funding model: not established. There is no field for this, so nobody has checked whether the award can pay for our services.';
}

export function buildDecisionBrief(
  subject: BriefSubject,
  asOf: Date = new Date(),
): DecisionBrief {
  const amount = amountOf(subject);
  const closes = subject.application_closes
    ? String(subject.application_closes).slice(0, 10)
    : null;
  const windowShut = Boolean(closes) && !isWindowOpen({ ...subject, application_closes: closes }, asOf);
  const materialsOnly = /(agriculture in the classroom|cash for classrooms|classroom materials|mini-?grant)/.test(
    (subject.name ?? '').toLowerCase(),
  );

  const facts = [windowLine(subject, asOf), amountLine(subject), fundingModelLine(subject)];

  // A shut window is not a judgement call. Neither is a funder that cannot pay
  // for what we do. Those decide themselves, and saying so is the point of
  // attaching a recommendation at all.
  if (windowShut) {
    return {
      facts,
      recommendation: 'stop',
      basis: `The window closed on ${closes}, so there is nothing left to submit this cycle. Stopping now keeps the path's history and it can be reopened when the funder next opens.`,
      belowThreshold: true,
    };
  }

  const belowThreshold = amount !== null && amount > 0 && amount < DECISION_THRESHOLD_USD;

  // The materials-only read comes from the grant's name, not from a field, so
  // it is a suspicion and not a fact. Above the threshold that is not enough to
  // stop real money: the concern goes in the basis and the call stays a call.
  // Below it, the suspicion plus the size together are enough.
  if (materialsOnly) {
    const bigEnoughToAsk = amount === null || amount === 0 || amount >= DECISION_THRESHOLD_USD;
    return {
      facts,
      recommendation: bigEnoughToAsk ? 'ask_rae' : 'stop',
      basis: bigEnoughToAsk
        ? `The name suggests this funds classroom materials rather than our services, which would mean it closes none of the funding gap. That read is from the grant's name and not from anything checked, and at this size it is worth confirming before dropping it.`
        : 'The award appears to fund classroom materials rather than our contract services, so winning it would not close the funding gap it was opened against, and it is below the line anyway.',
      belowThreshold,
    };
  }

  if (belowThreshold) {
    return {
      facts,
      recommendation: 'stop',
      basis: `At $${amount.toLocaleString('en-US')} this is below the $${DECISION_THRESHOLD_USD.toLocaleString('en-US')} line, so it is not worth more research time while larger paths are open.`,
      belowThreshold: true,
    };
  }

  return {
    facts,
    recommendation: 'ask_rae',
    basis:
      amount === null || amount === 0
        ? 'The amount is not established, so the size of the prize is unknown and the call is a judgement rather than a calculation.'
        : `At $${amount.toLocaleString('en-US')} this is above the $${DECISION_THRESHOLD_USD.toLocaleString('en-US')} line, so it is worth a decision rather than an automatic stop.`,
    belowThreshold: false,
  };
}

/** The brief as it appears inside an action item's description. */
export function renderDecisionBrief(brief: DecisionBrief): string {
  const verdict =
    brief.recommendation === 'stop'
      ? 'Recommendation: stop pursuing this.'
      : brief.recommendation === 'pursue'
        ? 'Recommendation: keep pursuing this.'
        : 'Recommendation: needs a call, and the facts above are what it turns on.';

  return [
    'What this turns on:',
    ...brief.facts.map(f => `  ${f}`),
    '',
    verdict,
    brief.basis,
  ].join('\n');
}
