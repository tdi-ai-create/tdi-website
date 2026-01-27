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

    const { creatorId } = await request.json();

    console.log('[init-milestones] Initializing for creator:', creatorId);

    // 1. Get all milestones
    const { data: milestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('id, sort_order, phase_id')
      .order('phase_id')
      .order('sort_order');

    if (milestonesError) {
      return NextResponse.json({ success: false, error: milestonesError.message }, { status: 500 });
    }

    console.log('[init-milestones] Found milestones:', milestones?.length);

    // 2. Check if creator already has milestones
    const { data: existing } = await supabase
      .from('creator_milestones')
      .select('id')
      .eq('creator_id', creatorId)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ success: true, message: 'Milestones already exist' });
    }

    // 3. Create milestone records for this creator
    const milestoneRecords = milestones?.map((milestone, index) => ({
      creator_id: creatorId,
      milestone_id: milestone.id,
      status: index === 0 ? 'completed' : index === 1 ? 'available' : 'locked',
      completed_at: index === 0 ? new Date().toISOString() : null,
    })) || [];

    const { error: insertError } = await supabase
      .from('creator_milestones')
      .insert(milestoneRecords);

    if (insertError) {
      console.error('[init-milestones] Insert error:', insertError);
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Created ${milestoneRecords.length} milestone records`
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[init-milestones] Error:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
