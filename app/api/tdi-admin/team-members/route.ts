import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cache the supabase admin client
let cachedSupabase: ReturnType<typeof createClient> | null = null;

function getSupabaseAdmin() {
  if (cachedSupabase) return cachedSupabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase credentials');
  }

  cachedSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  return cachedSupabase;
}

// GET - Fetch all team members
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('tdi_team_members')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Team Members API] Error:', error.message);
      return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
    }

    return NextResponse.json({ members: data });
  } catch (error) {
    console.error('[Team Members API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add a new team member
export async function POST(request: NextRequest) {
  try {
    const { email, displayName, role, permissions } = await request.json();

    if (!email || !displayName) {
      return NextResponse.json({ error: 'Email and display name are required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Check if email already exists
    const { data: existing } = await supabase
      .from('tdi_team_members')
      .select('id')
      .ilike('email', email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json({ error: 'A team member with this email already exists' }, { status: 409 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('tdi_team_members')
      .insert({
        email: email.toLowerCase().trim(),
        display_name: displayName.trim(),
        role: role || 'member',
        permissions: permissions || {},
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('[Team Members API] Insert error:', error.message);
      return NextResponse.json({ error: 'Failed to add team member' }, { status: 500 });
    }

    return NextResponse.json({ success: true, member: data });
  } catch (error) {
    console.error('[Team Members API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update a team member
export async function PATCH(request: NextRequest) {
  try {
    const { id, permissions, is_active, role } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const updates: Record<string, unknown> = {};
    if (permissions !== undefined) updates.permissions = permissions;
    if (is_active !== undefined) updates.is_active = is_active;
    if (role !== undefined) updates.role = role;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('tdi_team_members')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('[Team Members API] Update error:', error.message);
      return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Team Members API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
