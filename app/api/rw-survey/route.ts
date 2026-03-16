import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'overall_stress_level',
      'energy_level',
      'confidence_level',
      'team_morale',
      'supported_by_leadership',
      'hours_worked_per_week',
      'hours_feel_sustainable',
      'time_biggest_drain',
      'pipeline_confidence',
      'last_month_reflection',
      'biggest_win_last_month',
      'biggest_challenge_last_month',
      'lead_or_deal_on_mind',
      'most_common_objection',
      'part_of_process_feels_hard',
      'something_being_avoided',
      'tools_and_resources_adequate',
      'part_that_energizes',
      'part_that_drains',
      'product_knowledge_confidence',
      'product_knowledge_gaps',
      'top_priority_next_4_weeks',
      'what_success_looks_like',
      'one_thing_to_do_differently',
      'support_needed',
      'leadership_feedback',
      'team_dynamic_feedback',
      'safe_to_say',
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        console.error(`[rw-survey] Missing required field: ${field}`);
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[rw-survey] Missing environment variables');
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
      overall_stress_level: body.overall_stress_level,
      energy_level: body.energy_level,
      confidence_level: body.confidence_level,
      team_morale: body.team_morale,
      supported_by_leadership: body.supported_by_leadership,
      hours_worked_per_week: body.hours_worked_per_week,
      hours_feel_sustainable: body.hours_feel_sustainable,
      time_biggest_drain: body.time_biggest_drain,
      pipeline_confidence: body.pipeline_confidence,
      last_month_reflection: body.last_month_reflection,
      biggest_win_last_month: body.biggest_win_last_month,
      biggest_challenge_last_month: body.biggest_challenge_last_month,
      lead_or_deal_on_mind: body.lead_or_deal_on_mind,
      most_common_objection: body.most_common_objection,
      part_of_process_feels_hard: body.part_of_process_feels_hard,
      something_being_avoided: body.something_being_avoided,
      tools_and_resources_adequate: body.tools_and_resources_adequate,
      tools_missing: body.tools_missing || null,
      part_that_energizes: body.part_that_energizes,
      part_that_drains: body.part_that_drains,
      product_knowledge_confidence: body.product_knowledge_confidence,
      product_knowledge_gaps: body.product_knowledge_gaps,
      top_priority_next_4_weeks: body.top_priority_next_4_weeks,
      what_success_looks_like: body.what_success_looks_like,
      one_thing_to_do_differently: body.one_thing_to_do_differently,
      support_needed: body.support_needed,
      leadership_feedback: body.leadership_feedback,
      team_dynamic_feedback: body.team_dynamic_feedback,
      safe_to_say: body.safe_to_say,
      anything_else: body.anything_else || null,
    };

    const { error } = await supabase
      .from('rw_sales_surveys')
      .insert(insertData);

    if (error) {
      console.error('[rw-survey] Database error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log('[rw-survey] Survey submitted successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[rw-survey] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
