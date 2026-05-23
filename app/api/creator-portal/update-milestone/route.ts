import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, error: 'Server config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { creatorId, milestoneId, status, completedBy } = await request.json();

    if (!creatorId || !milestoneId || !status) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
      updateData.completed_by = completedBy || 'creator';
    }

    const { error: updateError } = await supabase
      .from('creator_milestones')
      .update(updateData)
      .eq('creator_id', creatorId)
      .eq('milestone_id', milestoneId);

    if (updateError) {
      console.error('[update-milestone] Error:', updateError);
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    // If marking complete, unlock the next milestone
    if (status === 'completed') {
      const { data: milestone } = await supabase
        .from('milestones')
        .select('*, phases!inner(sort_order)')
        .eq('id', milestoneId)
        .single();

      const { data: creatorData } = await supabase
        .from('creators')
        .select('content_path')
        .eq('id', creatorId)
        .single();
      const contentPath = creatorData?.content_path;

      if (milestone) {
        // Find next milestone in same phase
        let { data: nextMilestone } = await supabase
          .from('milestones')
          .select('id, sort_order')
          .eq('phase_id', milestone.phase_id)
          .gt('sort_order', milestone.sort_order)
          .lt('sort_order', 98)
          .order('sort_order', { ascending: true })
          .limit(1)
          .maybeSingle();

        // If no next in current phase, find first in next phase
        if (!nextMilestone) {
          const { data: futureMilestones } = await supabase
            .from('milestones')
            .select('*, phases!inner(sort_order)')
            .gt('phases.sort_order', (milestone as any).phases?.sort_order ?? 0)
            .lt('sort_order', 98)
            .order('phases(sort_order)', { ascending: true })
            .order('sort_order', { ascending: true });

          if (futureMilestones) {
            for (const fm of futureMilestones) {
              const appliesTo = fm.applies_to as string[] | null;
              const isApplicable = !contentPath ||
                !appliesTo || appliesTo.length === 0 ||
                appliesTo.includes(contentPath);
              if (isApplicable) {
                nextMilestone = fm;
                break;
              }
            }
          }
        }

        if (nextMilestone) {
          await supabase
            .from('creator_milestones')
            .update({
              status: 'available',
              completed_at: null,
              completed_by: null,
              updated_at: new Date().toISOString(),
            })
            .eq('creator_id', creatorId)
            .eq('milestone_id', nextMilestone.id)
            .eq('status', 'locked');
        }
      }
    }

    console.log('[update-milestone] Success:', { creatorId, milestoneId, status });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[update-milestone] Error:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
