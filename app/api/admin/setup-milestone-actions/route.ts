import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Define action types for all milestones (matching demo functionality)
const milestoneActions: Record<string, { action_type: string; action_config: Record<string, unknown>; requires_team_action: boolean }> = {
  // Onboarding
  'intake_completed': {
    action_type: 'confirm',
    action_config: { label: "I've Completed the Intake Form" },
    requires_team_action: false,
  },
  'team_intake_review': {
    action_type: 'team_action',
    action_config: { label: 'Waiting on TDI Team' },
    requires_team_action: true,
  },
  'creator_intake_review': {
    action_type: 'review',
    action_config: { label: "I've Reviewed the Notes" },
    requires_team_action: false,
  },
  'rae_meeting_scheduled': {
    action_type: 'calendly',
    action_config: { url: 'https://calendly.com/rae-teachersdeserveit/creator-chat', label: 'Book Your Kickoff Call' },
    requires_team_action: false,
  },
  'rae_meeting_completed': {
    action_type: 'team_action',
    action_config: { label: 'Waiting on TDI Team' },
    requires_team_action: true,
  },

  // Agreement
  'agreement_sign': {
    action_type: 'sign_agreement',
    action_config: { label: 'Review & Sign Agreement' },
    requires_team_action: false,
  },

  // Course Design
  'outline_drafted': {
    action_type: 'submit_link',
    action_config: { label: 'Submit Your Outline', link_type: 'google_doc', placeholder: 'Paste your Google Doc link', notify_team: true },
    requires_team_action: false,
  },
  'outline_meeting_scheduled': {
    action_type: 'calendly',
    action_config: { url: 'https://calendly.com/rae-teachersdeserveit/creator-chat', label: 'Schedule Outline Review' },
    requires_team_action: false,
  },
  'outline_meeting_completed': {
    action_type: 'team_action',
    action_config: { label: 'Waiting on TDI Team' },
    requires_team_action: true,
  },
  'outline_finalized': {
    action_type: 'submit_link',
    action_config: { label: 'Submit Final Outline', link_type: 'google_doc', placeholder: 'Paste your updated Google Doc link', notify_team: true },
    requires_team_action: false,
  },
  'final_outline_meeting_scheduled': {
    action_type: 'calendly',
    action_config: { url: 'https://calendly.com/rae-teachersdeserveit/creator-chat', label: 'Schedule Final Review' },
    requires_team_action: false,
  },
  'final_outline_approved': {
    action_type: 'team_action',
    action_config: { label: 'Waiting on TDI Team' },
    requires_team_action: true,
  },

  // Test & Prep
  'test_video_recorded': {
    action_type: 'confirm',
    action_config: { label: "I've Recorded My Test Video" },
    requires_team_action: false,
  },
  'test_video_submitted': {
    action_type: 'submit_link',
    action_config: { label: 'Submit Test Video', link_type: 'video', placeholder: 'Paste your Loom or Google Drive link', notify_team: true },
    requires_team_action: false,
  },
  'test_video_approved': {
    action_type: 'team_action',
    action_config: { label: 'Waiting on TDI Team' },
    requires_team_action: true,
  },
  'downloads_started': {
    action_type: 'confirm',
    action_config: { label: "I've Started Designing Downloads" },
    requires_team_action: false,
  },

  // Production
  'recording_started': {
    action_type: 'confirm',
    action_config: { label: "I've Started Recording" },
    requires_team_action: false,
  },
  'recording_completed': {
    action_type: 'confirm',
    action_config: { label: "I've Finished Recording" },
    requires_team_action: false,
  },
  'drive_folder_created': {
    action_type: 'submit_link',
    action_config: { label: 'Share Drive Folder', link_type: 'google_drive', placeholder: 'Paste your Google Drive folder link', notify_team: true },
    requires_team_action: false,
  },
  'assets_submitted': {
    action_type: 'submit_link',
    action_config: { label: 'Submit Assets', link_type: 'google_drive', placeholder: 'Paste link to your assets', notify_team: true },
    requires_team_action: false,
  },
  'videos_edited': {
    action_type: 'team_action',
    action_config: { label: 'TDI is editing your videos' },
    requires_team_action: true,
  },
  'marketing_created': {
    action_type: 'team_action',
    action_config: { label: 'TDI is creating marketing assets' },
    requires_team_action: true,
  },

  // Launch
  'branding_confirmed': {
    action_type: 'confirm',
    action_config: { label: "I've Approved My Branding" },
    requires_team_action: false,
  },
  'platform_uploaded': {
    action_type: 'team_action',
    action_config: { label: 'TDI is uploading to platform' },
    requires_team_action: true,
  },
  'launch_date_set': {
    action_type: 'team_action',
    action_config: { label: 'TDI is setting launch date' },
    requires_team_action: true,
  },
  'launched': {
    action_type: 'team_action',
    action_config: { label: 'Course launch in progress' },
    requires_team_action: true,
  },
};

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    console.log('[setup-milestone-actions] Starting update...');

    const updates: { id: string; success: boolean; error?: string }[] = [];

    // Update each milestone with its action configuration
    for (const [milestoneId, config] of Object.entries(milestoneActions)) {
      const { error } = await supabase
        .from('milestones')
        .update({
          action_type: config.action_type,
          action_config: config.action_config,
          requires_team_action: config.requires_team_action,
        })
        .eq('id', milestoneId);

      updates.push({
        id: milestoneId,
        success: !error,
        error: error?.message,
      });

      if (error) {
        console.log(`[setup-milestone-actions] Error updating ${milestoneId}:`, error.message);
      }
    }

    // Get updated milestones to verify
    const { data: milestones } = await supabase
      .from('milestones')
      .select('id, name, phase_id, action_type, action_config, requires_team_action')
      .order('phase_id')
      .order('sort_order');

    const successCount = updates.filter(u => u.success).length;
    const failCount = updates.filter(u => !u.success).length;

    console.log('[setup-milestone-actions] Complete:', { successCount, failCount });

    return NextResponse.json({
      success: true,
      message: `Updated ${successCount} milestones, ${failCount} failed`,
      updates,
      milestones,
    });
  } catch (error) {
    console.error('[setup-milestone-actions] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
