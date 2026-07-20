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

    // Get creators with available columns only
    const { data: creators, error } = await supabase
      .from('creators')
      .select('id, name');

    if (error) {
      console.error('[Creator Locations API] Error:', error);
      return NextResponse.json({
        stateData: [],
        topStates: [],
        totalCreators: 0,
        creatorsWithLocation: 0,
        noLocationCount: 0,
        dismissedCount: 0,
      });
    }

    // State/location columns do not exist yet on this table.
    // Return total count with no location breakdown until columns are added.
    return NextResponse.json({
      stateData: [],
      topStates: [],
      totalCreators: creators?.length || 0,
      creatorsWithLocation: 0,
      noLocationCount: creators?.length || 0,
      dismissedCount: 0,
    });
  } catch (error) {
    console.error('[Creator Locations API] Error:', error);
    return NextResponse.json({
      stateData: [],
      topStates: [],
      totalCreators: 0,
      creatorsWithLocation: 0,
      noLocationCount: 0,
      dismissedCount: 0,
    });
  }
}
