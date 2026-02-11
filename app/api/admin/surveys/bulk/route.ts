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

interface BulkSurveyRow {
  email: string;
  stress_level?: number | null;
  planning_hours?: number | null;
  retention_intent?: number | null;
  implementation_confidence?: number | null;
  feeling_valued?: number | null;
  staff_member_id?: string;
  matched?: boolean;
  staff_name?: string;
  error?: string;
}

// POST - Bulk import survey responses
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
      survey_type,
      custom_label,
      responses,
    }: {
      partnership_id: string;
      survey_type: string;
      custom_label?: string;
      responses: BulkSurveyRow[];
    } = body;

    if (!partnership_id || !survey_type || !responses || !Array.isArray(responses)) {
      return NextResponse.json(
        { success: false, error: 'partnership_id, survey_type, and responses array are required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Get all staff members for this partnership to match emails
    const { data: staffMembers } = await supabase
      .from('staff_members')
      .select('id, email, first_name, last_name')
      .eq('partnership_id', partnership_id);

    const staffByEmail = new Map(
      staffMembers?.map((s) => [s.email.toLowerCase(), s]) || []
    );

    // Process responses and match to staff members
    const processedResponses: BulkSurveyRow[] = responses.map((row) => {
      const staffMember = staffByEmail.get(row.email?.toLowerCase() || '');
      return {
        ...row,
        staff_member_id: staffMember?.id,
        matched: !!staffMember,
        staff_name: staffMember
          ? `${staffMember.first_name} ${staffMember.last_name}`
          : undefined,
      };
    });

    // Filter to only matched responses for import
    const validResponses = processedResponses.filter((r) => r.matched && r.staff_member_id);

    if (validResponses.length === 0) {
      return NextResponse.json({
        success: true,
        imported: 0,
        matched: 0,
        notFound: processedResponses.filter((r) => !r.matched).length,
        processedResponses,
      });
    }

    // Delete existing responses for these staff members + survey type (upsert behavior)
    const staffIds = validResponses.map((r) => r.staff_member_id!);
    await supabase
      .from('survey_responses')
      .delete()
      .eq('partnership_id', partnership_id)
      .eq('survey_type', survey_type)
      .in('staff_member_id', staffIds);

    // Insert all valid responses
    const insertData = validResponses.map((r) => ({
      partnership_id,
      staff_member_id: r.staff_member_id,
      survey_type,
      custom_label: survey_type === 'custom' ? custom_label : null,
      stress_level: r.stress_level,
      planning_hours: r.planning_hours,
      retention_intent: r.retention_intent,
      implementation_confidence: r.implementation_confidence,
      feeling_valued: r.feeling_valued,
    }));

    const { error: insertError } = await supabase
      .from('survey_responses')
      .insert(insertData);

    if (insertError) {
      console.error('Error bulk inserting survey responses:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to import survey responses' },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from('activity_log').insert({
      partnership_id,
      action: 'survey_bulk_import',
      details: {
        survey_type,
        imported_count: validResponses.length,
        total_rows: responses.length,
        not_found_count: processedResponses.filter((r) => !r.matched).length,
        imported_by: email,
      },
    });

    return NextResponse.json({
      success: true,
      imported: validResponses.length,
      matched: validResponses.length,
      notFound: processedResponses.filter((r) => !r.matched).length,
      processedResponses,
    });
  } catch (error) {
    console.error('Error in POST /api/admin/surveys/bulk:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
