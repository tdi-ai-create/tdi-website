import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cache the supabase client
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

// This route uses the service role to check team membership, bypassing RLS
export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'userId and email are required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const normalizedEmail = email.toLowerCase().trim();

    // Single query with OR condition - much faster than sequential queries
    const { data: members, error } = await supabase
      .from('tdi_team_members')
      .select('*')
      .eq('is_active', true)
      .or(`user_id.eq.${userId},email.ilike.${normalizedEmail}`)
      .limit(1);

    if (error) {
      console.error('[TDI Admin API] Query error:', error.message);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (members && members.length > 0) {
      const member = members[0];
      return NextResponse.json({ member, foundBy: 'query' });
    }

    // Not found - return 403 without debug query
    return NextResponse.json({ error: 'Not a team member' }, { status: 403 });

  } catch (error) {
    console.error('[TDI Admin API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
