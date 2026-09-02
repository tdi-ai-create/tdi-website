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
 * `drafting` and `review` were removed on 2 September 2026. Flagging them as
 * never-arriving was not enough: this file said so plainly, and a control for
 * Bella was still added to `review` in #322 by someone who had read this
 * comment. A state you can name is a state someone will build on, so the only
 * reliable way to stop that is to take the name away.
 *
 * What they described was real but is not what happens. `review` was Bella
 * reading a draft before it went to Julie. Agents write `qa_review` straight
 * through the sync API, so Julie is the first reader, and Bella's judgement
 * lands at `approval` where she has both an Approve and a Send it back.
 *
 * If a human gate before QA is ever wanted, add it deliberately with a writer,
 * a control and a test, rather than reviving a name.
 */
export type NarrativeState =
  | 'not_started'
  | 'requested'
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
 *   It used to carry `drafting→review` and `review→qa_review`, a path no agent
 *   takes, while the move agents actually make was missing. Both dead entries
 *   went with the states themselves on 2 Sep 2026.
 */
export const TRANSITION_OWNER: Record<string, Owner> = {
  // The move agents actually make. Absent until now, so a draft arriving for
  // QA posted as chatter and was filtered out at any verbosity above verbose.
  // Owner is null on purpose: it is Julie's next, and Julie is not chased.
  'requested→qa_review': null,
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

// ── What a QA verdict says, item by item ───────────────────────────────────
//
// QA used to return one pass or fail for a whole narrative. That is the wrong
// shape, because the two kinds of problem it finds have nothing in common.
//
// Some findings the writer can fix by writing: a section that opens as a
// factsheet instead of a story, goals stated as coverage rather than outcomes,
// a missing piece of the client-facing package, a style violation.
//
// Others cannot be fixed by writing at all, because the information does not
// exist yet and only a person can go and get it. A tax ID. A confirmation of
// how a funder wants something structured.
//
// Collapsing both into one verdict means the second kind stops the first kind.
// A writer reads "blocking", concludes correctly that they cannot finish, and
// does none of the work they could have done. Everything waits on the slowest
// item rather than on itself.
//
// So a verdict now carries a list, and each item says which kind it is.

export type QaBlocker =
  /** The writer can fix this by rewriting. */
  | 'writer'
  /** Only a person can clear this. No amount of rewriting will. */
  | 'human';

export interface QaIssue {
  /** What is wrong, in a sentence the writer can act on. */
  text: string;
  blocker: QaBlocker;
  /** For human items: what would clear it. Ignored for writer items. */
  needs?: string;
}

/**
 * Reads whatever QA sent and sorts it.
 *
 * Deliberately forgiving about shape. Julie's rubric is a skill file in
 * Paperclip and has not been changed yet, so today's verdicts arrive as free
 * text or as untagged strings. Anything without a usable `blocker` is treated
 * as a writer item, which is exactly how the system behaves today: everything
 * goes back to the writer. That keeps this change invisible until the rubric
 * starts tagging, and means the portal never has to guess.
 */
export function splitQaIssues(raw: unknown): { writer: QaIssue[]; human: QaIssue[] } {
  const writer: QaIssue[] = [];
  const human: QaIssue[] = [];

  if (!Array.isArray(raw)) return { writer, human };

  for (const entry of raw) {
    if (typeof entry === 'string') {
      writer.push({ text: entry, blocker: 'writer' });
      continue;
    }
    if (!entry || typeof entry !== 'object') continue;

    const e = entry as Record<string, unknown>;
    const text = typeof e.text === 'string' ? e.text : typeof e.issue === 'string' ? e.issue : null;
    if (!text) continue;

    const blocker: QaBlocker = e.blocker === 'human' ? 'human' : 'writer';
    const item: QaIssue = { text, blocker };
    if (blocker === 'human' && typeof e.needs === 'string') item.needs = e.needs;
    (blocker === 'human' ? human : writer).push(item);
  }

  return { writer, human };
}

/**
 * What the writer is told to fix.
 *
 * Only their own items. Handing a writer a list containing something they
 * cannot do is how a redraft turns into a refusal to redraft. The summary is
 * kept as the opening line so nothing Julie wrote is lost.
 */
export function writerGuidance(summary: string | null | undefined, issues: QaIssue[]): string {
  const head = (summary || '').trim();
  if (issues.length === 0) return head;
  const body = issues.map((i) => `- ${i.text}`).join('\n');
  return head ? `${head}\n\n${body}` : body;
}

/**
 * What to do with a failed verdict, given how its items split.
 *
 * `redraft`   the writer has work; this counts as an attempt.
 * `park`      nothing left that writing can fix, so it goes to a person with a
 *             concrete ask. Deliberately does NOT count as an attempt: burning
 *             the writer's two tries on something they were never able to fix
 *             is how a narrative reaches escalation with no useful options.
 * `escalate`  the writer has had their attempts and still has not got there.
 */
export type FailDisposition = 'redraft' | 'park' | 'escalate';

export function dispositionForFail(
  writerItems: QaIssue[],
  humanItems: QaIssue[],
  attemptIfCounted: number,
): FailDisposition {
  if (writerItems.length === 0 && humanItems.length > 0) return 'park';
  return attemptIfCounted > MAX_QA_ATTEMPTS ? 'escalate' : 'redraft';
}

// ── Is this grant still applicable for ──

export interface WindowSubject {
  window_status?: string | null;
  application_closes?: string | null;
}

/**
 * Whether a school can still apply.
 *
 * `window_status` is a stored field, and the only value anything ever writes to
 * it is 'open'. Nothing closes it when the date passes, so on its own it is a
 * flag that can only ever say yes. It gates the Request draft control, which
 * meant the portal kept offering to commission a narrative for a grant whose
 * window had already shut.
 *
 * The close date is the fact; the stored status is an intention about it. Both
 * have to agree, and a date in the past wins over any stored value.
 *
 * Dates are compared as calendar days, never as timestamps. `application_closes`
 * is a Postgres date column, and parsing one as a UTC instant is how the rest of
 * this codebase learned to render deadlines a day early.
 */
export function isWindowOpen(opp: WindowSubject, today: Date = new Date()): boolean {
  if (opp.window_status && opp.window_status !== 'open') return false;
  if (!opp.application_closes) return opp.window_status === 'open';

  const closes = String(opp.application_closes).slice(0, 10);
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`;

  return closes >= todayStr;
}

/** Days until the window shuts. Negative once it has. Null with no date. */
export function daysUntilClose(opp: WindowSubject, today: Date = new Date()): number | null {
  if (!opp.application_closes) return null;
  const closes = new Date(String(opp.application_closes).slice(0, 10) + 'T00:00:00');
  const ref = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((closes.getTime() - ref.getTime()) / 86400000);
}

// ── Guarding the state field ──

/**
 * The states, as data. Needed because the sync API takes a state off the wire
 * and TypeScript cannot check a value that arrives at runtime.
 */
export const NARRATIVE_STATES: NarrativeState[] = [
  'not_started', 'requested', 'qa_review', 'approval', 'escalated', 'ready',
];

/** Whether something an agent sent is a state this system actually has. */
export function isNarrativeState(v: unknown): v is NarrativeState {
  return typeof v === 'string' && (NARRATIVE_STATES as string[]).includes(v);
}
