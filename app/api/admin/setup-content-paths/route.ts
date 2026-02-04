import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Set up the applies_to field on milestones to enable content path branching.
 *
 * Blog creators: 11 milestones (onboarding + blog-specific)
 * Download creators: 15 milestones (onboarding + download-specific)
 * Course creators: 31 milestones (full workflow)
 */

// Define which milestones apply to which content paths
const milestonePathMapping: Record<string, string[]> = {
  // ===================
  // ONBOARDING - All paths (6 milestones)
  // ===================
  'intake_completed': ['blog', 'download', 'course'],
  'content_path_selection': ['blog', 'download', 'course'],  // ID in DB is content_path_selection
  'team_intake_review': ['blog', 'download', 'course'],
  'creator_intake_review': ['blog', 'download', 'course'],
  'rae_meeting_scheduled': ['blog', 'download', 'course'],
  'rae_meeting_completed': ['blog', 'download', 'course'],

  // ===================
  // AGREEMENT - Course only (2 milestones)
  // ===================
  'agreement_sign': ['course'],
  'creator_details': ['course'],

  // ===================
  // COURSE DESIGN - Course only (7 milestones)
  // ===================
  'outline_drafted': ['course'],
  'outline_meeting_scheduled': ['course'],
  'outline_meeting_completed': ['course'],
  'outline_finalized': ['course'],
  'final_outline_meeting_scheduled': ['course'],
  'final_outline_approved': ['course'],
  'course_guide_reviewed': ['course'],

  // ===================
  // TEST & PREP - Course only (7 milestones)
  // Download has its own version
  // ===================
  'test_video_recorded': ['course'],
  'test_video_submitted': ['course'],
  'test_video_approved': ['course'],
  // Download-specific milestones (also apply to course since courses have downloads)
  'download_defined': ['download', 'course'],      // ID in DB is download_defined
  'download_concept_approved': ['download'],
  'download_drafted': ['download', 'course'],      // ID in DB is download_drafted
  'download_handoff': ['download', 'course'],      // ID in DB is download_handoff

  // ===================
  // PRODUCTION - Course only (6 milestones)
  // ===================
  'recording_started': ['course'],
  'recording_completed': ['course'],
  'drive_folder_created': ['course'],
  'assets_submitted': ['course'],
  'videos_edited': ['course'],
  'marketing_created': ['course'],

  // ===================
  // LAUNCH - Mixed (8 milestones)
  // ===================
  'branding_confirmed': ['course'],
  'platform_uploaded': ['course'],
  // Blog milestones (apply to blog AND course since courses get a launch blog too)
  'blog_pitch': ['blog', 'course'],
  'blog_topic_approved': ['blog', 'course'],
  'blog_drafted': ['blog', 'course'],
  'blog_published': ['blog', 'course'],
  // Course-only launch
  'launch_date_set': ['course'],
  'launched': ['course'],
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

    console.log('[setup-content-paths] Starting update...');

    // First, get all current milestones
    const { data: currentMilestones, error: fetchError } = await supabase
      .from('milestones')
      .select('id, name, phase_id, applies_to')
      .order('phase_id')
      .order('sort_order');

    if (fetchError) {
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
    }

    const updates: { id: string; name: string; applies_to: string[] | null; success: boolean; error?: string }[] = [];
    const unmapped: { id: string; name: string; phase_id: string }[] = [];

    // Update each milestone with its applies_to value
    for (const milestone of currentMilestones || []) {
      const appliesTo = milestonePathMapping[milestone.id];

      if (!appliesTo) {
        // Milestone not in mapping - track it
        unmapped.push({ id: milestone.id, name: milestone.name, phase_id: milestone.phase_id });
        continue;
      }

      const { error } = await supabase
        .from('milestones')
        .update({ applies_to: appliesTo })
        .eq('id', milestone.id);

      updates.push({
        id: milestone.id,
        name: milestone.name,
        applies_to: appliesTo,
        success: !error,
        error: error?.message,
      });

      if (error) {
        console.log(`[setup-content-paths] Error updating ${milestone.id}:`, error.message);
      }
    }

    // Get updated milestones to verify
    const { data: updatedMilestones } = await supabase
      .from('milestones')
      .select('id, name, phase_id, applies_to')
      .order('phase_id')
      .order('sort_order');

    // Count milestones per path
    const pathCounts = {
      blog: updatedMilestones?.filter(m => m.applies_to?.includes('blog')).length || 0,
      download: updatedMilestones?.filter(m => m.applies_to?.includes('download')).length || 0,
      course: updatedMilestones?.filter(m => m.applies_to?.includes('course')).length || 0,
    };

    const successCount = updates.filter(u => u.success).length;
    const failCount = updates.filter(u => !u.success).length;

    console.log('[setup-content-paths] Complete:', { successCount, failCount, pathCounts });

    return NextResponse.json({
      success: true,
      message: `Updated ${successCount} milestones, ${failCount} failed, ${unmapped.length} unmapped`,
      pathCounts,
      updates,
      unmapped,
      milestones: updatedMilestones,
    });
  } catch (error) {
    console.error('[setup-content-paths] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
