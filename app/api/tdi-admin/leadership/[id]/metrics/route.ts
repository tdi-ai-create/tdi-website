import { isTDIAdmin } from '@/lib/tdi-admin/auth-check'
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
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
// function isTDIAdmin(email: string) {
//   return email.toLowerCase().endsWith('@teachersdeserveit.com');
// }

// GET - Fetch metric snapshots for partnership
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // An x-user-email header is a claim, not proof. Anyone could send it.
    // requireAdminAuth verifies the actual signed-in session.
    const auth = await requireAdminAuth();
    if (auth instanceof NextResponse) return auth;
    const email = auth.member.email;

    const supabase = getServiceSupabase();

    const { data: metrics, error } = await supabase
      .from('metric_snapshots')
      .select('*')
      .eq('partnership_id', id)
      .order('snapshot_date', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching metrics:', error);
      return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      metrics: metrics || [],
    });
  } catch (error) {
    console.error('Error in metrics GET:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST - Add new metric snapshot
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // An x-user-email header is a claim, not proof. Anyone could send it.
    // requireAdminAuth verifies the actual signed-in session.
    const auth = await requireAdminAuth();
    if (auth instanceof NextResponse) return auth;
    const email = auth.member.email;

    const body = await request.json();
    const { metric_name, metric_value, snapshot_date, source } = body;

    if (!metric_name || metric_value === undefined) {
      return NextResponse.json({ error: 'Metric name and value required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { data: metric, error } = await supabase
      .from('metric_snapshots')
      .insert({
        partnership_id: id,
        metric_name,
        metric_value,
        snapshot_date: snapshot_date || new Date().toISOString().split('T')[0],
        source: source || 'admin_upload',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating metric:', error);
      return NextResponse.json({ error: 'Failed to create metric' }, { status: 500 });
    }

    // Log activity
    // The only durable record that this happened.
    const { error: logError } = await supabase.from('activity_log').insert({
      partnership_id: id,
      action: 'metric_recorded',
      details: { metric_name, metric_value, recorded_by: email },
    });

    if (logError) {
      console.error('[metrics] activity log write failed:', logError.message);
    }

    return NextResponse.json({
      success: true,
      metric,
    });
  } catch (error) {
    console.error('Error in metrics POST:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
