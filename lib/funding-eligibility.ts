
import { isWithFunder } from './funding-status'
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
  /**
   * True once the school has actually filed this. Every rule here asks whether
   * it is safe to start drafting, so all of them are moot afterwards.
   */
  alreadySubmitted?: boolean | null
}

/**
 * Has this path moved past the point where a pre-draft rule can apply.
 *
 * One definition, because all three callers of screenPath need the same answer
 * and a fourth will arrive eventually.
 */
export function isPastDrafting(
  status?: string | null,
  clientSubmitted?: boolean | null
): boolean {
  if (clientSubmitted === true) return true
  const s = (status || '').toLowerCase()
  return isWithFunder(s)
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
/**
 * What we know about ourselves, as far as screening cares.
 *
 * Only one rule here is about us rather than about the school, and until now it
 * had no way to know whether the question had already been answered. It fired
 * on the grant's name alone, every month, on every school, forever. The answer
 * lives in tdi_facts now, so the caller resolves it once and passes it in.
 */
export interface UsContext {
  /** Our authorization to deliver under this state's programme is established. */
  tdiAuthorizationConfirmed?: boolean;
}

export function screenPath(
  path: PathContext,
  school: SchoolContext,
  us: UsContext = {},
): EligibilityResult {
  // ── Already filed ──
  //
  // Every rule below asks whether it is safe to begin drafting. None of them
  // means anything once the school has filed, and asserting one anyway puts a
  // blocker on a card that contradicts the record printed underneath it.
  //
  // Allenwood's NEA grant is the live example. Jovita Ortiz submitted it as a
  // named NEA member on 16 June and Teri confirmed it on the 16th. The audit ran
  // on 18 August and stamped "must be filed by a named union member and no name
  // is on file". Bella sent a screenshot of that card asking what the next step
  // was, with the contradiction sitting in the middle of it.
  if (path.alreadySubmitted) {
    return {
      verdict: 'clear',
      rule: 'already_submitted',
      reason: 'Already filed with the funder, so the pre-draft checks no longer apply.',
    }
  }

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
  //
  // Skipped once our authorization for this state is established, because the
  // question is about TDI and not about this school. Answering it for one
  // school answered it for all of them, and re-asking per pursuit is how it
  // stayed open for 26 days on Saunemin and was then auto-cancelled unanswered
  // when the path closed.
  if (NEEDS_TDI_AUTHORIZATION.test(path.name) && !us.tdiAuthorizationConfirmed) {
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

/**
 * The question a person has to answer, per rule.
 *
 * The rule's own reason is written for a reader and becomes the body. This is
 * the one-line ask that appears in a list.
 */
export const QUESTION_BY_RULE: Record<string, string> = {
  named_applicant: 'Does anyone at this school hold the membership this grant requires?',
  designation: 'Does this school hold a school-improvement designation?',
  tdi_authorization: 'Is TDI an approved vendor with this state agency?',
  window: 'Is this funder actually open, and when does it close?',
  sector: 'Does this school sit inside the state accountability system?',
}

/**
 * The same question, with the grant it is about on the front.
 *
 * Four of these sat on Bella's list on 10 September, every one titled "Is this
 * funder actually open, and when does it close?" and nothing else. The grant
 * name was on the row, in twelve pixel grey beneath the title. She wrote that
 * she could not find anything about the Washington Commanders Charitable
 * Foundation or Sharing Prince Georges. Amara had researched both on
 * 8 September and her findings were sitting inside two of those identical rows.
 *
 * A list of repeated sentences is not a list. Whatever distinguishes one row
 * from another belongs where a person reads first.
 */
export function eligibilityQuestionTitle(rule: string, grantName?: string | null): string {
  const question = QUESTION_BY_RULE[rule] ?? 'Confirm this before any drafting starts'
  const grant = (grantName ?? '').trim()
  if (!grant) return question
  // Already named, so do not say it twice.
  if (question.toLowerCase().includes(grant.toLowerCase())) return question
  return `${grant}: ${question}`
}

/**
 * Who a blocked path belongs to once an agent has tried.
 *
 * A question only reaches a person after the research agent has looked and
 * could not establish the answer. Until now the fallback was always Bella, so
 * the better the agents got at admitting they were stuck, the more research
 * landed on a manager. Six of her thirteen open items on 13 September were
 * questions like "is TDI an approved vendor with this state agency", which is
 * not her job and not something she can find out by trying harder.
 *
 * A dead end is not a task. It is a decision about whether this funder is
 * worth pursuing at all, and Amara's own notes say so: on Washington
 * Commanders she wrote that there may be no open application process, and
 * recommended a call rather than a deadline. That is Rae's call to make.
 *
 * Anything the agent has not yet looked at stays with Bella, because chasing a
 * school for an answer is genuinely hers.
 */
export function ownerOfBlockedPath(agentAlreadyLooked: boolean): {
  ownerName: string
  ownerEmail: string
} {
  return agentAlreadyLooked
    ? { ownerName: 'Rae', ownerEmail: 'rae@teachersdeserveit.com' }
    : { ownerName: 'Bella', ownerEmail: 'hello@teachersdeserveit.com' }
}

/**
 * How a dead end is worded.
 *
 * "Answer this" is the wrong ask when nobody can answer it from a desk. The
 * options are named instead, so the item can be closed with a decision rather
 * than sitting open because the research is genuinely exhausted.
 */
export function deadEndTitle(grantName: string): string {
  return `${grantName}: decide whether to keep pursuing it`
}
