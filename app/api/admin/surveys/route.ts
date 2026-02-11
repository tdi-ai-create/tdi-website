import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isTDIAdmin } from '@/lib/partnership-portal-data';

function getServiceSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// GET - List survey responses for a partnership
export async function GET(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');

    if (!email || !(await isTDIAdmin(email))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const partnershipId = searchParams.get('partnership_id');
    const surveyType = searchParams.get('survey_type');

    if (!partnershipId) {
      return NextResponse.json(
        { success: false, error: 'partnership_id is required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    let query = supabase
      .from('survey_responses')
      .select(`
        *,
        staff_member:staff_members(id, first_name, last_name, email, building_id)
      `)
      .eq('partnership_id', partnershipId)
      .order('submitted_at', { ascending: false });

    if (surveyType) {
      query = query.eq('survey_type', surveyType);
    }

    const { data: responses, error } = await query;

    if (error) {
      console.error('Error fetching survey responses:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch survey responses' },
        { status: 500 }
      );
    }

    // Get total staff count for this partnership
    const { count: totalStaff } = await supabase
      .from('staff_members')
      .select('*', { count: 'exact', head: true })
      .eq('partnership_id', partnershipId);

    // Get unique respondents for this survey type
    const respondedStaffIds = new Set(
      responses
        ?.filter((r) => r.staff_member_id && (!surveyType || r.survey_type === surveyType))
        .map((r) => r.staff_member_id)
    );

    return NextResponse.json({
      success: true,
      responses: responses || [],
      stats: {
        totalStaff: totalStaff || 0,
        respondedCount: respondedStaffIds.size,
        responseRate: totalStaff ? Math.round((respondedStaffIds.size / totalStaff) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/admin/surveys:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create individual survey response
export async function POST(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');

    if (!email || !(await isTDIAdmin(email))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      partnership_id,
      staff_member_id,
      survey_type,
      custom_label,
      stress_level,
      planning_hours,
      retention_intent,
      implementation_confidence,
      feeling_valued,
      additional_data,
    } = body;

    if (!partnership_id || !survey_type) {
      return NextResponse.json(
        { success: false, error: 'partnership_id and survey_type are required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Check if response already exists for this staff member + survey type
    if (staff_member_id) {
      const { data: existing } = await supabase
        .from('survey_responses')
        .select('id')
        .eq('partnership_id', partnership_id)
        .eq('staff_member_id', staff_member_id)
        .eq('survey_type', survey_type)
        .maybeSingle();

      if (existing) {
        // Update existing response
        const { data: updated, error: updateError } = await supabase
          .from('survey_responses')
          .update({
            stress_level,
            planning_hours,
            retention_intent,
            implementation_confidence,
            feeling_valued,
            additional_data,
            custom_label: survey_type === 'custom' ? custom_label : null,
            submitted_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating survey response:', updateError);
          return NextResponse.json(
            { success: false, error: 'Failed to update survey response' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          response: updated,
          updated: true,
        });
      }
    }

    // Insert new response
    const { data: response, error: insertError } = await supabase
      .from('survey_responses')
      .insert({
        partnership_id,
        staff_member_id,
        survey_type,
        custom_label: survey_type === 'custom' ? custom_label : null,
        stress_level,
        planning_hours,
        retention_intent,
        implementation_confidence,
        feeling_valued,
        additional_data,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating survey response:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create survey response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      response,
      updated: false,
    });
  } catch (error) {
    console.error('Error in POST /api/admin/surveys:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
