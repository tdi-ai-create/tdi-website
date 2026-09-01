// ---------------------------------------------------------------------------
// What happens next to a grant narrative, declared once.
//
// This file changes no behaviour. It describes what the code already does,
// including the parts that are wrong, so that every caller can read the same
// description instead of keeping its own. Fixing the wrong parts comes after,
// and the point of doing it in this order is that a fix then means editing one
// row here rather than hunting for the four places that disagreed.
//
// The disease this treats, with dates:
//
//   The creator agreement had three publish paths and only one checked whether
//   the agreement was signed, so three creators went live unsigned.
//
//   The admin view of a creator and the creator's own portal each computed
//   progress their own way, so the admin view sat three months behind without
//   anyone noticing.
//
//   A narrative sat in `requested` for fourteen days while the board reported
//   it as ordinary waiting, because "waiting on an agent" had no expiry.
//
// Every one of those was a rule nobody had written down. So: written down.
// ---------------------------------------------------------------------------

/**
 * Every value narrative_status can hold.
 *
 * Four of these occur in production. `drafting` and `review` appear in the
 * status labels and in the Slack handoff map but no code in this repository
 * ever sets them: an agent would have to send them through the sync API, and
 * the path agents actually take is `requested` straight to `qa_review`. They
 * are kept because the sync API still accepts them, and flagged below so the
 * next person does not build on a state that never arrives.
 */
export type NarrativeState =
  | 'not_started'
  | 'requested'
  | 'drafting'
  | 'review'
  | 'qa_review'
  | 'approval'
  | 'escalated'
  | 'ready';

/**
 * Who owes the next move. `null` means nothing is owed, not that nobody owns
 * it: a finished narrative is nobody's problem, an unclaimed one is.
 */
export type Owner = 'writer' | 'qa' | 'bella' | 'team' | 'school' | null;

export interface StateRule {
  state: NarrativeState;
  /** Who owes the next move while sitting here. */
  owner: Owner;
  /** One sentence a person can read. */
  meaning: string;
  /** Seen in funding_opportunities on 1 September 2026. */
  observed: boolean;
  /**
   * Hours this may sit before waiting stops counting as progress. null means
   * it may sit forever, which is true today for every state except one and is
   * the single biggest gap in this table.
   */
  expiresHours: number | null;
}

/**
 * Drafting gets three days before the portal stops calling it progress.
 *
 * A grant narrative is long work and an agent starting on day two has not
 * failed. Past that nobody has picked it up. Shipped in PR #298; declared here
 * so the board and any future notification read the same number.
 */
export const DRAFT_SILENCE_HOURS = 72;

/**
 * Julie normally answers in minutes, so a day of silence means she is not
 * picking it up. Was declared in funding-qa.ts; moved here so every expiry in
 * the system reads from one table.
 */
export const QA_SILENCE_HOURS = 24;

/**
 * How long something may sit on Bella before the portal says so.
 *
 * Two days rather than one. She is part time and an approval landing on a
 * Friday afternoon should not be shouting by Saturday. Past that, a finished
 * application waiting on one click is the most expensive kind of idle we have.
 */
export const BELLA_SILENCE_HOURS = 48;

/** The table. One row per state, and no state may be absent from it. */
export const STATE_RULES: Record<NarrativeState, StateRule> = {
  not_started: {
    state: 'not_started',
    owner: 'team',
    meaning: 'Nobody has asked for a draft yet.',
    observed: true,
    expiresHours: null,
  },
  requested: {
    state: 'requested',
    owner: 'writer',
    meaning: 'A draft has been asked for and the writer has not delivered one.',
    observed: true,
    expiresHours: DRAFT_SILENCE_HOURS,
  },
  drafting: {
    state: 'drafting',
    owner: 'writer',
    meaning: 'The writer says they have started.',
    observed: false,
    expiresHours: null,
  },
  review: {
    state: 'review',
    owner: 'bella',
    meaning: 'A draft exists and needs moving into QA.',
    observed: false,
    expiresHours: null,
  },
  qa_review: {
    state: 'qa_review',
    owner: 'qa',
    meaning: 'With Julie, who decides whether it passes.',
    observed: false,
    expiresHours: QA_SILENCE_HOURS,
  },
  approval: {
    state: 'approval',
    owner: 'bella',
    meaning: 'Passed QA. Bella decides whether it is true about the school and sounds like us.',
    observed: false,
    expiresHours: BELLA_SILENCE_HOURS,
  },
  escalated: {
    state: 'escalated',
    owner: 'bella',
    meaning: 'QA ran out of attempts. Bella picks from concrete options.',
    observed: true,
    expiresHours: BELLA_SILENCE_HOURS,
  },
  ready: {
    state: 'ready',
    owner: 'team',
    meaning: 'Approved. Somebody has to actually submit it.',
    observed: true,
    expiresHours: null,
  },
};

