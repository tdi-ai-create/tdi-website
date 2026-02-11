import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isTDIAdmin } from '@/lib/partnership-portal-data';

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

// POST - Add a metric snapshot
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
    const {
      partnership_id,
      metric_name,
      metric_value,
      snapshot_date,
      building_id,
      source,
    } = body;

    if (!partnership_id || !metric_name || metric_value === undefined || !snapshot_date) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Check if a snapshot already exists for this metric + date + building
    const existingQuery = supabase
      .from('metric_snapshots')
      .select('id')
      .eq('partnership_id', partnership_id)
      .eq('metric_name', metric_name)
      .eq('snapshot_date', snapshot_date);

    if (building_id) {
      existingQuery.eq('building_id', building_id);
    } else {
      existingQuery.is('building_id', null);
    }

    const { data: existing } = await existingQuery.maybeSingle();

    let result;
    if (existing) {
      // Update existing snapshot
      const { data, error } = await supabase
        .from('metric_snapshots')
        .update({
          metric_value,
          source: source || 'admin_manual',
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new snapshot
      const { data, error } = await supabase
        .from('metric_snapshots')
        .insert({
          partnership_id,
          building_id: building_id || null,
          metric_name,
          metric_value,
          snapshot_date,
          source: source || 'admin_manual',
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // Log activity
    await supabase.from('activity_log').insert({
      partnership_id,
      user_id: null,
      action: 'metric_recorded',
      details: {
        metric_name,
        metric_value,
        snapshot_date,
        building_id,
        recorded_by: email,
      },
    });

    return NextResponse.json({
      success: true,
      metric: result,
    });
  } catch (error) {
    console.error('Error recording metric:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record metric' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a metric snapshot
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing metric ID' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { error } = await supabase
      .from('metric_snapshots')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting metric:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete metric' },
      { status: 500 }
    );
  }
}
