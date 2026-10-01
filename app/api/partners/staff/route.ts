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
    // Only people who still work there. Without this the roster manager counted
    // departed staff, so Saunemin read "plus 6 more at no extra cost" when the
    // true figure over contract is 4. Same omission as the dashboard route.
    .eq('is_active', true)
    .order('last_name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ staff: data || [] });
}