/**
 * Who gets an at-mention when a narrative moves, keyed `from→to`.
 *
 * This is lifted verbatim from lib/funding-slack.ts rather than improved,
 * because this pass changes nothing. Two things about it are worth seeing now
 * that it sits next to the state table:
 *
 *   Being present here at all is what makes a transition a handoff rather than
 *   chatter, which is what survives a verbosity setting of 'handoffs'.
 *
 *   `drafting→review` and `review→qa_review` describe a path no agent takes.
 *   The move agents actually make, `requested→qa_review`, is absent, so a draft
 *   arriving for QA is chatter. It is also never posted at all, because
 *   update_narrative in the sync route writes a timeline row and returns
 *   without calling postFundingEvent. Both are phase two.
 */
export const TRANSITION_OWNER: Record<string, Owner> = {
  // The move agents actually make. Absent until now, so a draft arriving for
  // QA posted as chatter and was filtered out at any verbosity above verbose.
  // Owner is null on purpose: it is Julie's next, and Julie is not chased.
  'requested→qa_review': null,
  'drafting→review': 'bella',
  'review→qa_review': null,
  'qa_review→approval': 'bella',
  'qa_review→escalated': 'bella',
  'qa_review→ready': null,
};

/**
 * Sending a narrative back from approval returns it to the writer, exactly as
 * a QA failure does. Declared here so the button, the route and the board all
 * agree about where it lands.
 */
export const APPROVAL_SEND_BACK_TO: NarrativeState = 'requested';

/** Julie gets this many attempts before a narrative escalates to a person. */
export const MAX_QA_ATTEMPTS = 2;

// ── Readers ────────────────────────────────────────────────────────────────

export function ruleFor(state: string | null | undefined): StateRule | null {
  if (!state) return null;
  return STATE_RULES[state as NarrativeState] ?? null;
}

/** Who owes the next move while a narrative sits in this state. */
export function ownerOf(state: string | null | undefined): Owner {
  return ruleFor(state)?.owner ?? null;
}

/**
 * True when a transition hands work to a named person.
 *
 * Kept as a lookup on the same map the Slack module uses, so that the answer
 * cannot differ between "does this deserve a mention" and "who is mentioned".
 */
export function isHandoff(from: string, to: string): boolean {
  return `${from}→${to}` in TRANSITION_OWNER;
}

/** Who is at-mentioned for a transition. null means a real handoff owed to nobody. */
export function transitionOwner(from: string, to: string): Owner {
  return TRANSITION_OWNER[`${from}→${to}`] ?? null;
}

/**
 * Hours a state may sit before it stops reading as progress, or null for
 * forever. Callers should treat null as a gap to close, not as permission.
 */
export function expiryHours(state: string | null | undefined): number | null {
  return ruleFor(state)?.expiresHours ?? null;
}

/**
 * Has this been sitting longer than its rule allows?
 *
 * `since` is narrative_status_changed_at where it exists and updated_at
 * otherwise, matching what the board and the QA silence check already do.
 * A state with no expiry can never be stale, which is the current behaviour
 * and also the thing phase two has to revisit.
 */
export function isStale(
  state: string | null | undefined,
  since: string | null | undefined,
  now: number = Date.now(),
): boolean {
  const limit = expiryHours(state);
  if (limit === null) return false;
  if (!since) return true;
  return (now - new Date(since).getTime()) / 3600000 >= limit;
}

/** Whole hours a narrative has been sitting. Infinity when we have no timestamp. */
export function hoursSince(since: string | null | undefined, now: number = Date.now()): number {
  if (!since) return Infinity;
  return Math.floor((now - new Date(since).getTime()) / 3600000);
}
