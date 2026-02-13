import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Get the current user from the session
async function getCurrentUser() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Check if user is an owner
async function isOwner(userId: string, email: string): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return false;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const { data } = await supabase
    .from('tdi_team_members')
    .select('role')
    .or(`user_id.eq.${userId},email.ilike.${email.toLowerCase()}`)
    .eq('is_active', true)
    .single();

  return data?.role === 'owner';
}

export async function DELETE() {
  try {
    // Check authentication
    const user = await getCurrentUser();
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is owner
    const ownerCheck = await isOwner(user.id, user.email);
    if (!ownerCheck) {
      return NextResponse.json({ error: 'Only owners can remove example data' }, { status: 403 });
    }

    // Use service role to delete example data
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const tables = [
      'hub_activity_log',
      'hub_assessments',
      'hub_certificates',
      'hub_lesson_progress',
      'hub_enrollments',
      'hub_profiles',
      'hub_courses',
    ];

    const results: Record<string, number> = {};

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .delete()
          .eq('is_example', true)
          .select('id');

        if (error) {
          console.error(`Error deleting from ${table}:`, error.message);
          results[table] = 0;
        } else {
          results[table] = data?.length || 0;
        }
      } catch (err) {
        console.error(`Error deleting from ${table}:`, err);
        results[table] = 0;
      }
    }

    const totalDeleted = Object.values(results).reduce((a, b) => a + b, 0);

    return NextResponse.json({
      success: true,
      message: `Removed ${totalDeleted} example data rows`,
      details: results,
    });
  } catch (error) {
    console.error('Error cleaning up example data:', error);
    return NextResponse.json(
      { error: 'Failed to remove example data' },
      { status: 500 }
    );
  }
}
