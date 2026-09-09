// ---------------------------------------------------------------------------
// Asking Resend what actually happened to a message we sent.
//
// Found 8 September 2026, and it is the silent-write bug class wearing a new
// coat. Resend keeps a suppression list. Forty addresses were on it, eleven of
// them one district. When you send to a suppressed address, Resend answers 200
// with a real message id and never delivers anything. Our send site sees a 200,
// records a row, and every report we have says the message went.
//
// Worse than a bounce, because a bounce at least fires a webhook. A suppressed
// message produces no delivery event ever, so "no news" looks identical to
// "still in flight", and stays that way for good.
//
// So we ask. The webhook remains the fast path for the normal case; this is the
// backstop that closes the cases a webhook can never tell us about.
// ---------------------------------------------------------------------------

/** What Resend says the last thing to happen to a message was. */
export interface ResendStatus {
  /** Raw last_event from Resend, lowercased. Null when it reports none yet. */
  lastEvent: string | null;
  /** True when Resend refused to send at all. Nothing was attempted. */
  suppressed: boolean;
  /** True when it was attempted and rejected by the receiving server. */
  bounced: boolean;
  /** True when Resend confirms it reached the recipient's server. */
  delivered: boolean;
  /** Set when the lookup itself failed, so a caller never mistakes it for news. */
  error?: string;
}

/**
 * Reads one message's status.
 *
 * Never throws. A failed lookup returns an error rather than a verdict,
 * because the whole point of this file is that silence must stop being
 * mistaken for success.
 */
export async function getResendStatus(providerId: string, apiKey: string): Promise<ResendStatus> {
  const none: ResendStatus = { lastEvent: null, suppressed: false, bounced: false, delivered: false };

  try {
    const res = await fetch(`https://api.resend.com/emails/${encodeURIComponent(providerId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      return { ...none, error: `Resend returned ${res.status} for ${providerId}` };
    }

    const body = await res.json();
    const raw = body?.last_event ?? body?.status ?? null;
    const lastEvent = typeof raw === 'string' ? raw.toLowerCase() : null;

    return {
      lastEvent,
      // Matched loosely on purpose. The exact wording is Resend's to change,
      // and treating an unrecognised suppression as "fine" is the failure this
      // exists to prevent.
      suppressed: Boolean(lastEvent && lastEvent.includes('suppress')),
      bounced: Boolean(lastEvent && lastEvent.includes('bounce')),
      delivered: lastEvent === 'delivered',
    };
  } catch (e) {
    return { ...none, error: `Could not reach Resend for ${providerId}: ${String((e as Error).message ?? e)}` };
  }
}

/**
 * How long to wait before treating silence as worth investigating.
 *
 * Delivery normally reports back in seconds. Fifteen minutes is long enough
 * that a slow receiving server is not mistaken for a problem, and short enough
 * that a suppressed send is caught the same hour rather than never.
 */
export const SILENCE_BEFORE_ASKING_MINUTES = 15;
