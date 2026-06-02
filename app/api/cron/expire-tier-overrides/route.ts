import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Verify cron authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const isVercelCron = request.headers.get('x-vercel-cron') === '1';
      if (!isVercelCron) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabase
      .from('active_tier_overrides')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('user_id');

    if (error) {
      console.error('[expire-tier-overrides] Error:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const deleted = data?.length || 0;
    if (deleted > 0) {
      console.log(`[expire-tier-overrides] Cleaned up ${deleted} expired override(s)`);
    }

    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error('[expire-tier-overrides] Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
