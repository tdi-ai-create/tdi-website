import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { isTDIAdmin } from '@/lib/partnership-portal-data';

/**
 * POST - Assign Hub memberships to users in an organization (district partner)
 *
 * Body:
 * - org_id: string - The organization ID
 * - user_ids?: string[] - Specific user IDs to assign (optional, assigns all if not provided)
 * - tier: 'essentials' | 'professional' | 'all_access' - Tier to assign (default: all_access)
 */
export async function POST(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');

    // Verify TDI admin
    if (!email || !(await isTDIAdmin(email))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { org_id, user_ids, tier = 'all_access' } = body;

    if (!org_id) {
      return NextResponse.json(
        { success: false, error: 'org_id is required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // First, get the organization to verify it exists
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, partnership_id')
      .eq('id', org_id)
      .single();

    if (orgError || !org) {
      return NextResponse.json(
        { success: false, error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Get Hub profiles for users in this organization
    // Hub profiles are linked via district_id in hub_profiles
    let query = supabase
      .from('hub_profiles')
      .select('id, display_name')
      .eq('district_id', org_id);

    if (user_ids && user_ids.length > 0) {
      query = query.in('id', user_ids);
    }

    const { data: profiles, error: profilesError } = await query;

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user profiles' },
        { status: 500 }
      );
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users found in this organization',
        assigned_count: 0,
      });
    }

    // Create or update memberships for each user
    const now = new Date().toISOString();
    const memberships = profiles.map((profile) => ({
      user_id: profile.id,
      tier,
      source: 'district_partner' as const,
      status: 'active' as const,
      org_id: org_id,
      starts_at: now,
      created_at: now,
      updated_at: now,
    }));

    // Use upsert to handle existing memberships
    const { data: upsertedMemberships, error: upsertError } = await supabase
      .from('hub_memberships')
      .upsert(memberships, {
        onConflict: 'user_id',
        ignoreDuplicates: false,
      })
      .select();

    if (upsertError) {
      console.error('Error upserting memberships:', upsertError);
      return NextResponse.json(
        { success: false, error: 'Failed to assign memberships' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Assigned ${tier} membership to ${upsertedMemberships?.length || 0} users`,
      assigned_count: upsertedMemberships?.length || 0,
      organization: org.name,
    });
  } catch (error) {
    console.error('Error assigning memberships:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to assign memberships' },
      { status: 500 }
    );
  }
}

/**
 * GET - List Hub memberships for an organization
 *
 * Query params:
 * - org_id: string - The organization ID
 */
export async function GET(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');

    // Verify TDI admin
    if (!email || !(await isTDIAdmin(email))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const org_id = searchParams.get('org_id');

    if (!org_id) {
      return NextResponse.json(
        { success: false, error: 'org_id is required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Get memberships for this organization
    const { data: memberships, error } = await supabase
      .from('hub_memberships')
      .select(`
        *,
        hub_profiles (
          id,
          display_name
        )
      `)
      .eq('org_id', org_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching memberships:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch memberships' },
        { status: 500 }
      );
    }

    // Get organization info
    const { data: org } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('id', org_id)
      .single();

    // Get count of Hub profiles in this org (potential members)
    const { count: potentialCount } = await supabase
      .from('hub_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('district_id', org_id);

    return NextResponse.json({
      success: true,
      memberships: memberships || [],
      organization: org,
      stats: {
        active_memberships: memberships?.filter(m => m.status === 'active').length || 0,
        total_memberships: memberships?.length || 0,
        potential_members: potentialCount || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching memberships:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch memberships' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Revoke Hub membership for specific users
 *
 * Body:
 * - user_ids: string[] - User IDs to revoke membership from
 */
export async function DELETE(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email');

    // Verify TDI admin
    if (!email || !(await isTDIAdmin(email))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { user_ids } = body;

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'user_ids array is required' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Update memberships to expired/cancelled
    const { data, error } = await supabase
      .from('hub_memberships')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .in('user_id', user_ids)
      .eq('source', 'district_partner')
      .select();

    if (error) {
      console.error('Error revoking memberships:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to revoke memberships' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Revoked membership for ${data?.length || 0} users`,
      revoked_count: data?.length || 0,
    });
  } catch (error) {
    console.error('Error revoking memberships:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to revoke memberships' },
      { status: 500 }
    );
  }
}
