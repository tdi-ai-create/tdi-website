import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isTDIAdmin } from '@/lib/partnership-portal-data';

// Service Supabase client with admin privileges
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

// GET - Fetch single partnership with all related data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: partnershipId } = await params;
    const email = request.headers.get('x-user-email');

    // Verify TDI admin
    if (!email || !(await isTDIAdmin(email))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const supabase = getServiceSupabase();

    // Fetch partnership
    const { data: partnership, error: pError } = await supabase
      .from('partnerships')
      .select('*')
      .eq('id', partnershipId)
      .single();

    if (pError || !partnership) {
      return NextResponse.json(
        { success: false, error: 'Partnership not found' },
        { status: 404 }
      );
    }

    // Fetch organization
    const { data: organization } = await supabase
      .from('organizations')
      .select('*')
      .eq('partnership_id', partnershipId)
      .maybeSingle();

    // Fetch buildings
    const { data: buildings } = await supabase
      .from('buildings')
      .select('*')
      .eq('organization_id', organization?.id || '')
      .order('name');

    // Fetch staff members with building names
    const { data: staff, count: staffCount } = await supabase
      .from('staff_members')
      .select('*, buildings(name)', { count: 'exact' })
      .eq('partnership_id', partnershipId)
      .order('last_name');

    // Fetch action items
    const { data: actionItems } = await supabase
      .from('action_items')
      .select('*')
      .eq('partnership_id', partnershipId)
      .order('sort_order')
      .order('created_at', { ascending: false });

    // Fetch recent activity
    const { data: activityLog } = await supabase
      .from('activity_log')
      .select('*')
      .eq('partnership_id', partnershipId)
      .order('created_at', { ascending: false })
      .limit(50);

    // Fetch metric snapshots
    const { data: metricSnapshots } = await supabase
      .from('metric_snapshots')
      .select('*')
      .eq('partnership_id', partnershipId)
      .order('snapshot_date', { ascending: false })
      .limit(100);

    // Fetch partnership users
    const { data: partnershipUsers } = await supabase
      .from('partnership_users')
      .select('*')
      .eq('partnership_id', partnershipId);

    return NextResponse.json({
      success: true,
      partnership,
      organization,
      buildings: buildings || [],
      staff: staff || [],
      staffCount: staffCount || 0,
      actionItems: actionItems || [],
      activityLog: activityLog || [],
      metricSnapshots: metricSnapshots || [],
      partnershipUsers: partnershipUsers || [],
    });
  } catch (error) {
    console.error('Error fetching partnership:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partnership' },
      { status: 500 }
    );
  }
}

// PUT - Update partnership details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: partnershipId } = await params;
    const email = request.headers.get('x-user-email');

    // Verify TDI admin
    if (!email || !(await isTDIAdmin(email))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const supabase = getServiceSupabase();

    // Separate partnership fields from organization fields
    const {
      org_name,
      org_partnership_goal,
      org_success_targets,
      ...partnershipFields
    } = body;

    // Only update partnership if there are partnership-specific fields
    let updatedPartnership = null;
    if (Object.keys(partnershipFields).length > 0) {
      const { data, error: pError } = await supabase
        .from('partnerships')
        .update({
          ...partnershipFields,
          updated_at: new Date().toISOString(),
        })
        .eq('id', partnershipId)
        .select()
        .single();

      if (pError) {
        console.error('Error updating partnership:', pError);
        return NextResponse.json(
          { success: false, error: 'Failed to update partnership' },
          { status: 500 }
        );
      }
      updatedPartnership = data;
    } else {
      // Fetch current partnership if no updates
      const { data } = await supabase
        .from('partnerships')
        .select('*')
        .eq('id', partnershipId)
        .single();
      updatedPartnership = data;
    }

    // Build organization update object
    const orgUpdateFields: Record<string, unknown> = {};
    if (org_name !== undefined) {
      orgUpdateFields.name = org_name;
    }
    if (org_partnership_goal !== undefined) {
      orgUpdateFields.partnership_goal = org_partnership_goal;
    }
    if (org_success_targets !== undefined) {
      orgUpdateFields.success_targets = org_success_targets;
    }

    // Update organization if there are fields to update
    if (Object.keys(orgUpdateFields).length > 0) {
      orgUpdateFields.updated_at = new Date().toISOString();
      await supabase
        .from('organizations')
        .update(orgUpdateFields)
        .eq('partnership_id', partnershipId);
    }

    // Log activity
    await supabase.from('activity_log').insert({
      partnership_id: partnershipId,
      user_id: null,
      action: 'partnership_updated',
      details: { updated_by: email, fields: Object.keys(body) },
    });

    return NextResponse.json({
      success: true,
      partnership: updatedPartnership,
    });
  } catch (error) {
    console.error('Error updating partnership:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update partnership' },
      { status: 500 }
    );
  }
}
