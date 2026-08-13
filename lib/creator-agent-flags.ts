// ---------------------------------------------------------------------------
// Agent flags on creators.
//
// Anne Marie raises a flag when TDI owes a creator a response, for example
// "Milestone blog_drafted waiting 139 days for TDI review". Until now the only
// thing that cleared one was an explicit clear_flag call, so doing the work the
// flag asked for did not retire the flag. Three stale flags had accumulated by
// Aug 13, including two whose milestones were completed the same morning.
//
// A flag that outlives its cause trains people to ignore flags, which is worse
// than not having them.
// ---------------------------------------------------------------------------

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Clear a creator's agent flag if it points at a milestone that is now done.
 *
 * The flag is free text with the milestone id embedded, so matching is a
 * substring check. That is deliberately conservative: an unrelated flag stays
 * up rather than being cleared by a milestone it never mentioned.
 *
 * Never throws. Failing to clear a flag must not fail the completion that
 * triggered it.
 */
export async function clearFlagForCompletedMilestone(
  supabase: SupabaseClient,
  creatorId: string,
  milestoneId: string
): Promise<boolean> {
  if (!creatorId || !milestoneId) return false;

  try {
    const { data: creator } = await supabase
      .from('creators')
      .select('agent_flag, agent_flag_cleared')
      .eq('id', creatorId)
      .single();

    const flag = creator?.agent_flag;
    if (!flag || creator?.agent_flag_cleared) return false;
    if (!flag.includes(milestoneId)) return false;

    const { error } = await supabase
      .from('creators')
      .update({ agent_flag: null, agent_flag_at: null, agent_flag_cleared: true })
      .eq('id', creatorId);

    if (error) {
      console.error('[agent-flags] Could not clear flag:', error.message);
      return false;
    }

    console.log(`[agent-flags] Cleared flag for ${creatorId} after ${milestoneId} completed`);
    return true;
  } catch (err) {
    console.error('[agent-flags] Unexpected error clearing flag:', err);
    return false;
  }
}
