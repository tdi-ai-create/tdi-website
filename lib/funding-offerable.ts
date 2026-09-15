// ---------------------------------------------------------------------------
// Can an agent actually pick this grant up.
//
// Three places answered that question and they disagreed, which is the oldest
// bug in this codebase wearing a new hat.
//
//   find_work                 five checks, including the eligibility screen
//   funding-next-actions      two of the five
//   the Researching column    none of them
//
// So on 13 September Bella's board said "Title I Section 1003: nobody has
// picked this draft up. Requested 9 days ago and vanessa has not started. The
// portal is offering it correctly, so this is on our side to chase."
//
// The portal was not offering it. The eligibility screen refuses that path
// because TDI's approved-vendor status in that state is unconfirmed, so Vanessa
// has never been able to see it. Chasing her would have produced nothing, twice
// over: no draft, and a writer who looks like she is ignoring her queue.
//
// The comment in funding-next-actions already said the right thing, that
// claiming "waiting for agent" is a lie when the work is invisible to agents.
// It implemented two of the five checks and the sentence stopped being true.
//
// One function, used by all three. A place that decides this for itself is the
// bug coming back.
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
import { isWindowOpen } from './funding-rules';
import { screenPath, isPastDrafting, type EligibilityResult } from './funding-eligibility';
import { isOver, isWithFunder } from './funding-status';

/** A grant in one of these is finished, whatever the narrative field says. */
/** A grant already with the funder, or over, is not draftable either way. */
const notDraftable = (status?: string | null) => isOver(status) || isWithFunder(status);

export type OfferBlocker = 'finished' | 'gate' | 'window' | 'archived' | 'screen';

export interface OfferVerdict {
  /** True when an agent asking for work right now would be handed this. */
  offerable: boolean;
  /** Which check refused it, so a caller can word its own message. */
  blockedBy: OfferBlocker | null;
  /**
   * Why not, written for a person. Never empty when blocked, because "this is
   * blocked" with no reason is what sends someone to chase the wrong party.
   */
  reason: string;
  /**
   * The eligibility screen's own verdict, present only when it is what refused
   * this path.
   *
   * Callers that persist a refusal need to know which of the two questions was
   * answered. "No agent can pick this up right now" is true of a shut gate and
   * an unverified window, and says nothing at all about whether the school
   * could win the grant. The sync route used to flatten all five blockers into
   * a single verdict of 'blocked' written onto eligibility_verdict, which is a
   * value no screen, digest or query recognises, and it overwrote whatever the
   * screen had genuinely decided.
   */
  screen?: EligibilityResult;
}

const OFFERABLE: OfferVerdict = { offerable: true, blockedBy: null, reason: '' };

/**
 * The same test find_work applies, in the same order.
 *
 * `pursuit` needs sector, county, state_code, archived and school_profile.
 * `gate` needs gate_open. Both are the rows as stored; parsing the profile is
 * handled here so three callers do not each get it slightly wrong.
 */
export function canAgentDraft(opp: any, pursuit: any, gate: any): OfferVerdict {
  if (notDraftable(opp?.status)) {
    return { offerable: false, blockedBy: 'finished', reason: `this grant is ${opp.status}` };
  }

  if (pursuit?.archived) {
    return { offerable: false, blockedBy: 'archived', reason: 'this school is archived' };
  }

  if (!gate?.gate_open) {
    return { offerable: false, blockedBy: 'gate', reason: 'the gate is not satisfied' };
  }

  if (opp?.window_status !== 'open') {
    return {
      offerable: false,
      blockedBy: 'window',
      reason: `the window is ${opp?.window_status || 'unverified'}`,
    };
  }

  if (!isWindowOpen(opp)) {
    const closed = String(opp?.application_closes ?? opp?.window_closes ?? '').slice(0, 10);
    return {
      offerable: false,
      blockedBy: 'window',
      reason: closed ? `the window closed on ${closed}` : 'the window has closed',
    };
  }

  const profile = parseProfile(pursuit?.school_profile);
  const screen = screenPath(
    {
      name: opp?.name ?? '',
      windowStatus: opp?.window_status ?? null,
      namedApplicant: (profile.nea_member_name as string) ?? null,
      alreadySubmitted: isPastDrafting(opp?.status, opp?.client_submitted),
    },
    {
      sector: pursuit?.sector ?? null,
      county: pursuit?.county ?? null,
      stateCode: pursuit?.state_code ?? null,
      titleIStatus: (profile.title_i_status as string) ?? null,
      designation: (profile.designation as string) ?? null,
    },
  );

  if (screen.verdict !== 'clear') {
    return {
      offerable: false,
      blockedBy: 'screen',
      reason: screen.reason || 'the eligibility screen refuses this path',
      screen,
    };
  }

  return OFFERABLE;
}

/**
 * school_profile arrives double encoded often enough that every caller that
 * parsed it inline got it wrong at least once, and a failed parse silently
 * becomes an empty profile, which reads as "no named member on file" and
 * blocks a path that is actually fine.
 */
function parseProfile(raw: unknown): Record<string, unknown> {
  try {
    if (!raw) return {};
    const once = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return (typeof once === 'string' ? JSON.parse(once) : once) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/**
 * What to tell a person about a draft that has been requested and not started.
 *
 * Chasing is only the right advice when the work is genuinely on offer and
 * nobody has taken it. Everything else is ours to clear first.
 */
export function stalledDraftMessage(
  verdict: OfferVerdict,
  agentName: string | null | undefined,
  daysWaiting: number,
): { label: string; why: string } {
  const who = agentName || 'the agent';

  if (!verdict.offerable) {
    // Reasons come from several rules and some already end in a full stop.
    const because = verdict.reason.trim().replace(/\.+$/, '');
    return {
      label: 'draft requested but blocked',
      why:
        `No agent can pick this up because ${because}. ` +
        `${who} has not been offered it, so chasing will not help. Clear that first.`,
    };
  }

  return {
    label: 'nobody has picked this draft up',
    why: `Requested ${daysWaiting} days ago and ${who} has not started. It is genuinely on offer, so this is ours to chase.`,
  };
}
