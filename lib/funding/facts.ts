/**
 * A fact about a school, with its provenance attached.
 *
 * The grant system used to store facts as bare values in a JSON blob. You saw
 * `educator_count: 23` and could not tell whether it came from the contract,
 * from NCES, from the school, or from someone guessing in May. Every number
 * looked equally trustworthy and they were not. That is how two applications
 * came to cite a 48% reading figure nobody could reproduce.
 *
 * So a fact is no longer a value. It is a value, where it came from, who
 * checked it, and when.
 */

export const FACT_ORIGINS = ['contract', 'researched', 'school_stated'] as const;
export type FactOrigin = (typeof FACT_ORIGINS)[number];

/**
 * Four states, because a blank hides three different situations and they need
 * different actions from a person.
 */
export const FACT_STATUSES = ['known', 'unverified', 'not_checked', 'not_published'] as const;
export type FactStatus = (typeof FACT_STATUSES)[number];

export type SchoolFact = {
  key: string;
  status: FactStatus;
  value: string | null;
  origin: FactOrigin | null;
  source: string | null;
  verifiedOn: string | null;
  verifiedBy: string | null;
};

/**
 * How long a fact stays trustworthy, by kind.
 *
 * Saunemin's proficiency figures are from the 2022-23 cycle and someone
 * hand-wrote a note asking whoever came next to remember to pull the newer
 * one. That is a person doing a machine's job. These are the windows that
 * replace the note.
 */
const FRESHNESS_DAYS: Record<string, number> = {
  reading_proficiency: 365,
  math_proficiency: 365,
  frl_pct: 365,
  iep_students: 365,
  title_i_status: 365,
  atsi_status: 180,
  // Contract facts change only when a contract changes, and that supersedes
  // the fact directly rather than waiting for it to age out.
  educator_count: 730,
  paraprofessionals: 730,
};
const DEFAULT_FRESHNESS_DAYS = 365;

export function isStale(fact: SchoolFact, asOf: Date = new Date()): boolean {
  if (fact.status !== 'known' || !fact.verifiedOn) return false;
  const window = FRESHNESS_DAYS[fact.key] ?? DEFAULT_FRESHNESS_DAYS;
  const checked = new Date(fact.verifiedOn + 'T00:00:00');
  if (Number.isNaN(checked.getTime())) return false;
  const ageDays = (asOf.getTime() - checked.getTime()) / 86_400_000;
  return ageDays > window;
}

/**
 * Can this fact be used in a grant application?
 *
 * Only a known, fresh fact can. An unverified one has a value but no
 * provenance, which is precisely the state that produced the 48% incident, so
 * it is readable everywhere and citeable nowhere.
 */
export function isCiteable(fact: SchoolFact, asOf: Date = new Date()): boolean {
  return fact.status === 'known' && !isStale(fact, asOf);
}

/** Why a fact cannot be cited, in words a person can act on. */
export function blockedReason(fact: SchoolFact, asOf: Date = new Date()): string | null {
  if (fact.status === 'not_checked') return 'Nobody has looked this up yet.';
  if (fact.status === 'not_published') {
    return fact.source ? `Not published. ${fact.source}` : 'Checked, and it is not published anywhere.';
  }
  if (fact.status === 'unverified') {
    return 'We have a value but no record of where it came from. Verify it before citing it.';
  }
  if (isStale(fact, asOf)) {
    const window = FRESHNESS_DAYS[fact.key] ?? DEFAULT_FRESHNESS_DAYS;
    return `Last checked ${fact.verifiedOn}, which is beyond the ${window} day window for this kind of fact.`;
  }
  return null;
}

/** One line a human can read, used on the school record and in QA output. */
export function describe(fact: SchoolFact): string {
  if (fact.status === 'not_checked') return `${fact.key}: not checked yet`;
  if (fact.status === 'not_published') return `${fact.key}: not published`;
  const where =
    fact.origin === 'contract' ? 'from the contract'
    : fact.origin === 'school_stated' ? 'the school told us'
    : fact.origin === 'researched' ? (fact.source ? `researched, ${fact.source}` : 'researched')
    : 'source unknown';
  const when = fact.verifiedOn ? `, checked ${fact.verifiedOn}` : '';
  return `${fact.key}: ${fact.value} · ${where}${when}`;
}
