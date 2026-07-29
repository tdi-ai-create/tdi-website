import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

// GET /api/partners/semester-data?partnershipId=xxx&semester=spring-2026
// Returns:
//   - all available semesters for the partnership (for building the toggle)
//   - full data for the requested semester (or the current semester if none specified)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnershipId = searchParams.get('partnershipId');
    const semesterSlug = searchParams.get('semester'); // optional - if omitted, returns all + current

    if (!partnershipId) {
      return NextResponse.json({ error: 'partnershipId is required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Verify the partnership exists
    const { data: partnership, error: partnershipError } = await supabase
      .from('partnerships')
      .select('id')
      .eq('id', partnershipId)
      .single();

    if (partnershipError || !partnership) {
      return NextResponse.json({ error: 'Partnership not found' }, { status: 404 });
    }

    // Fetch all semesters for this partnership (for the toggle list)
    const { data: allSemesters, error: semestersError } = await supabase
      .from('partnership_semester_data')
      .select('id, semester, semester_label, is_current, created_at')
      .eq('partnership_id', partnershipId)
      .order('created_at', { ascending: false });

    if (semestersError) {
      console.error('Error fetching semesters:', semestersError);
      return NextResponse.json({ error: 'Failed to fetch semester list' }, { status: 500 });
    }

    // If a specific semester is requested, return its full data
    if (semesterSlug) {
      const { data: semesterData, error: semesterError } = await supabase
        .from('partnership_semester_data')
        .select('*')
        .eq('partnership_id', partnershipId)
        .eq('semester', semesterSlug)
        .single();

      if (semesterError || !semesterData) {
        return NextResponse.json({ error: 'Semester not found' }, { status: 404 });
      }

      return NextResponse.json({
        semesters: allSemesters || [],
        current: semesterData,
      });
    }

    // No specific semester requested - return the list and current semester data
    const currentSemester = allSemesters?.find((s) => s.is_current) || allSemesters?.[0] || null;

    let currentData = null;
    if (currentSemester) {
      const { data: fullCurrent } = await supabase
        .from('partnership_semester_data')
        .select('*')
        .eq('id', currentSemester.id)
        .single();
      currentData = fullCurrent;
    }

    return NextResponse.json({
      semesters: allSemesters || [],
      current: currentData,
    });
  } catch (err) {
    console.error('Semester data API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
