import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// POST /api/admin/creators/[id]/ai-summary
// Generates an on-demand summary of a creator's profile for the admin team.
// Pulls milestones, notes, activity, and re-engagement status to produce
// a concise briefing Bella can use for quick context or communication.

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Gather all creator data in parallel
    const [creatorRes, milestonesRes, notesRes, reengagementRes] = await Promise.all([
      supabase.from('creators').select('*').eq('id', id).single(),
      supabase
        .from('creator_milestones')
        .select('milestone_id, status, completed_at, notes, updated_at')
        .eq('creator_id', id)
        .order('updated_at', { ascending: false }),
      supabase
        .from('creator_notes')
        .select('content, author, visible_to_creator, created_at')
        .eq('creator_id', id)
        .order('created_at', { ascending: false })
        .limit(15),
      supabase
        .from('creator_reengagement_sequences')
        .select('*')
        .eq('creator_id', id)
        .order('created_at', { ascending: false })
        .limit(3),
    ]);

    const creator = creatorRes.data;
    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    const milestones = milestonesRes.data || [];
    const notes = notesRes.data || [];
    const reengagement = reengagementRes.data || [];

    const completedCount = milestones.filter((m: any) => m.status === 'completed').length;
    const inProgressCount = milestones.filter((m: any) => m.status === 'in_progress').length;
    const waitingCount = milestones.filter((m: any) => m.status === 'waiting_approval').length;
    const totalCount = milestones.length;

    const daysSinceActive = creator.updated_at
      ? Math.floor((Date.now() - new Date(creator.updated_at).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const reengagementInfo = reengagement.length > 0
      ? reengagement.map((r: any) => `Sequence ${r.status}: started ${new Date(r.started_at).toLocaleDateString()}, step ${r.current_step}/6${r.cancelled_reason ? `, cancelled: ${r.cancelled_reason}` : ''}`).join('; ')
      : 'No re-engagement sequences';

    const latestNote = notes.length > 0
      ? `${notes[0].author} on ${new Date(notes[0].created_at).toLocaleDateString()}: "${notes[0].content.slice(0, 120)}${notes[0].content.length > 120 ? '...' : ''}"`
      : null;

    // Build Status Snapshot
    const activityLabel = daysSinceActive !== null
      ? (daysSinceActive <= 7 ? 'active this week' : daysSinceActive <= 30 ? `active ${daysSinceActive} days ago` : `inactive for ${daysSinceActive} days`)
      : 'unknown activity';
    const lifecycleLabel = creator.lifecycle_state || 'active';
    const statusSnapshot = `**Status Snapshot**\n${creator.name} is in the ${creator.current_phase} phase (${creator.status}, lifecycle: ${lifecycleLabel}), ${activityLabel}. ${completedCount} of ${totalCount} milestones completed.`;

    // Build Key Details
    const keyDetails: string[] = [];
    keyDetails.push(`Course: ${creator.course_title || 'Not set'} | Content path: ${creator.content_path || 'Not set'}`);
    keyDetails.push(`Progress: ${completedCount} completed, ${inProgressCount} in progress, ${waitingCount} waiting approval`);
    keyDetails.push(`Target completion: ${creator.target_completion_date || 'Not set'}`);
    keyDetails.push(`Agreement signed: ${creator.agreement_signed ? 'Yes' : 'No'}`);
    keyDetails.push(`Re-engagement: ${reengagementInfo}`);
    if (latestNote) {
      keyDetails.push(`Latest note: ${latestNote}`);
    }
    const keyDetailsSection = `**Key Details**\n${keyDetails.map(d => `- ${d}`).join('\n')}`;

    // Build Suggested Action
    let suggestedAction: string;
    if (waitingCount > 0) {
      suggestedAction = `Review ${waitingCount} milestone${waitingCount > 1 ? 's' : ''} waiting for approval.`;
    } else if (daysSinceActive !== null && daysSinceActive > 30) {
      suggestedAction = `${creator.name} has been inactive for ${daysSinceActive} days. Consider a personal check-in.`;
    } else if (inProgressCount > 0) {
      suggestedAction = `${inProgressCount} milestone${inProgressCount > 1 ? 's are' : ' is'} in progress. Check in to see if anything is blocked.`;
    } else if (completedCount === 0) {
      suggestedAction = `No milestones completed yet. Reach out to help ${creator.name} get started.`;
    } else if (completedCount === totalCount && totalCount > 0) {
      suggestedAction = `All milestones complete. Confirm launch readiness and next steps.`;
    } else {
      suggestedAction = `No urgent action needed. Keep monitoring progress.`;
    }
    const suggestedActionSection = `**Suggested Action**\n${suggestedAction}`;

    const summary = `${statusSnapshot}\n\n${keyDetailsSection}\n\n${suggestedActionSection}`;

    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    console.error('[ai-summary] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
