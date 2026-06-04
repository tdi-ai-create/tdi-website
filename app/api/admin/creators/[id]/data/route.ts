import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Server-side API route to fetch creator dashboard data using service role.
 * Bypasses RLS so any authenticated admin can view any creator.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: creatorId } = await params;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Get creator
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('*')
      .eq('id', creatorId)
      .single();

    if (creatorError || !creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    // 2. Get all phases
    const { data: phases } = await supabase
      .from('phases')
      .select('*')
      .order('sort_order');

    // 3. Get all milestones
    const { data: milestones } = await supabase
      .from('milestones')
      .select('*')
      .order('sort_order');

    // 4. Get creator's milestone progress
    const { data: creatorMilestones } = await supabase
      .from('creator_milestones')
      .select('*')
      .eq('creator_id', creatorId);

    // 5. Build milestone status map
    const statusMap = new Map(
      (creatorMilestones || []).map((cm: Record<string, unknown>) => [cm.milestone_id, cm])
    );

    // 6. Build phases with milestones
    const contentPath = creator.content_path;
    const phasesWithMilestones = (phases || []).map((phase: Record<string, unknown>) => {
      const phaseMilestones = (milestones || [])
        .filter((m: Record<string, unknown>) => m.phase_id === phase.id)
        .filter((m: Record<string, unknown>) => !(m as Record<string, unknown>).is_collapsed_into)
        .map((m: Record<string, unknown>) => {
          const progress = statusMap.get(m.id) as Record<string, unknown> | undefined;
          const appliesTo = m.applies_to as string[] | null;
          const isApplicable = !contentPath ||
            !appliesTo || appliesTo.length === 0 ||
            appliesTo.includes(contentPath);

          return {
            ...m,
            status: progress?.status || 'locked',
            completed_at: progress?.completed_at || null,
            completed_by: progress?.completed_by || null,
            submission_data: progress?.submission_data || null,
            metadata: progress?.metadata || null,
            notes: progress?.notes || null,
            isApplicable,
          };
        });

      const applicableMilestones = phaseMilestones.filter((m: Record<string, unknown>) => m.isApplicable !== false);
      const completedCount = applicableMilestones.filter((m: Record<string, unknown>) => m.status === 'completed').length;
      const isComplete = applicableMilestones.length > 0 && completedCount === applicableMilestones.length;

      return {
        ...phase,
        milestones: phaseMilestones,
        completedCount,
        totalCount: applicableMilestones.length,
        isComplete,
      };
    });

    // 7. Get notes
    const { data: notes } = await supabase
      .from('creator_notes')
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false });

    // 8. Get projects
    const { data: projects } = await supabase
      .from('creator_projects')
      .select('*')
      .eq('creator_id', creatorId)
      .order('project_number', { ascending: false });

    return NextResponse.json({
      creator,
      phases: phasesWithMilestones,
      notes: notes || [],
      projects: projects || [],
    });
  } catch (error) {
    console.error('[admin/creators/data] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
