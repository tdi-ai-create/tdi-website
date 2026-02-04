import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Debug endpoint to see a creator's milestone state
 * Usage: GET /api/admin/debug-creator-milestones?name=Kimberelle
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nameSearch = searchParams.get('name') || '';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, error: 'Server config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Find creator by name
    const { data: creators } = await supabase
      .from('creators')
      .select('id, name, content_path')
      .ilike('name', `%${nameSearch}%`)
      .limit(1);

    if (!creators || creators.length === 0) {
      return NextResponse.json({ success: false, error: 'Creator not found' }, { status: 404 });
    }

    const creator = creators[0];

    // Get all phases ordered
    const { data: phases } = await supabase
      .from('phases')
      .select('id, name, sort_order')
      .order('sort_order', { ascending: true });

    // Get all milestones
    const { data: allMilestones } = await supabase
      .from('milestones')
      .select('id, phase_id, sort_order, applies_to, title, name');

    // Get creator's milestones
    const { data: creatorMilestones } = await supabase
      .from('creator_milestones')
      .select('milestone_id, status')
      .eq('creator_id', creator.id);

    const contentPath = creator.content_path;

    // Build detailed view
    const milestoneDetails = allMilestones?.map(m => {
      const phase = phases?.find(p => p.id === m.phase_id);
      const creatorMs = creatorMilestones?.find(cm => cm.milestone_id === m.id);
      const appliesTo = m.applies_to as string[] | null;
      const isApplicable = !contentPath ||
        !appliesTo || appliesTo.length === 0 ||
        appliesTo.includes(contentPath);

      return {
        id: m.id,
        title: m.title || m.name,
        phase: phase?.name,
        phaseOrder: phase?.sort_order,
        sortOrder: m.sort_order,
        appliesTo: m.applies_to,
        isApplicable,
        status: creatorMs?.status || 'no_record',
      };
    }).sort((a, b) => {
      if ((a.phaseOrder || 0) !== (b.phaseOrder || 0)) {
        return (a.phaseOrder || 0) - (b.phaseOrder || 0);
      }
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });

    // Filter to only applicable milestones
    const applicableMilestones = milestoneDetails?.filter(m => m.isApplicable);

    // Find first locked applicable milestone where all prior are completed
    const firstUnlockable = applicableMilestones?.find((m, idx) => {
      if (m.status !== 'locked') return false;
      const priorMilestones = applicableMilestones.slice(0, idx);
      return priorMilestones.every(pm => pm.status === 'completed');
    });

    // Check conditions
    const hasAvailableApplicable = applicableMilestones?.some(m =>
      m.status === 'available' || m.status === 'in_progress'
    );
    const hasCompleted = applicableMilestones?.some(m => m.status === 'completed');

    return NextResponse.json({
      success: true,
      creator: {
        id: creator.id,
        name: creator.name,
        contentPath: creator.content_path,
      },
      diagnosis: {
        hasAvailableApplicable,
        hasCompleted,
        wouldBeFixed: !hasAvailableApplicable && hasCompleted && firstUnlockable,
        firstUnlockable: firstUnlockable?.title || null,
      },
      applicableMilestones: applicableMilestones?.map(m => ({
        title: m.title,
        phase: m.phase,
        status: m.status,
      })),
      allMilestones: milestoneDetails,
    });
  } catch (error) {
    console.error('[debug-creator-milestones] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
