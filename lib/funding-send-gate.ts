// ---------------------------------------------------------------------------
// May this package go to a client.
//
// One checkpoint, at the only moment that reaches a school. Everything it
// checks is something that has already gone out wrong.
//
// Measured across all three live schools on 15 September 2026: fourteen
// packages sent, six with no document behind the link, nine with no closing
// date, twelve with no passing quality review. Clients filed six of the
// fourteen regardless, which is why the constraint was never their capacity.
//
// THE DISTINCTION THAT MATTERS: hard checks and soft checks.
//
// A soft check is a judgement, and a person is allowed to overrule it. That
// escape hatch already exists as `approve_anyway`, it is attributed and
// timestamped, and it is used well. Rae overrode a QA objection on 15
// September with the reason "the 74% classroom implementation figure is an
// approved TDI claim used across the team and on our own site. QA should not be
// blocking on it." That is exactly what an override is for and this gate must
// not take it away.
//
// A hard check is not a judgement. It is the existence of the thing itself, and
// no reason can make an absent document present.
//
// That distinction is the whole reason this file exists. Of the five recorded
// overrides, two approved a package that had no document at all:
//
//   Illinois Prairie   overridden 8 Sep 17:59, reason "draft looks correct",
//                      emailed 18:03, no document then or now
//   IEA SCORE          overridden 10 Sep 21:10, reason "draft",
//                      emailed 14 Sep, no document then or now
//
// Somebody approved a draft that did not exist, twice, and the system let the
// approval stand in for the draft. Then we told a superintendent his
// application was ready. He replied that some of them have no package link,
// and he was right about both of these.
//
// So: the quality review stays overridable. The document does not.
// ---------------------------------------------------------------------------

export type CheckId =
  | 'document_exists'
  | 'document_opens'
  | 'quality_reviewed'
  | 'closing_date_known'
  | 'funder_can_fund_us';

export type Severity = 'hard' | 'soft';

export interface GateCheck {
  id: CheckId;
  severity: Severity;
  passed: boolean;
  /** Said to the person who pressed send, so it has to be actionable. */
  reason: string | null;
  /** Set when a soft check was satisfied by a recorded override. */
  satisfiedByOverride?: { by: string | null; at: string | null; reason: string | null };
}

export interface GateVerdict {
  sendable: boolean;
  /** Checks that stop the send. */
  blocking: GateCheck[];
  /** Failed soft checks that an override already covers, or notes worth saying. */
  allowed: GateCheck[];
  all: GateCheck[];
}

export interface GateSubject {
  name?: string | null;
  narrative_url?: string | null;
  application_closes?: string | null;
  /** Written by the QA route alongside the review row, and by an override. */
  qa_passed?: boolean | null;
  qa_escalation?: Record<string, unknown> | null;
  /** Count of passing rows in funding_narrative_qa_reviews for this grant. */
  passingReviewCount?: number;
  /** Null when the funder's spend rules have never been established. */
  funderCanFundUs?: boolean | null;
}

/** Whether a document link actually resolves. Injected so the logic stays testable. */
export type LinkProbe = (url: string) => Promise<{ ok: boolean; detail: string }>;

function overrideOf(subject: GateSubject) {
  const e = subject.qa_escalation;
  if (!e || typeof e !== 'object') return null;
  const option = e['resolved_option'];
  if (option !== 'approve_anyway') return null;
  return {
    by: (e['resolved_by'] as string) ?? null,
    at: (e['resolved_at'] as string) ?? null,
    reason: (e['resolved_reason'] as string) ?? null,
  };
}

/**
 * Evaluate the gate.
 *
 * `probe` is optional. Without it the document-opens check reports itself as
 * unverified rather than passing, because claiming a link works without having
 * fetched it is the same class of mistake this gate exists to stop.
 */
