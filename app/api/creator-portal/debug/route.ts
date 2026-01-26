import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const debug: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    environment: {},
    tests: {},
  };

  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    debug.environment = {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl
        ? `SET (${supabaseUrl.substring(0, 30)}...)`
        : 'NOT SET',
      SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey
        ? 'SET (hidden)'
        : 'NOT SET',
    };

    if (!supabaseUrl || !serviceRoleKey) {
      debug.error = 'Missing environment variables - cannot proceed with tests';
      return NextResponse.json(debug);
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Test 1: Count creators
    const { count: creatorsCount, error: creatorsCountError } = await supabase
      .from('creators')
      .select('*', { count: 'exact', head: true });

    debug.tests = {
      ...debug.tests as object,
      creatorsCount: {
        count: creatorsCount,
        error: creatorsCountError?.message || null,
      },
    };

    // Test 2: Count admin_users
    const { count: adminsCount, error: adminsCountError } = await supabase
      .from('admin_users')
      .select('*', { count: 'exact', head: true });

    debug.tests = {
      ...debug.tests as object,
      adminsCount: {
        count: adminsCount,
        error: adminsCountError?.message || null,
      },
    };

    // Test 3: Look for specific admin email
    const testEmail = 'rae@teachersdeserveit.com';

    const { data: adminLookup, error: adminLookupError } = await supabase
      .from('admin_users')
      .select('id, email')
      .ilike('email', testEmail)
      .maybeSingle();

    debug.tests = {
      ...debug.tests as object,
      adminLookup: {
        searchedFor: testEmail,
        found: !!adminLookup,
        data: adminLookup,
        error: adminLookupError?.message || null,
      },
    };

    // Test 4: Look for same email in creators
    const { data: creatorLookup, error: creatorLookupError } = await supabase
      .from('creators')
      .select('id, email')
      .ilike('email', testEmail)
      .maybeSingle();

    debug.tests = {
      ...debug.tests as object,
      creatorLookup: {
        searchedFor: testEmail,
        found: !!creatorLookup,
        data: creatorLookup,
        error: creatorLookupError?.message || null,
      },
    };

    // Test 5: List all emails in admin_users (for debugging)
    const { data: allAdmins, error: allAdminsError } = await supabase
      .from('admin_users')
      .select('email');

    debug.tests = {
      ...debug.tests as object,
      allAdminEmails: {
        emails: allAdmins?.map(a => a.email) || [],
        error: allAdminsError?.message || null,
      },
    };

    // Test 6: List all emails in creators (first 10)
    const { data: allCreators, error: allCreatorsError } = await supabase
      .from('creators')
      .select('email')
      .limit(10);

    debug.tests = {
      ...debug.tests as object,
      creatorEmails: {
        emails: allCreators?.map(c => c.email) || [],
        note: 'First 10 only',
        error: allCreatorsError?.message || null,
      },
    };

    debug.success = true;

  } catch (error) {
    debug.error = error instanceof Error ? error.message : 'Unknown error';
    debug.success = false;
  }

  return NextResponse.json(debug, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
