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
  /**
   * The colour this person's calls are drawn in, chosen by Rae on 24 September
   * 2026 so the board can be scanned for who is on the phones.
   *
   * `dot` is the filled circle, `ink` is text placed on that circle. Bella's
   * yellow is the brand yellow, which needs dark text on it rather than white,
   * which is why ink is carried per person rather than assumed.
   *
   * Colour is never the only signal: every control that uses these also shows
   * the person's initial, because two of the four are red and green.
   */
  dot: string
  ink: string
}

export const SALES_TEAM: readonly TeamMember[] = [
  { email: 'rae@teachersdeserveit.com', label: 'Rae', dot: '#DC2626', ink: '#FFFFFF' },
  { email: 'hello@teachersdeserveit.com', label: 'Bella', dot: '#ffba06', ink: '#1e2749' },
  { email: 'kristin@whatwilllast.com', label: 'Kristin', dot: '#2563EB', ink: '#FFFFFF' },
  { email: 'jim@teachersdeserveit.com', label: 'Jim', dot: '#059669', ink: '#FFFFFF' },
] as const

/** The person on the phones for a lead, or null when nobody is. */
export function callerOf(email: string | null | undefined): TeamMember | null {
  if (!email) return null
  return SALES_TEAM.find(m => m.email === email.toLowerCase().trim()) ?? null
}

/** Nobody assigned. Grey, and shown as a dash rather than an initial. */
export const NO_CALLER = { dot: '#E5E7EB', ink: '#9CA3AF' } as const

/**
 * The name to show for a stored address.
 *
 * Falls back to the raw string rather than to "Unknown". 79 rows carry
 * `blRAscdKSZLQMumakHZY` in `assigned_to_email` from an old import; all 79 are
 * soft deleted today, so none of them is on the live board, but the column
 * still accepts anything and an undeleted one would be invisible behind a
 * friendly word. Showing the junk makes it findable.
 */
export function teamLabel(email: string | null | undefined): string {
  if (!email) return 'Unassigned'
  const hit = SALES_TEAM.find(m => m.email === email.toLowerCase().trim())
  return hit ? hit.label : email
}
