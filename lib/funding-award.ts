// ---------------------------------------------------------------------------
// What a grant was actually awarded.
//
// Five places answered this and all five got it the same way wrong:
//
//   AwardedTab              sum of amount, headed "$5K awarded across 2 grants"
//   NeedsYouBoard           sum of amount, headed "Awarded, received"
//   the school page         awarded_amount || amount
//   OpportunitiesTab        awarded_amount ?? amount, twice
//   funding-next-actions    awarded_amount ?? amount, now fixed separately
//
// `amount` is what we asked a funder for. `awarded_amount` is what they gave.
// Falling back from the second to the first turns a request into a receipt.
//
// Bella found it on 14 September: "the email says $500 but our site shows
// $5,000". Walmart Spark Good for Saunemin is marked awarded with no amount
// ever recorded, so every one of those screens showed the $5,000 we asked for
// as money received, and the board offered her a button to allocate it.
//
// An unknown award is not the ask. It is unknown, and the honest thing to put
// on screen is that we do not know yet.
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */

/** A grant row, or the camelCase shape the board uses. */
export interface AwardSubject {
  status?: string | null;
  amount?: number | null;
  awarded_amount?: number | null;
  awardedAmount?: number | null;
}

/**
 * What the funder actually gave us, or null when nobody has recorded it.
 *
 * Never falls back to the ask. A caller that wants the ask should say so.
 */
export function awardedAmountOf(opp: AwardSubject): number | null {
  const recorded = opp?.awarded_amount ?? opp?.awardedAmount ?? null;
  if (recorded === null || recorded === undefined) return null;
  const n = Number(recorded);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Marked as won by the school. Says nothing about how much. */
export function isAwarded(opp: AwardSubject): boolean {
  return String(opp?.status) === 'awarded';
}

/**
 * Total actually received across grants.
 *
 * Grants awarded with no figure on file contribute nothing, because adding the
 * ask would overstate the total, which is exactly what produced "$5K awarded"
 * for a $500 grant. `unrecorded` lets a caller say how many are missing rather
 * than quietly presenting a short total as complete.
 */
export function awardedTotal(opps: AwardSubject[]): {
  total: number;
  unrecorded: number;
} {
  let total = 0;
  let unrecorded = 0;
  for (const o of opps) {
    if (!isAwarded(o)) continue;
    const amt = awardedAmountOf(o);
    if (amt === null) unrecorded += 1;
    else total += amt;
  }
  return { total, unrecorded };
}

/**
 * What to show where an award figure would go.
 *
 * Deliberately not a number, so a screen cannot print it as money and cannot
 * add it to anything.
 */
export function awardLabel(opp: AwardSubject): string {
  const amt = awardedAmountOf(opp);
  if (amt !== null) return `$${amt.toLocaleString()}`;
  return isAwarded(opp) ? 'amount not recorded' : 'not awarded';
}

/**
 * The sentence under a total, naming what is missing from it.
 *
 * "$5K awarded across 2 grants" was wrong twice over: the figure was the ask,
 * and it implied both grants were counted when one had no amount at all.
 */
export function awardedSummary(opps: AwardSubject[]): string {
  const { total, unrecorded } = awardedTotal(opps);
  const counted = opps.filter((o) => isAwarded(o) && awardedAmountOf(o) !== null).length;

  if (counted === 0 && unrecorded === 0) return 'Nothing awarded yet.';
  if (counted === 0) {
    return `${unrecorded} grant${unrecorded === 1 ? '' : 's'} awarded, ${
      unrecorded === 1 ? 'amount' : 'amounts'
    } not recorded yet.`;
  }

  const money = `$${total.toLocaleString()}`;
  const base = `${money} across ${counted} grant${counted === 1 ? '' : 's'}.`;
  return unrecorded > 0
    ? `${base} ${unrecorded} more awarded with no amount recorded, so this total is incomplete.`
    : base;
}
