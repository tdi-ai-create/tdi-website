import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/admin/partnerships/by-deal?dealId=...
 *
 * Looks up a partnership by its linked sales_deal_id.
 * Returns the partnership record with org name and deliverable counts.
 * Used by OpportunityDetailPanel to show the linked partnership card.
 */

function getServiceSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) throw new Error('Missing Supabase credentials');
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dealId = searchParams.get('dealId');

    if (!dealId) {
      return NextResponse.json({ error: 'dealId is required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Look up partnership by sales_deal_id
    const { data: partnership, error } = await supabase
      .from('partnerships')
      .select(`
        id,
        slug,
        org_name,
        contact_name,
        created_at,
        observation_days_total,
        virtual_sessions_total,
        executive_sessions_total,
        staff_enrolled,
        base_observation_days,
        base_virtual_sessions,
        base_executive_sessions,
        base_staff_enrolled
      `)
      .eq('sales_deal_id', dealId)
      .limit(1)
      .single();

    if (error || !partnership) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json({
      ...partnership,
      org_name: partnership.org_name ?? partnership.contact_name ?? null,
    });
  } catch (err) {
    console.error('[partnerships/by-deal] Error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
