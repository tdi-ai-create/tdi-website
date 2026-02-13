import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const requiredFields = [
      'name', 'school', 'gradeLevels', 'confidenceAsking',
      'confidenceFeedback', 'triedAsking', 'triedFeedback',
      'hubLogin', 'bestGame', 'commitment'
    ];

    for (const field of requiredFields) {
      if (!data[field] || (Array.isArray(data[field]) && data[field].length === 0)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const supabase = getServiceSupabase();

    // Insert into survey responses table
    const { error } = await supabase
      .from('asd4_survey_responses')
      .insert({
        name: data.name,
        school: data.school,
        grade_levels: data.gradeLevels,
        confidence_asking: parseInt(data.confidenceAsking),
        confidence_feedback: parseInt(data.confidenceFeedback),
        tried_asking: data.triedAsking,
        tried_feedback: data.triedFeedback,
        hub_login: data.hubLogin,
        hub_help: data.hubHelp || [],
        hub_help_other: data.hubHelpOther || null,
        best_game: data.bestGame,
        commitment: data.commitment,
        open_feedback: data.openFeedback || null,
        submitted_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Supabase error:', error);
      // If table doesn't exist, fall back to logging
      if (error.code === '42P01') {
        console.log('Survey response (table not found):', JSON.stringify(data, null, 2));
        return NextResponse.json({ success: true, fallback: true });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Survey submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit survey' },
      { status: 500 }
    );
  }
}
