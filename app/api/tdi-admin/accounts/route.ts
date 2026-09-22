import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';

let cachedSupabase: ReturnType<typeof createClient> | null = null;

function getHubAdmin() {
  if (cachedSupabase) return cachedSupabase;

  const supabaseUrl = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Hub Supabase credentials');
  }

  cachedSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  return cachedSupabase;
}

// GET - Fetch all hub profiles
export async function GET() {
  try {
    // The gate blocks. It used to log the failure and carry on, on the theory
    // that a page level guard protected access. A page guard protects the
    // page; the route is addressable on its own, so this answered anybody.
    const auth = await requireAdminAuth();
    if (auth instanceof NextResponse) return auth;

    const supabase = getHubAdmin();

    const { data, error } = await supabase
      .from('hub_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      console.error('[Accounts API] Error:', error.message);
      return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
    }

    return NextResponse.json({ accounts: data });
  } catch (error) {
    console.error('[Accounts API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
