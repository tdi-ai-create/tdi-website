import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const debug: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      url: supabaseUrl ? `SET (${supabaseUrl.substring(0, 40)}...)` : 'NOT SET',
      key: supabaseKey ? `SET (starts with ${supabaseKey.substring(0, 15)}...)` : 'NOT SET',
      urlLength: supabaseUrl?.length || 0,
      keyLength: supabaseKey?.length || 0,
    },
  };

  if (!supabaseUrl || !supabaseKey) {
    debug.error = 'Missing environment variables';
    return NextResponse.json(debug);
  }

  // Test 1: Raw fetch to Supabase REST API - count creators
  try {
    const creatorsResponse = await fetch(`${supabaseUrl}/rest/v1/creators?select=count`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact',
      },
    });

    const creatorsStatus = creatorsResponse.status;
    const creatorsText = await creatorsResponse.text();

    debug.creatorsTest = {
      status: creatorsStatus,
      response: creatorsText,
      ok: creatorsResponse.ok,
    };
  } catch (error: unknown) {
    debug.creatorsTest = {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    };
  }

  // Test 2: Raw fetch to Supabase REST API - count admin_users
  try {
    const adminsResponse = await fetch(`${supabaseUrl}/rest/v1/admin_users?select=count`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact',
      },
    });

    const adminsStatus = adminsResponse.status;
    const adminsText = await adminsResponse.text();

    debug.adminsTest = {
      status: adminsStatus,
      response: adminsText,
      ok: adminsResponse.ok,
    };
  } catch (error: unknown) {
    debug.adminsTest = {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Test 3: Look for specific email in admin_users
  try {
    const emailResponse = await fetch(
      `${supabaseUrl}/rest/v1/admin_users?email=ilike.rae@teachersdeserveit.com&select=id,email`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const emailData = await emailResponse.json();

    debug.emailLookup = {
      status: emailResponse.status,
      found: Array.isArray(emailData) && emailData.length > 0,
      data: emailData,
    };
  } catch (error: unknown) {
    debug.emailLookup = {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Test 4: List all admin emails
  try {
    const allAdminsResponse = await fetch(
      `${supabaseUrl}/rest/v1/admin_users?select=email`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const allAdminsData = await allAdminsResponse.json();

    debug.allAdmins = {
      status: allAdminsResponse.status,
      data: allAdminsData,
    };
  } catch (error: unknown) {
    debug.allAdmins = {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  return NextResponse.json(debug, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
