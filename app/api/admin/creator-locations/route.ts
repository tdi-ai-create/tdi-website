import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    // Get all creators with their state info
    const { data: creators, error } = await supabase
      .from('creators')
      .select('id, name, state, location_prompt_dismissed');

    if (error) {
      console.error('[Creator Locations API] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch creator locations' }, { status: 500 });
    }

    // Aggregate by state
    const stateCount: Record<string, number> = {};
    let noLocationCount = 0;
    let dismissedCount = 0;

    (creators || []).forEach(creator => {
      if (creator.state) {
        stateCount[creator.state] = (stateCount[creator.state] || 0) + 1;
      } else {
        noLocationCount++;
        if (creator.location_prompt_dismissed) {
          dismissedCount++;
        }
      }
    });

    // Convert to array for chart display
    const stateData = Object.entries(stateCount)
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count);

    // Get top states
    const topStates = stateData.slice(0, 10);

    return NextResponse.json({
      stateData,
      topStates,
      totalCreators: creators?.length || 0,
      creatorsWithLocation: creators?.length ? creators.length - noLocationCount : 0,
      noLocationCount,
      dismissedCount,
    });
  } catch (error) {
    console.error('[Creator Locations API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
