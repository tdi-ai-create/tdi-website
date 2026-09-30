// ---------------------------------------------------------------------------
// The rules the media pipeline runs on, kept out of the route.
//
// Every number here is derived from one fact Rae gave on 29 September: she will
// sit for about two recordings a week. Nothing here is derived from how many
// pitches an agent could write, because that number is effectively infinite and
// is the wrong constraint.
//
// They live in a file rather than as constants inside the route so that a guard
// can hold them, the same reason SEND_ALLOWLIST was moved out of its cron. A cap
// that only exists as a literal halfway down a 600 line handler gets raised by
// whoever is in a hurry.
//
// Standard: tdi-paperclip-skills/margot/PITCH-STANDARD.md
// ---------------------------------------------------------------------------

import { retiredClaimsIn } from './approved-claims';

/** Considered, hand written, aimed at district decision makers. */
export type Track = 'a' | 'b';

export const TRACKS: Track[] = ['a', 'b'];

/**
 * Pitches a month, per track.
 *
 * Assumed conversion, which is a guess until the pipeline has its own numbers:
 * Track A around a quarter, Track B better because smaller shows are short of
 * guests. Eight and twenty is roughly eight or nine bookings, which is the
 * calendar Rae described.
 *
 * Revise off measured conversion after the first full month. If Track A is
 * converting at half this, the answer is better targeting, not more pitches.
 */
export const MONTHLY_PITCH_CAP: Record<Track, number> = {
  a: 8,
  b: 20,
};

/**
 * How long a qualified judgement stands before it is worth looking again.
 *
 * A show that was publishing last month is still publishing. Asking every hour
 * turns a settled answer into a loop, which is what made the funding agent look
 * idle for twenty four days.
 */
export const QUALIFY_RECHECK_DAYS = 30;

/**
 * Working days to wait before a follow-up.
 *
 * Long enough that the first email is not a nuisance, short enough that the
 * show has not filled its calendar.
 */
export const FOLLOW_UP_AFTER_DAYS = 14;

/**
 * Attempts, ever. There is no third email.
 *
 * After two, the target goes cold and waits a quarter. Chasing harder than this
 * does not book shows, it burns them, and the universe of education podcasts is
 * small enough that the hosts talk to each other.
 */
export const MAX_ATTEMPTS = 2;

/** How long a cold target rests before it is worth another season. */
export const COLD_REST_DAYS = 90;

/**
 * Statuses a target can hold. No 'lost'.
 *
 * A host who passes this season is a host worth asking next season, which the
 * sales board already learned. 'passed' carries a revisit date, so declining is
 * a pause rather than a headstone.
 */
export const TARGET_STATUSES = [
  'prospect',
  'qualified',
  'pitched',
  'replied',
  'booked',
  'recorded',
  'published',
  'passed',
  'cold',
] as const;
export type TargetStatus = (typeof TARGET_STATUSES)[number];

/** Rae's four angles. Chosen per target, never fixed globally. */
export const ANGLES = [
  'systemic_pd',
  'rae_story',
  'paraprofessionals',
  'tdi_company',
] as const;
export type Angle = (typeof ANGLES)[number];

/**
 * Angles that read as a sales pitch to a teacher audience.
 *
 * Getting this wrong is the most common way a good pitch fails, and it fails
 * silently: the host simply does not reply, so nothing in the data says why.
 */
export const ANGLE_WARNS_ON_TEACHER_AUDIENCE: Angle[] = ['tdi_company'];

/** What the agent is being asked to do. */
export type WorkKind = 'qualify' | 'pitch' | 'follow_up' | 'close_out' | 'revisit';

