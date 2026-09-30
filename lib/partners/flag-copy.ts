/**
 * The sentence an open attention flag shows, written from today's numbers.
 *
 * Flags used to carry their text as a stored string, composed on the morning
 * the flag was first raised and never rewritten. That is deliberate for
 * `first_raised_at`, which has to stay put so we can see how long something has
 * been true. It is wrong for the figure inside the sentence: Addison's flag
 * still read "34% of staff have logged in, 50 of 148" five weeks later, next to
 * a header that said 19%, and neither number was wrong about its own source.
 *
 * So the stored message stays as the historical record and as what goes into an
 * email, and the screen renders the sentence again from live data. An open flag
 * cannot then disagree with the panel above it.
 *
 * Returns null for a flag this does not know how to phrase, and the caller
 * falls back to the stored message rather than showing nothing.
 */

export interface FlagFacts {
  /** Distinct educators using the Hub, on the shared definition. */
  active?: number | null;
  /** Live seats, the denominator for the above. */
  seats?: number | null;
  /** active over seats as a whole percent. */
  pct?: number | null;
  /** Nobody linked to the school has ever authenticated. */
  neverSignedIn?: boolean | null;
  /** A read failed, so no claim should be made from these numbers. */
  unknown?: boolean | null;
}

export function flagSentence(flagKey: string, facts: FlagFacts): string | null {
  // On an outage, say nothing new rather than asserting zero.
  if (facts.unknown) return null;

  switch (flagKey) {
    case 'principal_not_logged_in':
      return facts.neverSignedIn === true
        ? 'Nobody at this school has signed in yet. A direct call is the fastest fix.'
        : null;

    case 'principal_still_not_logged_in':
      return facts.neverSignedIn === true
        ? 'Nobody at this school has ever signed in. This needs a person, not another email.'
        : null;

    case 'staff_logins_below_50': {
      if (facts.active == null || !facts.seats) return null;
      return `${facts.active} of ${facts.seats} educators are using the Hub. Re-engage through the staff champion.`;
    }

    case 'active_usage_below_40': {
      if (facts.pct == null) return null;
      return `Use is at ${facts.pct}%, below the 40% mark. Escalate with a re-engagement plan.`;
    }

    default:
      return null;
  }
}
