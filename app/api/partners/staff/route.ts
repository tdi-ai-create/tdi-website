import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/partners/staff?partnershipId=xxx
 *
 * Returns all staff members for a partnership with their access type.
 */
export async function GET(request: NextRequest) {
  const partnershipId = request.nextUrl.searchParams.get('partnershipId');
  if (!partnershipId) return NextResponse.json({ error: 'partnershipId required' }, { status: 400 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data, error } = await supabase
    .from('staff_members')
    .select('id, first_name, last_name, email, role_title, hub_enrolled, access_type')
    .eq('partnership_id', partnershipId)
    .order('last_name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ staff: data || [] });
}
