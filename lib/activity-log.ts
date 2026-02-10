import { SupabaseClient } from '@supabase/supabase-js';

export type ActivityAction =
  | 'invite_generated'
  | 'account_created'
  | 'setup_completed'
  | 'login'
  | 'tab_viewed'
  | 'action_item_completed'
  | 'action_item_paused'
  | 'action_item_resumed'
  | 'file_uploaded'
  | 'metric_updated'
  | 'intake_step1_completed'
  | 'intake_step2_completed'
  | 'intake_step3_completed';

export async function logActivity(
  supabase: SupabaseClient,
  partnershipId: string,
  action: ActivityAction,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('activity_log').insert({
      partnership_id: partnershipId,
      user_id: user?.id || null,
      action,
      details: details || {},
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export async function logActivityServer(
  supabase: SupabaseClient,
  partnershipId: string,
  userId: string | null,
  action: ActivityAction,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    await supabase.from('activity_log').insert({
      partnership_id: partnershipId,
      user_id: userId,
      action,
      details: details || {},
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}
