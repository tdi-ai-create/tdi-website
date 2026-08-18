/**
 * The stop rule.
 *
 * Checks whether a funding path can win for a given school, before anyone
 * writes a word of it.
 *
 * Why this exists. Julie is currently the first thing in the pipeline that asks
 * that question, and by the time she asks, an agent has written a complete
 * narrative and the school has been told we are working on it. Saunemin spent
 * nine drafting cycles and nine reviews learning three facts that were knowable
 * on day one. St. Peter Chanel was seeded two federal paths that a private
 * school could never apply for at any score.
 *
 * Every rule below exists because it already cost us something. None is
 * speculative.
 *
 * Two design decisions worth knowing, both deliberate:
 *
 * 1. No rule reasons from achievement figures. Two of three live schools carry
 *    proficiency numbers nobody can verify, and one of those cannot ever be
 *    verified because private schools are not in state reporting. A rule that
 *    leans on a number we cannot defend is worse than no rule, and the sound
 *    arguments never needed those numbers anyway: St. Peter Chanel's federal
 *    paths fail on sector, not on score.
 *
 * 2. Every verdict carries its reason in plain words. A block that cannot be
 *    explained is indistinguishable from a bug, and blocking is on from day one.
 */

export type EligibilityVerdict = 'clear' | 'stop' | 'ask_first'

export interface EligibilityResult {
  verdict: EligibilityVerdict
  /** Plain-language reason, shown to a person. Never a rule id. */
  reason: string
  /** Which rule decided it, for debugging and for auditing later. */
  rule: string
  /** What would unblock it, when anything can. */
  unblockedBy?: string
}

export interface SchoolContext {
  sector?: string | null           // public district, diocesan, charter, independent
  county?: string | null
  stateCode?: string | null
  authorizer?: string | null
  titleIStatus?: string | null
  designation?: string | null      // CSI / TSI / ATSI, where one is held
}

export interface PathContext {
  name: string
  windowStatus?: string | null
  namedApplicant?: string | null   // e.g. the NEA member, where one is required
}

/** A private or independent school is not in the state accountability system. */
function isOutsideStateAccountability(sector?: string | null): boolean {
  const s = (sector || '').toLowerCase()
  return s === 'diocesan' || s === 'independent' || s === 'private'
}

/** Paths that only exist for schools identified under state accountability. */
const ACCOUNTABILITY_DEPENDENT = /(Title I Section 1003|School Improvement|Community Schools)/i

/** Paths that cannot be filed without a specific named individual. */
const NEEDS_NAMED_APPLICANT = /(NEA Learning)/i

/** Paths where TDI itself must be an approved vendor before funds can flow. */
const NEEDS_TDI_AUTHORIZATION = /(Title I Section 1003)/i

/**
 * Run every rule against one path. First rule to object wins, and a stop
 * outranks an ask.
 */
export function screenPath(path: PathContext, school: SchoolContext): EligibilityResult {
  // ── Sector ──
  // The strongest rule we have, and it needs no numbers. A school outside the
  // state accountability system cannot carry a CSI, TSI or ATSI identification
  // at any proficiency score, so a path that requires one can never apply.
  if (ACCOUNTABILITY_DEPENDENT.test(path.name) && isOutsideStateAccountability(school.sector)) {
    return {
      verdict: 'stop',
      rule: 'sector',
      reason:
        `${path.name} is only open to schools identified under state accountability. ` +
        `A ${school.sector} school is not in that system at all, so it cannot hold that ` +
        `identification at any level of achievement.`,
    }
  }

  // ── Designation ──
  // For schools that ARE in the system but do not hold the required status.
  // Only fires when we actually know the designation; absence is not evidence.
  if (
    ACCOUNTABILITY_DEPENDENT.test(path.name) &&
    !isOutsideStateAccountability(school.sector) &&
    school.designation !== undefined &&
    school.designation !== null &&
    school.designation.trim() === ''
  ) {
    return {
      verdict: 'ask_first',
      rule: 'designation',
      reason:
        `${path.name} requires a school improvement designation, and none is recorded ` +
        `for this school. Confirm with the district before drafting.`,
      unblockedBy: 'Record the designation, or confirm the school does not hold one.',
    }
  }

  // ── Named applicant ──
  // A question, not a dead end. The member might exist; nobody has asked.
  if (NEEDS_NAMED_APPLICANT.test(path.name) && !path.namedApplicant?.trim()) {
    return {
      verdict: 'ask_first',
      rule: 'named_applicant',
      reason:
        `${path.name} must be filed by a named union member and no name is on file. ` +
        `A draft written now can only use a placeholder, which QA will refuse.`,
      unblockedBy: 'Ask the school for a member name and membership number.',
    }
  }

  // ── Our own authorization ──
  // We can be the blocker. Worth saying out loud rather than discovering late.
  if (NEEDS_TDI_AUTHORIZATION.test(path.name)) {
    return {
      verdict: 'ask_first',
      rule: 'tdi_authorization',
      reason:
        `${path.name} pays an approved vendor, and TDI's authorization for this state ` +
        `is not confirmed. This is a blocker on our side, not the school's.`,
      unblockedBy: 'Confirm TDI vendor authorization with the state agency.',
    }
  }

  // ── Open window ──
  // Last, because it is the most likely to change on its own.
  if ((path.windowStatus || 'unknown') !== 'open') {
    return {
      verdict: 'ask_first',
      rule: 'window',
      reason:
        `No confirmed open application window for ${path.name}. Drafting into an ` +
        `unconfirmed window is how a narrative gets written for a programme that ` +
        `is not accepting applications.`,
      unblockedBy: 'An agent verifies and records the window as open.',
    }
  }

  return {
    verdict: 'clear',
    rule: 'none',
    reason: 'No rule objects to this path for this school.',
  }
}
