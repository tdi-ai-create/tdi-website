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
  /**
   * An occurrence with this nearby is a different claim, and does not count.
   *
   * One figure can be two claims. 94% is retired as a completion rate and
   * approved as a recommendation rate, and the only thing separating them is
   * the words around the number. Matching on the figure alone made the register
   * block a claim Rae had settled.
   *
   * Tested per occurrence against a window either side, not against the whole
   * document, so a draft that makes both claims still trips on the retired one.
   */
  unlessNear?: RegExp;
  /** Why it is settled, and by whom, so it can be revisited on evidence. */
  note: string;
}

/** How far either side of a match counts as "near" it, within its sentence. */
const CONTEXT_CHARS = 60;

/** Sentence and line boundaries. A claim's own words live in its own sentence. */
const BOUNDARY = /[.!?\n]/;

/**
 * The text around a match that decides what the match means.
 *
 * Clipped to the sentence, not just to a character count. "Our 94% would
 * recommend us. Also a 94% success rate." is two claims, and a window wide
 * enough to see the first sentence from the second one clears a retired claim
 * because of a word that belongs to its neighbour.
 */
function contextAround(text: string, start: number, end: number): string {
  let from = Math.max(0, start - CONTEXT_CHARS);
  for (let i = start - 1; i >= from; i--) {
    if (BOUNDARY.test(text[i])) {
      from = i + 1;
      break;
    }
  }

  let to = Math.min(text.length, end + CONTEXT_CHARS);
  for (let i = end; i < to; i++) {
    if (BOUNDARY.test(text[i])) {
      to = i;
      break;
    }
  }

  return text.slice(from, to);
}

/**
 * Does this text make this claim.
 *
 * Walks every occurrence rather than asking whether one exists, because an
 * `unlessNear` decides per occurrence and a document can hold both.
 */
function makesClaim(text: string, claim: Claim): boolean {
  for (const pattern of claim.patterns) {
    const flags = pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g';
    const scanner = new RegExp(pattern.source, flags);

    let match: RegExpExecArray | null;
    while ((match = scanner.exec(text)) !== null) {
      const end = match.index + match[0].length;
      if (!claim.unlessNear) return true;
      if (!claim.unlessNear.test(contextAround(text, match.index, end))) return true;

      // A zero-length match would otherwise spin here forever.
      if (match.index === scanner.lastIndex) scanner.lastIndex++;
    }
  }
  return false;
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
  {
    id: 'recommend-rate-94',
    // Requires the word next to the number in either direction. A bare 94% is
    // not this claim, and must keep failing.
    // The gap may not cross a sentence boundary, or "a 94% success rate. We
    // recommend..." would clear itself using a word from the next sentence.
    patterns: [
      /\b94\s*(?:%|percent)[^.!?\n]{0,60}recommend/i,
      /recommend[^.!?\n]{0,60}\b94\s*(?:%|percent)/i,
    ],
    note:
      'The share of educators who would recommend TDI, published on /for-schools. Rae cleared it ' +
      'on 23 September 2026: "i already told you that stat is right." It is a different claim from ' +
      'the retired keynote figure that happens to share the number, and the register blocked both ' +
      'until 30 September.',
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
    // The recommendation figure is a separate, approved claim. Everything else
    // carrying this number is still retired, including the vaguer readings like
    // "a 94% success rate", which is exactly how a withdrawn number comes back.
    unlessNear: /recommend/i,
    note:
      'The completion figure used in the BRCC keynote, "94 percent finished, 74 percent still ' +
      'doing it", withdrawn for having no source. It must not appear in anything a school, funder ' +
      'or audience sees. Not to be confused with the approved 94% recommendation rate.',
  },
];

/** Every approved claim a piece of text makes. */
export function approvedClaimsIn(text?: string | null): Claim[] {
  const t = String(text ?? '');
  if (!t.trim()) return [];
  return APPROVED_CLAIMS.filter((c) => makesClaim(t, c));
}

/** Every retired claim a piece of text makes. Any hit is a hard stop. */
export function retiredClaimsIn(text?: string | null): Claim[] {
  const t = String(text ?? '');
  if (!t.trim()) return [];
  return RETIRED_CLAIMS.filter((c) => makesClaim(t, c));
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