export interface WorkItem {
  kind: WorkKind;
  targetId: string;
  name: string;
  track: Track;
  /** Why this landed in the queue, in words the agent can act on. */
  brief: string;
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

/** The cutoff a qualification must be older than to be worth redoing. */
export function qualifyRecheckCutoff(): string {
  return daysAgo(QUALIFY_RECHECK_DAYS);
}

/** The cutoff a pitch must have been sent before to earn a follow-up. */
export function followUpCutoff(): string {
  return daysAgo(FOLLOW_UP_AFTER_DAYS);
}

/**
 * Has a show gone quiet.
 *
 * Null is not dormant. It means nobody has looked, which is a different fact and
 * a different piece of work. Treating unknown as dormant would silently drop
 * every target the agent has not reached yet.
 */
export function looksDormant(lastPublishedAt?: string | null): boolean {
  if (!lastPublishedAt) return false;
  const published = new Date(lastPublishedAt).getTime();
  if (Number.isNaN(published)) return false;
  return published < Date.now() - 182 * 86_400_000;
}

/** First and last instant of the current month, for counting sends against a cap. */
export function currentMonthWindow(now: Date = new Date()): { from: string; to: string } {
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { from: from.toISOString(), to: to.toISOString() };
}

/** How many more pitches this track may send this month. Never negative. */
export function remainingThisMonth(track: Track, sentThisMonth: number): number {
  return Math.max(0, MONTHLY_PITCH_CAP[track] - sentThisMonth);
}

/**
 * Is this field write a real status decision.
 *
 * media_targets.status_checked_at exists so that find_work can pause on a
 * question it has already asked. It only works if it moves for status writes and
 * nothing else. The funding pipeline keyed the same pause on updated_at, which
 * every unrelated job touches, and six opportunities sat unoffered for weeks
 * while the agent's queue read empty.
 */
const STATUS_FIELDS = new Set(['status', 'revisit_after', 'disqualified', 'disqualified_reason']);

export function movesStatusCheckedAt(fields: Record<string, unknown>): boolean {
  return Object.keys(fields).some((k) => STATUS_FIELDS.has(k));
}

// ---------------------------------------------------------------------------
// What a machine can check about a pitch, and what it cannot.
//
// The pre-send checklist has twelve lines and only some of them are decidable
// here. Whether the opening names a real episode is a judgement; whether the
// draft contains a retired claim is a fact. Mixing the two produces a gate that
// either blocks good drafts or waves through bad ones.
//
// So: the facts are enforced below and the judgements are recorded as the
// agent's own assertions on media_pitches.checklist, where they can be audited
// after the fact rather than trusted in the moment.
// ---------------------------------------------------------------------------

export interface PitchProblem {
  /** 'hard' refuses the draft. 'soft' is reported and lets it through. */
  severity: 'hard' | 'soft';
  code: string;
  detail: string;
}

/** Under 200 words. A pitch that needs scrolling does not get read. */
export const MAX_PITCH_WORDS = 200;

/**
 * Counts of people that are already published, so already cleared.
 *
 * The no-absolute-counts rule is about what a headcount reveals, and a figure
 * that is on our own front page reveals nothing new. Everything else is a
 * percentage or a word like most.
 */
const PUBLISHED_COUNTS = [/\b100,?000\s*\+?\s*educators/i, /\b50\s+states\b/i];

/** A headcount of other people. Their own figures are fine, these are not. */
const HEADCOUNT = /\b\d{1,3}(?:,\d{3})*\+?\s+(educators|teachers|paras|paraprofessionals|schools|districts|members|creators|coaches)\b/gi;

export function pitchProblems(
  subject: string,
  body: string,
  target?: { audience_note?: string | null; angle?: string | null },
): PitchProblem[] {
  const problems: PitchProblem[] = [];
  const text = `${subject}\n${body}`;

  for (const claim of retiredClaimsIn(text)) {
    problems.push({
      severity: 'hard',
      code: 'retired-claim',
      detail: `The draft makes a retired claim (${claim.id}). ${claim.note}`,
    });
  }

  for (const match of text.matchAll(HEADCOUNT)) {
    const phrase = match[0];
    if (PUBLISHED_COUNTS.some((p) => p.test(phrase))) continue;
    problems.push({
      severity: 'hard',
      code: 'headcount',
      detail:
        `"${phrase.trim()}" is an absolute count of other people. Outside TDI that becomes a ` +
        'percentage or a word like most. The raw number stays on the dashboard.',
    });
  }

  if (/--|—|–/.test(text)) {
    problems.push({
      severity: 'hard',
      code: 'dash',
      detail: 'Em dashes and double hyphens read as machine written. Use a comma, a period, or "and".',
    });
  }

  if (/^\s*[-*•]\s+/m.test(body)) {
    problems.push({
      severity: 'hard',
      code: 'bullets',
      detail: 'No bullet points in the body. A pitch is prose.',
    });
  }

  const words = body.trim().split(/\s+/).filter(Boolean).length;
  if (words > MAX_PITCH_WORDS) {
    problems.push({
      severity: 'hard',
      code: 'too-long',
      detail: `${words} words, over the ${MAX_PITCH_WORDS} word limit.`,
    });
  }

  if (!subject.trim() || !body.trim()) {
    problems.push({ severity: 'hard', code: 'empty', detail: 'A pitch needs a subject and a body.' });
  }

  const angle = target?.angle ?? null;
  const audience = String(target?.audience_note ?? '');
  if (
    angle &&
    (ANGLE_WARNS_ON_TEACHER_AUDIENCE as string[]).includes(angle) &&
    /teacher|classroom|educator/i.test(audience)
  ) {
    problems.push({
      severity: 'soft',
      code: 'angle-fit',
      detail:
        'Pitching TDI as a company to a teacher audience reads as a sales pitch and is the most ' +
        'common way a good pitch fails. Consider the paraprofessional angle.',
    });
  }

  return problems;
}

/** A draft is refusable on facts alone. Judgements are recorded, not enforced. */
export function refusesPitch(problems: PitchProblem[]): boolean {
  return problems.some((p) => p.severity === 'hard');
}
