// ---------------------------------------------------------------------------
// Who owns a piece of grant work.
//
// There were two answers to this and they disagreed on the same rows.
//
// The board (`computeNextActions`, via /api/funding/queue) called a TDI-owned
// item `team`. The school card on the same screen called a TDI-owned item an
// agent's unless its category happened to be submission, follow_up or approval.
// So eleven of the thirteen open items belonging to a person were filed under
// "Agent Pipeline" on the card and counted as hers on the board, and the two
// numbers on one page could never be reconciled by the person reading them.
//
// Rae settled it on 7 September 2026: every piece of work in Funding and
// Creator Studio that needs a human is Bella's. There is no second human to
// disambiguate from, so matching on a name is the wrong question entirely, and
// `owner_name` is null on seven of those thirteen rows anyway.
//
// The data agrees. Measured across every live pursuit on 7 Sep 2026:
//
//   owner_type 'tdi'     13 rows   every one of them a person's
//   owner_type 'client'    2 rows   the school's
//   owned by an agent      0 rows
//
// Agents do not own action items at all. An agent's work is an opportunity
// (`funding_opportunities.assigned_agent`, "queued for a writer"), which is a
// different table and is already shown separately as "Running by itself". So
// the category test was never separating agents from people. It was splitting
// one person's queue in half on a field that means something else.
// ---------------------------------------------------------------------------

export type FundingOwner = 'person' | 'school';

/** Accepts either the API shape (`ownerType`) or a raw row (`owner_type`). */
export interface OwnedItem {
  ownerType?: string | null;
  owner_type?: string | null;
}

/**
 * The single answer to "whose is this action item".
 *
 * Anything the school owes us is the school's. Everything else needs a person,
 * and every person's item in this system is Bella's.
 */
export function ownerOf(item: OwnedItem): FundingOwner {
  const t = (item.ownerType ?? item.owner_type ?? '').toLowerCase();
  return t === 'client' ? 'school' : 'person';
}

export function isPersonOwned(item: OwnedItem): boolean {
  return ownerOf(item) === 'person';
}

export function isSchoolOwned(item: OwnedItem): boolean {
  return ownerOf(item) === 'school';
}
