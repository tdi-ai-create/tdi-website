import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[creator-survey] Missing environment variables');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Prepare data for insert
    const insertData = {
      creator_id: body.creator_id || null,
      name: body.name || null,
      email: body.email || null,
      content_path: body.content_path || null,

      // Section 1
      q1_referral: body.q1_referral,
      q1_clarity_score: body.q1_clarity_score,
      q1_clarity_followup: body.q1_clarity_followup || null,
      q1_reason: body.q1_reason,

      // Section 2
      q2_portal_clarity_score: body.q2_portal_clarity_score,
      q2_portal_clarity_followup: body.q2_portal_clarity_followup || null,
      q2_stuck: body.q2_stuck,
      q2_stuck_detail: body.q2_stuck_detail || null,
      q2_support_score: body.q2_support_score,
      q2_support_followup: body.q2_support_followup || null,
      q2_improvement: body.q2_improvement,

      // Section 3
      q3_workload_score: body.q3_workload_score,
      q3_workload_followup: body.q3_workload_followup || null,
      q3_hard_stage: body.q3_hard_stage,
      q3_production_score: body.q3_production_score,
      q3_production_followup: body.q3_production_followup || null,
      q3_feedback_score: body.q3_feedback_score,
      q3_feedback_followup: body.q3_feedback_followup || null,

      // Section 4
      q4_comp_clarity_score: body.q4_comp_clarity_score,
      q4_comp_clarity_followup: body.q4_comp_clarity_followup || null,
      q4_revshare_clear: body.q4_revshare_clear || null,
      q4_revshare_clear_followup: body.q4_revshare_clear_followup || null,
      q4_revshare_fair_score: body.q4_revshare_fair_score || null,
      q4_revshare_fair_followup: body.q4_revshare_fair_followup || null,
      q4_payment_score: body.q4_payment_score || null,
      q4_payment_followup: body.q4_payment_followup || null,

      // Section 5
      q5_responsiveness_score: body.q5_responsiveness_score,
      q5_responsiveness_followup: body.q5_responsiveness_followup || null,
      q5_comms_channel: body.q5_comms_channel,
      q5_fell_through: body.q5_fell_through,
      q5_fell_through_detail: body.q5_fell_through_detail || null,

      // Section 6
      q6_overall_score: body.q6_overall_score,
      q6_overall_followup: body.q6_overall_followup || null,
      q6_return_score: body.q6_return_score,
      q6_return_followup: body.q6_return_followup || null,
      q6_nps: body.q6_nps,
      q6_nps_followup: body.q6_nps_followup || null,
      q6_open_feedback: body.q6_open_feedback || null,
    };

    const { error } = await supabase
      .from('creator_survey_responses')
      .insert(insertData);

    if (error) {
      console.error('[creator-survey] Database error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log('[creator-survey] Survey submitted successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[creator-survey] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
