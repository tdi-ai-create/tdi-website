import { getServiceSupabase } from '@/lib/supabase'

/**
 * Check if an email belongs to a TDI admin team member.
 * Checks both the @teachersdeserveit.com domain AND the team_members table.
 * This allows external team members (like Omar) to access admin APIs.
 */
export async function isTDIAdmin(email: string): Promise<boolean> {
  // Fast path: TDI domain emails are always admin
  if (email.toLowerCase().endsWith('@teachersdeserveit.com')) {
    return true
  }

  // Check team_members table for external team members
  try {
    const supabase = getServiceSupabase()
    const { data } = await supabase
      .from('team_members')
      .select('id, is_active')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single()

    return !!data
  } catch {
    return false
  }
}
