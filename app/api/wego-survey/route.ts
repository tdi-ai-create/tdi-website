import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Frontend sends survey_type, we map to survey_slug for the database
    const { survey_type, first_name, last_name, pa_names, responses } = body;

    console.log('[wego-survey] Received submission:', { survey_type, first_name, last_name, pa_names: pa_names ? 'provided' : 'null', hasResponses: !!responses });

    // Validate required fields
    if (!survey_type || !['pa', 'teacher'].includes(survey_type)) {
      console.error('[wego-survey] Invalid survey type:', survey_type);
      return NextResponse.json(
        { success: false, error: 'Invalid survey type' },
        { status: 400 }
      );
    }

    if (!first_name?.trim() || !last_name?.trim()) {
      console.error('[wego-survey] Missing name fields');
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!responses || typeof responses !== 'object') {
      console.error('[wego-survey] Missing or invalid responses');
      return NextResponse.json(
        { success: false, error: 'Responses are required' },
        { status: 400 }
      );
    }

    // Teacher survey requires pa_names
    if (survey_type === 'teacher' && !pa_names?.trim()) {
      console.error('[wego-survey] Teacher survey missing pa_names');
      return NextResponse.json(
        { success: false, error: 'PA names are required for teacher survey' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[wego-survey] Missing environment variables - URL:', !!supabaseUrl, 'Key:', !!serviceRoleKey);
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Map survey_type to survey_slug format expected by database
    const survey_slug = `wego-${survey_type}`;

    // Insert survey response - using survey_slug to match table schema
    const insertData = {
      survey_slug,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      pa_names: pa_names?.trim() || null,
      responses,
    };

    console.log('[wego-survey] Inserting data:', { ...insertData, responses: '...' });

    const { data, error } = await supabase
      .from('wego_survey_responses')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[wego-survey] Database error:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log(`[wego-survey] Success! ${survey_slug} survey submitted by ${first_name} ${last_name}, id: ${data.id}`);

    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    console.error('[wego-survey] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint for TDI admin to retrieve survey responses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const surveyType = searchParams.get('type');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    let query = supabase
      .from('wego_survey_responses')
      .select('*')
      .order('submitted_at', { ascending: false });

    // Filter by survey_slug if type is provided
    if (surveyType && ['pa', 'teacher'].includes(surveyType)) {
      query = query.eq('survey_slug', `wego-${surveyType}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[wego-survey] Database error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[wego-survey] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
