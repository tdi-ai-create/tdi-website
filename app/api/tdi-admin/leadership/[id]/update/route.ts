import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

// Check if TDI admin
function isTDIAdmin(email: string) {
  return email.toLowerCase().endsWith('@teachersdeserveit.com');
}

// PATCH - Update partnership fields
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const email = request.headers.get('x-user-email');

    if (!email || !isTDIAdmin(email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { field, value } = body;

    if (!field) {
      return NextResponse.json({ error: 'Field name required' }, { status: 400 });
    }

    // Partnership table fields
    const partnershipFields = [
      'staff_enrolled',
      'hub_login_pct',
      'momentum_status',
      'momentum_detail',
      'cost_per_educator',
      'love_notes_count',
      'high_engagement_pct',
      'observation_days_used',
      'virtual_sessions_used',
      'executive_sessions_used',
      'data_updated_at',
      'contact_name',
      'contact_email',
      'contract_phase',
      'contract_start',
      'contract_end',
      'status',
      'primary_contact_name',
      'primary_contact_email',
      'phone',
      'partnership_goal',
      'year2_planning_notes',
    ];

    // Organization table fields
    const orgFields = [
      'name',
      'address',
      'city',
      'state',
      'zip',
      'website',
    ];

    const supabase = getServiceSupabase();

    // Route to correct table based on field
    if (orgFields.includes(field)) {
      // Update organizations table
      const { error } = await supabase
        .from('organizations')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('partnership_id', id);

      if (error) {
        console.error('Error updating organization:', error);
        return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 });
      }
    } else if (partnershipFields.includes(field)) {
      // Update partnerships table
      const updateData: Record<string, unknown> = {
        [field]: value,
        updated_at: new Date().toISOString(),
      };

      // If updating dashboard data, also update data_updated_at
      const dashboardFields = [
        'staff_enrolled', 'hub_login_pct', 'momentum_status', 'momentum_detail',
        'cost_per_educator', 'love_notes_count', 'high_engagement_pct',
        'observation_days_used', 'virtual_sessions_used', 'executive_sessions_used',
      ];
      if (dashboardFields.includes(field)) {
        updateData.data_updated_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('partnerships')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating partnership:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: `Field '${field}' not allowed` }, { status: 400 });
    }

    // Log the activity
    await supabase.from('activity_log').insert({
      partnership_id: id,
      action: 'partnership_updated',
      details: { field, value, updated_by: email },
    });

    return NextResponse.json({
      success: true,
      field,
      value,
    });
  } catch (error) {
    console.error('Error in update route:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