export async function evaluateSendGate(
  subject: GateSubject,
  probe?: LinkProbe,
): Promise<GateVerdict> {
  const checks: GateCheck[] = [];
  const grant = subject.name ?? 'This grant';
  const override = overrideOf(subject);

  // ── HARD: the document exists ──
  const hasUrl = Boolean(subject.narrative_url && String(subject.narrative_url).trim());
  checks.push({
    id: 'document_exists',
    severity: 'hard',
    passed: hasUrl,
    reason: hasUrl
      ? null
      : `${grant} has no application document. The email would say "here is your application package" above a blank line. An approval cannot stand in for a document that was never written.`,
  });

  // ── HARD: the document opens ──
  if (!hasUrl) {
    checks.push({
      id: 'document_opens',
      severity: 'hard',
      passed: false,
      reason: 'No document to open.',
    });
  } else if (!probe) {
    checks.push({
      id: 'document_opens',
      severity: 'hard',
      passed: false,
      reason:
        'The document link was not opened, so whether a school can read it is unknown. Our own writing standard already requires opening it in a private window before sending.',
    });
  } else {
    const result = await probe(String(subject.narrative_url));
    checks.push({
      id: 'document_opens',
      severity: 'hard',
      passed: result.ok,
      reason: result.ok
        ? null
        : `The document link did not open: ${result.detail}. A link that asks us for access will ask the school for access too.`,
    });
  }

  // ── SOFT: somebody reviewed it, or somebody overruled the review ──
  const reviewed = (subject.passingReviewCount ?? 0) > 0;
  if (reviewed) {
    checks.push({ id: 'quality_reviewed', severity: 'soft', passed: true, reason: null });
  } else if (override) {
    checks.push({
      id: 'quality_reviewed',
      severity: 'soft',
      passed: true,
      reason: `No passing review. Sent on a recorded override: "${override.reason ?? 'no reason given'}"`,
      satisfiedByOverride: override,
    });
  } else {
    checks.push({
      id: 'quality_reviewed',
      severity: 'soft',
      passed: false,
      reason: `${grant} has no passing quality review and no recorded decision to send it anyway. Either send it for review, or override with a reason so the choice is on the record.`,
    });
  }

  // ── SOFT: we know when the window shuts ──
  const hasClose = Boolean(subject.application_closes);
  checks.push({
    id: 'closing_date_known',
    severity: 'soft',
    passed: hasClose,
    reason: hasClose
      ? null
      : `No closing date on record, so the email will print the word "soon" where the date belongs and no reminder will be scheduled. One superintendent quoted that word back to us.`,
  });

  // ── SOFT: the money can pay for what we do ──
  if (subject.funderCanFundUs === false) {
    checks.push({
      id: 'funder_can_fund_us',
      severity: 'soft',
      passed: false,
      reason: `${grant} is recorded as not funding our contract services, so winning it would not close the gap it was opened against.`,
    });
  } else {
    // Unknown is not a failure. There is no field for this yet on most
    // funders, and blocking on an unanswered question nobody has been asked is
    // how a gate becomes something people route around.
    checks.push({ id: 'funder_can_fund_us', severity: 'soft', passed: true, reason: null });
  }

  const blocking = checks.filter(c => !c.passed && c.severity === 'hard');
  const softFails = checks.filter(c => !c.passed && c.severity === 'soft');

  return {
    // A soft failure does not stop the send on its own. It is surfaced so the
    // person deciding sees it, and so the override they record has something
    // to be an override of.
    sendable: blocking.length === 0,
    blocking,
    allowed: [...softFails, ...checks.filter(c => c.satisfiedByOverride)],
    all: checks,
  };
}

/** One line per problem, for an error message or a dry run. */
export function describeVerdict(verdict: GateVerdict): string[] {
  return verdict.all
    .filter(c => c.reason)
    .map(c => `[${c.severity}${c.passed ? ', allowed' : ', blocked'}] ${c.reason}`);
}

/**
 * A real fetch of a document link.
 *
 * Deliberately unauthenticated: the question is whether a school can open it,
 * not whether we can. A Google Doc that needs sign-in returns a redirect to an
 * accounts page, which is the exact failure our writing standard warns about.
 */
export function fetchProbe(timeoutMs = 8000): LinkProbe {
  return async (url: string) => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, { redirect: 'follow', signal: controller.signal });
      clearTimeout(timer);

      if (!res.ok) return { ok: false, detail: `HTTP ${res.status}` };

      // A redirect to a sign-in page answers 200 on the sign-in page, so the
      // status alone is not enough.
      const finalUrl = res.url || url;
      if (/accounts\.google\.com|\/ServiceLogin|signin/i.test(finalUrl)) {
        return { ok: false, detail: 'it redirected to a sign-in page, so the school cannot read it' };
      }
      return { ok: true, detail: `opened, HTTP ${res.status}` };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'unknown error';
      return { ok: false, detail: msg === 'The operation was aborted.' ? 'it timed out' : msg };
    }
  };
}
