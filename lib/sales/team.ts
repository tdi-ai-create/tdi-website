/**
 * Who can be given a lead or a call.
 *
 * One roster, one place. The panel's "Assigned to" dropdown, the board's
 * right-click Assign submenu and the analytics label map each carried their own
 * hardcoded copy, and all three listed only Rae and Jim. Rae, 24 September
 * 2026: "Jim is not the only one calling these days." Three separate lists is
 * how that stayed true for months after it stopped being true, so adding a
 * fifth person is now a one line change here.
 *
 * Addresses are the ones the team table actually holds, not the ones people
 * guess at. Bella works out of hello@teachersdeserveit.com, which is a shared
 * mailbox rather than a personal one. Kristin has three rows in
 * `tdi_team_members`; kristin@whatwilllast.com is the named one.
 *
 * Jim is deliberately here without a `tdi_team_members` row. He owns 145 leads
 * on the live board, so dropping him would orphan them; the roster is about who
 * can be named on a lead, not who can sign in.
 */
export interface TeamMember {
  email: string
  /** What a human sees. First name only, because that is how the team talks. */
  label: string
}

export const SALES_TEAM: readonly TeamMember[] = [
  { email: 'rae@teachersdeserveit.com', label: 'Rae' },
  { email: 'hello@teachersdeserveit.com', label: 'Bella' },
  { email: 'kristin@whatwilllast.com', label: 'Kristin' },
  { email: 'jim@teachersdeserveit.com', label: 'Jim' },
] as const

/**
 * The name to show for a stored address.
 *
 * Falls back to the raw string rather than to "Unknown", because 79 leads carry
 * `blRAscdKSZLQMumakHZY` in `assigned_to_email` from an old import. Showing the
 * junk makes it findable. Hiding it behind a friendly word does not.
 */
export function teamLabel(email: string | null | undefined): string {
  if (!email) return 'Unassigned'
  const hit = SALES_TEAM.find(m => m.email === email.toLowerCase().trim())
  return hit ? hit.label : email
}
