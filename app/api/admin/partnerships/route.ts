import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  getAllPartnerships,
  getPartnershipStats,
  isTDIAdmin,
} from '@/lib/partnership-portal-data';
import { getUniqueSlug } from '@/lib/generate-slug';

// Service Supabase client
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

// GET - Fetch all partnerships with stats
export async function GET(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');

    if (!email || !await isTDIAdmin(email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceSupabase();

    // Fetch all data in parallel with single queries (no N+1!)
    const [partnershipsResult, statsResult, orgsResult, staffCountsResult] = await Promise.all([
      getAllPartnerships(),
      getPartnershipStats(),
      // Single query for all organizations
      supabase
        .from('organizations')
        .select('partnership_id, name'),
      // Single query for staff counts grouped by partnership
      supabase
        .from('staff_members')
        .select('partnership_id'),
    ]);

    // Build lookup maps for O(1) access
    const orgMap = new Map<string, string>();
    orgsResult.data?.forEach(org => {
      if (org.partnership_id) {
        orgMap.set(org.partnership_id, org.name);
      }
    });

    const staffCountMap = new Map<string, number>();
    staffCountsResult.data?.forEach(staff => {
      if (staff.partnership_id) {
        staffCountMap.set(staff.partnership_id, (staffCountMap.get(staff.partnership_id) || 0) + 1);
      }
    });

    // Enrich partnerships using maps (O(n) instead of O(n*2))
    const enrichedPartnerships = partnershipsResult.map(p => ({
      ...p,
      org_name: orgMap.get(p.id) || null,
      staff_count: staffCountMap.get(p.id) || 0,
    }));

    return NextResponse.json({
      success: true,
      partnerships: enrichedPartnerships,
      stats: statsResult,
    });
  } catch (error) {
    console.error('Error fetching partnerships:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partnerships' },
      { status: 500 }
    );
  }
}

// POST - Create new partnership
export async function POST(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');

    if (!email || !await isTDIAdmin(email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      partnership_type,
      contact_name,
      contact_email,
      contract_phase,
      contract_start,
      contract_end,
      building_count,
      observation_days_total,
      virtual_sessions_total,
      executive_sessions_total,
    } = body;

    // Validate required fields
    if (!partnership_type || !contact_name || !contact_email || !contract_phase) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Generate unique slug from contact name (will be replaced when org is created)
    const slug = await getUniqueSlug(supabase, contact_name);

    // Create partnership
    const { data: partnership, error } = await supabase
      .from('partnerships')
      .insert({
        partnership_type,
        slug,
        contact_name,
        contact_email,
        contract_phase,
        contract_start: contract_start || null,
        contract_end: contract_end || null,
        building_count: building_count || 1,
        observation_days_total: observation_days_total || 0,
        virtual_sessions_total: virtual_sessions_total || 0,
        executive_sessions_total: executive_sessions_total || 0,
        status: 'invited',
        invite_sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating partnership:', error);
      return NextResponse.json(
        { error: 'Failed to create partnership' },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from('activity_log').insert({
      partnership_id: partnership.id,
      user_id: null,
      action: 'invite_generated',
      details: { created_by: email },
    });

    return NextResponse.json({
      success: true,
      partnership,
      inviteUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://teachersdeserveit.com'}/partner-setup/${partnership.invite_token}`,
    });
  } catch (error) {
    console.error('Error creating partnership:', error);
    return NextResponse.json(
      { error: 'Failed to create partnership' },
      { status: 500 }
    );
  }
}
