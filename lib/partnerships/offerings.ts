/**
 * The four offerings a school can buy.
 *
 * Deliberately separate from `contract_phase`, which is the lifecycle stage a
 * partnership grows through (IGNITE, ACCELERATE, SUSTAIN). A school can be in
 * its first phase on any of the four, so they are different axes and must not
 * be collapsed into one field.
 *
 * `partnerships.offering` is nullable and carries a CHECK constraint allowing
 * null or one of these four values. Null means not recorded yet, which is the
 * honest state for every partnership signed before this model existed.
 */

/**
 * PILOT is not a fifth thing to sell. It is what legacy Hub-only contracts
 * actually were, signed before the four offering model existed, and it is here
 * so those accounts stop being mislabelled as something a school could buy
 * today. Roosevelt School is the first: a Hub pilot on a March 2026 contract,
 * carrying no observation days, no virtual sessions and no exec sessions, which
 * had been sitting under a BLUEPRINT label against a $1,499 deal.
 *
 * Do not offer it. Do not price it. See OFFERING_PRICE below for why it has no
 * list price.
 */
export const OFFERINGS = ['PULSE', 'FOCUS', 'COHORT', 'BLUEPRINT', 'PILOT'] as const;

export type Offering = (typeof OFFERINGS)[number];

/** The four a school can actually buy today. PILOT is legacy and not sellable. */
export const SELLABLE_OFFERINGS = ['PULSE', 'FOCUS', 'COHORT', 'BLUEPRINT'] as const;

/** Display names, matching how the offerings are named on the public site. */
export const OFFERING_LABELS: Record<Offering, string> = {
  PULSE: 'The Pulse',
  FOCUS: 'The Focus',
  COHORT: 'The Cohort',
  BLUEPRINT: 'The Blueprint',
  PILOT: 'Hub Pilot (legacy)',
};

/** Badge colors, one per offering, distinct from the phase badge palette. */
export const OFFERING_COLORS: Record<Offering, string> = {
  PULSE: 'bg-teal-100 text-teal-800',
  FOCUS: 'bg-amber-100 text-amber-800',
  COHORT: 'bg-violet-100 text-violet-800',
  BLUEPRINT: 'bg-indigo-100 text-indigo-800',
  PILOT: 'bg-gray-100 text-gray-700',
};

/** What a leader gets, one line each. Used as helper text on the admin picker. */
export const OFFERING_HINTS: Record<Offering, string> = {
  PULSE: 'A steady signal on how staff are doing',
  FOCUS: 'One priority, with leadership sessions',
  COHORT: 'A group moving through the same work',
  BLUEPRINT: 'The full build, whole staff, for the year',
  PILOT: 'Hub access only, on an old contract. Not sold today',
};

export function isOffering(value: unknown): value is Offering {
  return typeof value === 'string' && (OFFERINGS as readonly string[]).includes(value);
}

/** Label for display. Null and unrecognised values both read as not recorded. */
export function offeringLabel(value: string | null | undefined): string {
  return isOffering(value) ? OFFERING_LABELS[value] : 'Not recorded';
}
