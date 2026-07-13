import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Auth-gate: require CRON_SECRET to access debug endpoint
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const debug: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      url: supabaseUrl ? 'SET' : 'NOT SET',
      key: supabaseKey ? 'SET' : 'NOT SET',
    },
  };

  if (!supabaseUrl || !supabaseKey) {
    debug.error = 'Missing environment variables';
    return NextResponse.json(debug);
  }

  // Test: Raw fetch to Supabase REST API - count creators
  try {
    const creatorsResponse = await fetch(`${supabaseUrl}/rest/v1/creators?select=count`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact',
      },
    });

    debug.creatorsTest = {
      status: creatorsResponse.status,
      ok: creatorsResponse.ok,
    };
  } catch (error: unknown) {
    debug.creatorsTest = {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  return NextResponse.json(debug, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
