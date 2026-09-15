// ---------------------------------------------------------------------------
// Claims TDI has settled, so nobody relitigates them one grant at a time.
//
// On 14 September an agent wrote a complete Cox Charities application for
// St. Peter Chanel, worth $2,500 to a school with no instructional coach.
// Julie failed it twice and blocked on one thing both times: the 74% classroom
// implementation rate, which she could not verify from a public source.
//
// She was applying her rubric correctly. The rubric was missing a fact: that
// figure is TDI's own published number, used across the team and on our own
// site, and it is approved for external use. Rae settled that on 15 September.
//
// A claim nobody has written down gets argued about by whoever meets it next,
// and here that argument cost sixteen days off a window that closes 1 October.
//
// The opposite list matters just as much. The 94% figure from the BRCC keynote
// must never be repeated, and a register that only records permissions would
// quietly let it through.
// ---------------------------------------------------------------------------

export interface Claim {
  /** What the number or statement is, in plain words. */
  id: string;
  /** Patterns that mean a piece of text is making this claim. */
  patterns: RegExp[];
  /** Why it is settled, and by whom, so it can be revisited on evidence. */
  note: string;
}

/**
 * Approved for external use. QA may not block a draft on these.
 *
 * Adding one is a decision, not a convenience. It means we are willing to have
 * a funder check it.
 */
export const APPROVED_CLAIMS: Claim[] = [
  {
    id: 'implementation-rate-74',
    // Deliberately keyed on the figure, not on the phrase "implementation
    // rate". A reviewer objecting to some other implementation rate is making
    // a different point and must still be able to make it.
    patterns: [/\b74\s*%/, /\b74\s*percent/i],
    note:
      "TDI's own published implementation figure, stated on teachersdeserveit.com and used across " +
      'the team. Approved for external use by Rae on 15 September 2026, after QA blocked the Cox ' +
      'Charities application on it twice.',
  },
  {
    id: 'one-time-pd-benchmark-10',
    patterns: [/\b10\s*%\s*(industry|typical|average|benchmark)/i],
    note:
      'The benchmark the 74% is compared against. Approved with it, since blocking on one and not ' +
      'the other leaves the sentence unusable either way.',
  },
];

/**
 * Never to be used, whatever a draft says.
 *
 * A register that only grants permission is half a register. This half is the
 * one that stops a retired claim coming back because somebody found it in an
 * old document.
 */
export const RETIRED_CLAIMS: Claim[] = [
  {
    id: 'ninety-four-percent',
    patterns: [/\b94\s*%/, /\b94\s*percent/i],
    note:
      'Used in the BRCC keynote and withdrawn. It must not appear in anything a school, funder or ' +
      'audience sees.',
  },
];

/** Every approved claim a piece of text makes. */
export function approvedClaimsIn(text?: string | null): Claim[] {
  const t = String(text ?? '');
  if (!t.trim()) return [];
  return APPROVED_CLAIMS.filter((c) => c.patterns.some((p) => p.test(t)));
}

/** Every retired claim a piece of text makes. Any hit is a hard stop. */
export function retiredClaimsIn(text?: string | null): Claim[] {
  const t = String(text ?? '');
  if (!t.trim()) return [];
  return RETIRED_CLAIMS.filter((c) => c.patterns.some((p) => p.test(t)));
}

/**
 * Is a QA objection resting on a claim we have already approved.
 *
 * Reads the reviewer's own words. A verdict that mentions an approved claim is
 * not automatically wrong, so this only reports what it found; the caller
 * decides what that means.
 */
export function objectsToAnApprovedClaim(summary?: string | null, issues?: unknown): {
  found: Claim[];
  where: string;
} {
  const fromSummary = approvedClaimsIn(summary);
  const issueText = typeof issues === 'string' ? issues : JSON.stringify(issues ?? '');
  const fromIssues = approvedClaimsIn(issueText);

  const seen = new Map<string, Claim>();
  for (const c of [...fromSummary, ...fromIssues]) seen.set(c.id, c);

  return {
    found: [...seen.values()],
    where: fromSummary.length ? 'summary' : fromIssues.length ? 'issues' : '',
  };
}
