import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { progressMilestone } from '@/lib/milestone-progression';

const VALID_CONTENT_PATHS = ['blog', 'download', 'course'] as const;

function milestoneAppliesTo(
  milestone: { applies_to?: string[] | null },
  contentPath: string
): boolean {
  if (!milestone.applies_to || milestone.applies_to.length === 0) {
    return contentPath === 'course';
  }
  return milestone.applies_to.includes(contentPath);
}

export async function POST(request: Request) {
  try {
    const authClient = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.email?.endsWith('@teachersdeserveit.com')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const adminEmail = user.email;

    const body = await request.json();
    const { creatorId, contentPath, milestoneOrder, notes } = body;

    if (!creatorId || !contentPath || milestoneOrder === undefined || milestoneOrder === null) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: creatorId, contentPath, milestoneOrder',
      }, { status: 400 });
    }

    if (!VALID_CONTENT_PATHS.includes(contentPath)) {
      return NextResponse.json({
        success: false,
        error: 'contentPath must be one of: blog, download, course',
      }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, error: 'Server config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: candidates, error: milestoneError } = await supabase
      .from('milestones')
      .select('id, sort_order, phase_id, applies_to, title, name')
      .eq('sort_order', milestoneOrder);

    if (milestoneError) {
      return NextResponse.json({ success: false, error: milestoneError.message }, { status: 500 });
    }

    const milestone = (candidates ?? []).find((m: { applies_to?: string[] | null }) =>
      milestoneAppliesTo(m, contentPath)
    );

    if (!milestone) {
      return NextResponse.json({
        success: false,
        error: `No milestone found for contentPath="${contentPath}" milestoneOrder=${milestoneOrder}`,
      }, { status: 404 });
    }

    const { data: creatorMilestone, error: cmError } = await supabase
      .from('creator_milestones')
      .select('status')
      .eq('creator_id', creatorId)
      .eq('milestone_id', milestone.id)
      .single();

    if (cmError || !creatorMilestone) {
      return NextResponse.json({
        success: false,
        error: 'Milestone record not found for this creator',
      }, { status: 404 });
    }

    if (creatorMilestone.status === 'locked') {
      return NextResponse.json({
        success: false,
        error: 'Milestone is locked and cannot be advanced',
      }, { status: 422 });
    }

    if (creatorMilestone.status === 'completed') {
      return NextResponse.json({
        success: false,
        error: 'Milestone is already completed',
      }, { status: 422 });
    }

    const { nextMilestoneName, phaseId } = await progressMilestone(
      supabase as Parameters<typeof progressMilestone>[0],
      {
        creatorId,
        milestoneId: milestone.id,
        completedBy: `admin:${adminEmail}`,
        contentPath,
      },
    );

    if (notes && typeof notes === 'string' && notes.trim()) {
      await supabase.from('creator_notes').insert({
        creator_id: creatorId,
        content: notes.trim(),
        author: adminEmail,
        visible_to_creator: false,
        phase_id: phaseId || null,
      });
    }

    return NextResponse.json({ success: true, nextMilestone: nextMilestoneName });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[admin/milestones/advance] Error:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
