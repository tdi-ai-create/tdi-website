// ---------------------------------------------------------------------------
// How often we are allowed to email a creator who has never opened the door.
//
// Measured 8 September 2026. Fourteen active creators have never once signed
// in, and we have kept writing to them anyway:
//
//   Walter Cullin Jr    10 emails in 90 days, never signed in
//   Joe Vercellino       9
//   Jay Jackson          8
//   Kim Lohse            8
//   Nancy Hankee         5, four of them inside eight days
//
// Nancy, Keelie and Celia each got four emails between 1 and 8 September: the
// monthly newsletter, an invite, a check-in, and a step reminder. Seven separate
// crons write to creators and each behaves as though it is the only one, so
// nobody chose that volume. It is what happens when nothing is counting.
//
// Three of the eight are on school or district domains (saisd.net, fusdk12.net,
// asd4.org) where filtering is aggressive. Repeatedly mailing an address that
// has never engaged is how a sender teaches a spam filter to bury it, so the
// most likely effect of the fourth email is to reduce the chance the fifth
// arrives. We cannot even check: creator_email_log records that we sent and
// never what happened next.
//
// So: somebody who has never signed in hears from us at most once a fortnight,
// across everything. Somebody who has signed in is unaffected, because they are
// engaged and the individual crons already have their own rules. An email an
// admin deliberately sends is never blocked, because a person chose it.
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any */
type DbClient = any;

/** One email per this many days to somebody who has never signed in. */
export const SILENT_CREATOR_CONTACT_DAYS = 14;

export interface ContactVerdict {
  ok: boolean;
  /** Why it was held, in words fit for a cron's response body. */
  reason?: string;
}

export interface ContactGate {
  may(email: string | null | undefined, opts?: { deliberate?: boolean }): ContactVerdict;
  /** How many accounts have ever signed in, for a run's report. */
  signedInCount: number;
}

/**
 * Loads everything the decision needs in two queries, then answers in memory.
 *
 * Built once per cron run rather than per creator: listUsers is a paged API
 * call and the log query would otherwise run once per recipient.
 *
 * Fails OPEN. If either lookup fails we allow the send, because silently
 * suppressing a creator's mail on a transient error is a worse failure than one
 * extra email, and a suppression nobody can see is the kind of bug that takes
 * months to find.
 */
export async function loadContactGate(supabase: DbClient): Promise<ContactGate> {
  const signedIn = new Set<string>();
  let signInLookupOk = true;

  try {
    const { data, error } = await supabase.auth.admin.listUsers({ perPage: 5000 });
    if (error) throw new Error(error.message);
    for (const u of (data?.users ?? []) as Array<{ email?: string; last_sign_in_at?: string }>) {
      if (u.email && u.last_sign_in_at) signedIn.add(u.email.trim().toLowerCase());
    }
  } catch (e) {
    signInLookupOk = false;
    console.error('[contact-budget] Could not read sign-ins, allowing all sends:', String((e as Error).message ?? e));
  }

  const since = new Date(Date.now() - SILENT_CREATOR_CONTACT_DAYS * 86400000).toISOString();
  const lastContact = new Map<string, string>();
  let logLookupOk = true;

  try {
    const { data, error } = await supabase
      .from('creator_email_log')
      .select('creator_email, sent_at, dry_run')
      .gte('sent_at', since);
    if (error) throw new Error(error.message);
    for (const row of (data ?? []) as Array<{ creator_email: string; sent_at: string; dry_run: boolean | null }>) {
      // A dry run did not reach anybody, so it must not count against a budget
      // that exists to protect a real inbox.
      if (row.dry_run) continue;
      if (!row.creator_email) continue;
      const key = row.creator_email.trim().toLowerCase();
      const prev = lastContact.get(key);
      if (!prev || row.sent_at > prev) lastContact.set(key, row.sent_at);
    }
  } catch (e) {
    logLookupOk = false;
    console.error('[contact-budget] Could not read the email log, allowing all sends:', String((e as Error).message ?? e));
  }

  const healthy = signInLookupOk && logLookupOk;

  return {
    signedInCount: signedIn.size,
    may(email, opts) {
      if (!healthy) return { ok: true };
      if (opts?.deliberate) return { ok: true };
      if (!email) return { ok: true };

      const key = email.trim().toLowerCase();
      if (signedIn.has(key)) return { ok: true };

      const last = lastContact.get(key);
      if (!last) return { ok: true };

      const days = Math.floor((Date.now() - new Date(last).getTime()) / 86400000);
      return {
        ok: false,
        reason:
          `has never signed in and was emailed ${days} day${days === 1 ? '' : 's'} ago; ` +
          `one message per ${SILENT_CREATOR_CONTACT_DAYS} days until they do`,
      };
    },
  };
}
