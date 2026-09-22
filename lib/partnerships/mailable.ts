/**
 * Who may be emailed as a paying client.
 *
 * `partnerships.status = 'active'` was doing two unrelated jobs. It meant "this
 * record is live enough to show data on leadership screens", and it meant "this
 * contact may be mailed as a client". Every partner email cron read the second
 * meaning out of a flag that got set for the first.
 *
 * On 2026-08-31 a Morenci record was created at `status = 'active'` so the 15
 * educators already trialling the Hub would appear on leadership screens. Its
 * own `next_steps_notes` said so, and said nothing was signed: the proposal had
 * gone out on 15 Jun for $21,600 and nothing was invoiced or paid. Jennifer
 * Morales then received the monthly principal email on 1 Sep and the seasonal
 * partner email on 15 Sep, both written for signed partners. A Crowley ISD
 * record did the same thing on 1 Sep with a placeholder contact.
 *
 * They escaped the six-step onboarding drip only because `invite_sent_at`
 * happened to be null on both. `POST /api/admin/partnerships` sets that field
 * on creation, so the next prospect made through the admin form would have
 * received the whole sequence, re-checked daily.
 *
 * The discriminator is `contract_start`.
 *
 * Both automated creation paths always populate it: `deal-to-partnership`
 * defaults it to today, and `quotes/[id]/sign` takes it from the quote. Only a
 * hand-made row lacks it. Measured 2026-09-22: all 9 real partnerships have a
 * `contract_start`, and both removed records had null, so this gate changes
 * nothing for anyone currently being mailed.
 *
 * It also fails in the safe direction. A signed client whose `contract_start`
 * was never filled in goes unmailed, which someone notices and fixes; the
 * opposite error mails a prospect as though they had already bought.
 *
 * This is deliberately one definition rather than a `.not('contract_start')`
 * added to five queries. Consolidating `isTDIAdmin` taught the same lesson the
 * expensive way: three rival copies drifted for months because naming a
 * canonical helper is not the same as retiring the others. If you add a sixth
 * cron that mails a partner contact, call this. Do not re-derive it.
 */

/** The subset of a partnership row this decision needs. */
export interface MailableCandidate {
  id?: string;
  org_name?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  status?: string | null;
  contract_start?: string | null;
}

/**
 * Statuses that can be mailed at all, before the signed test.
 *
 * `expiring` is included because a partnership in its renewal window is still a
 * client and still needs its mail. `invited` and `setup_in_progress` are not:
 * those are handled by the onboarding sequence, which applies its own rules.
 * `paused` and `completed` are deliberately excluded.
 */
export const MAILABLE_STATUSES = ['active', 'expiring'] as const;

/** Why a partnership was excluded. Null when it is mailable. */
export type NotMailableReason = 'unsigned' | 'status' | 'no_email';

/**
 * Why this partnership may not be mailed as a client, or null if it may.
 *
 * Returns the reason rather than a boolean so callers can report what they
 * skipped. A cron that silently drops a partner is how a real client stops
 * receiving mail for a month without anyone knowing.
 */
export function notMailableReason(p: MailableCandidate): NotMailableReason | null {
  if (!p.contact_email) return 'no_email';
  if (!p.status || !(MAILABLE_STATUSES as readonly string[]).includes(p.status)) {
    return 'status';
  }
  // The signed test. A record with no contract start date is a prospect
  // someone made visible, not a client we have an agreement with.
  if (!p.contract_start) return 'unsigned';
  return null;
}

/** True when this partnership may receive email written for a paying client. */
export function isClientMailable(p: MailableCandidate): boolean {
  return notMailableReason(p) === null;
}

/** How a skipped partnership is reported back in a cron response. */
export interface SkippedPartnership {
  id: string | null;
  name: string;
  reason: NotMailableReason;
}

/**
 * Split a list of partnerships into the ones that may be mailed and the ones
 * that may not, with a reason for each exclusion.
 *
 * Callers should put `skipped` in their response body. `unsigned` entries are
 * the ones worth reading: each is either a prospect correctly held back, or a
 * real client missing a `contract_start` that needs fixing.
 */
export function splitMailable<T extends MailableCandidate>(
  partnerships: T[]
): { mailable: T[]; skipped: SkippedPartnership[] } {
  const mailable: T[] = [];
  const skipped: SkippedPartnership[] = [];

  for (const p of partnerships) {
    const reason = notMailableReason(p);
    if (reason === null) {
      mailable.push(p);
    } else {
      skipped.push({
        id: p.id ?? null,
        name: p.org_name || p.contact_name || p.id || 'unnamed',
        reason,
      });
    }
  }

  return { mailable, skipped };
}

/**
 * Columns every caller must select for the decision to be made correctly.
 *
 * A query that forgets `contract_start` gets `undefined`, which reads as
 * unsigned and silently stops that partner's mail. Spreading this constant into
 * the select string makes that impossible to forget.
 */
export const MAILABLE_COLUMNS = 'id, org_name, contact_name, contact_email, status, contract_start';
