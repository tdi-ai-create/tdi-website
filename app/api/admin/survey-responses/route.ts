import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[admin/survey-responses] Missing environment variables');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: responses, error } = await supabase
      .from('creator_survey_responses')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('[admin/survey-responses] Database error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Calculate summary stats
    const totalResponses = responses?.length || 0;
    const avgOverallScore = totalResponses > 0
      ? responses.reduce((sum, r) => sum + (r.q6_overall_score || 0), 0) / totalResponses
      : 0;
    const avgNPS = totalResponses > 0
      ? responses.reduce((sum, r) => sum + (r.q6_nps || 0), 0) / totalResponses
      : 0;

    return NextResponse.json({
      success: true,
      responses,
      stats: {
        totalResponses,
        avgOverallScore: avgOverallScore.toFixed(1),
        avgNPS: avgNPS.toFixed(1),
      },
    });
  } catch (error) {
    console.error('[admin/survey-responses] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
