import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Which Hub accounts are allowed to appear in a number that leaves the building.
 *
 * Internal accounts exist so someone can walk the Hub as a first-time educator:
 * Maya auditing UX, QA verifying a fix. Their clicks land in `hub_enrollments`
 * and `hub_lesson_progress` looking exactly like a teacher's, and those tables
 * feed funder reporting. So reporting has to be able to tell them apart.
 *
 * This replaces three copies of a regex that guessed from the email address:
 *
 *   /test|demo|example\.com|@tdi\.internal/i
 *
 * It was wrong in the direction that is hard to notice. On 2026-09-01 it matched
 * 149 of 104,512 profiles, and 125 of those look like real people whose address
 * simply contains "test" or "demo" (Testani, Demarco, and so on). They were
 * being dropped from admin analytics with nothing to say so. None had
 * enrollments, so engagement counts were unharmed, but signup counts were
 * understated and the failure mode would grow with the roster.
 *
 * A flag set deliberately at account creation cannot misfire on someone's name.
 *
 * The rule, and it is narrow on purpose:
 *
 *   Anything a funder, partner or briefing sees excludes test accounts.
 *   Anything a learner sees about themselves does not.
 *
 * The second half matters. Filtering a test account out of its own dashboard
 * would make it useless for auditing, which is the only reason it exists.
 */
export async function testAccountIds(supabase: SupabaseClient): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('hub_profiles')
    .select('id')
    .eq('is_test_account', true)

  // Failing open would quietly reinstate the bug this exists to prevent, so a
  // reporting caller gets the error rather than a silently inflated number.
  if (error) throw new Error(`Could not resolve test accounts: ${error.message}`)
  return new Set((data || []).map(r => r.id as string))
}
