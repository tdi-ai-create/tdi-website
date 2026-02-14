import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Admin client for writes
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

// Auth client to get current user
async function getAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

// POST - Update creator location
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { state, dismissed } = body;

    // Get current user
    const authClient = await getAuthClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Find creator by email
    const { data: creator, error: findError } = await supabase
      .from('creators')
      .select('id')
      .eq('email', user.email)
      .single();

    if (findError || !creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (state) {
      // Validate state abbreviation (2 uppercase letters)
      const stateRegex = /^[A-Z]{2}$/;
      if (!stateRegex.test(state)) {
        return NextResponse.json({ error: 'Invalid state abbreviation' }, { status: 400 });
      }
      updateData.state = state;
      updateData.location_prompt_dismissed = true; // Also dismiss prompt when submitting
    }

    if (dismissed === true) {
      updateData.location_prompt_dismissed = true;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No update data provided' }, { status: 400 });
    }

    // Update creator
    const { error: updateError } = await supabase
      .from('creators')
      .update(updateData)
      .eq('id', creator.id);

    if (updateError) {
      console.error('[Location API] Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Location API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
