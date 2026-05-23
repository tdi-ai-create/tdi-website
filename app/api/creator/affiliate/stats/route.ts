import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

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

export async function GET() {
  try {
    const authClient = await getAuthClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const { data: creator, error: findError } = await (supabase
      .from('creators') as any)
      .select('id')
      .eq('email', user.email)
      .single();

    if (findError || !creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    const creatorId = creator.id;
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

    // Fetch all data in parallel
    const [
      thisMonthClicks,
      lastMonthClicks,
      lifetimeClicks,
      thisMonthSignups,
      lastMonthSignups,
      lifetimeSignups,
      thisMonthConversions,
      lastMonthConversions,
      lifetimeConversions,
    ] = await Promise.all([
      // This month clicks
      (supabase.from('affiliate_clicks') as any)
        .select('id', { count: 'exact', head: true })
        .eq('creator_id', creatorId)
        .gte('clicked_at', thisMonthStart),
      // Last month clicks
      (supabase.from('affiliate_clicks') as any)
        .select('id', { count: 'exact', head: true })
        .eq('creator_id', creatorId)
        .gte('clicked_at', lastMonthStart)
        .lte('clicked_at', lastMonthEnd),
      // Lifetime clicks
      (supabase.from('affiliate_clicks') as any)
        .select('id', { count: 'exact', head: true })
        .eq('creator_id', creatorId),
      // This month signups
      (supabase.from('affiliate_signups') as any)
        .select('id', { count: 'exact', head: true })
        .eq('creator_id', creatorId)
        .gte('signed_up_at', thisMonthStart),
      // Last month signups
      (supabase.from('affiliate_signups') as any)
        .select('id', { count: 'exact', head: true })
        .eq('creator_id', creatorId)
        .gte('signed_up_at', lastMonthStart)
        .lte('signed_up_at', lastMonthEnd),
      // Lifetime signups
      (supabase.from('affiliate_signups') as any)
        .select('id', { count: 'exact', head: true })
        .eq('creator_id', creatorId),
      // This month conversions
      (supabase.from('affiliate_conversions') as any)
        .select('id, net_amount_cents')
        .eq('creator_id', creatorId)
        .gte('converted_at', thisMonthStart),
      // Last month conversions
      (supabase.from('affiliate_conversions') as any)
        .select('id, net_amount_cents')
        .eq('creator_id', creatorId)
        .gte('converted_at', lastMonthStart)
        .lte('converted_at', lastMonthEnd),
      // Lifetime conversions
      (supabase.from('affiliate_conversions') as any)
        .select('id, net_amount_cents')
        .eq('creator_id', creatorId),
    ]);

    const sumEarnings = (rows: { net_amount_cents: number }[] | null) => {
      if (!rows || rows.length === 0) return 0;
      const total = rows.reduce((sum, r) => sum + (r.net_amount_cents || 0), 0);
      // 50% affiliate share
      return Math.round(total * 0.5);
    };

    // Check last month payout status
    const { data: lastMonthPayout } = await (supabase
      .from('affiliate_payouts') as any)
      .select('id, status, paid_at, amount_cents')
      .eq('creator_id', creatorId)
      .gte('period_start', lastMonthStart)
      .lte('period_start', lastMonthEnd)
      .maybeSingle();

    const lastMonthLabel = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      .toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const thisMonthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return NextResponse.json({
      success: true,
      thisMonth: {
        label: thisMonthLabel,
        clicks: thisMonthClicks.count || 0,
        signups: thisMonthSignups.count || 0,
        conversions: thisMonthConversions.data?.length || 0,
        earnedCents: sumEarnings(thisMonthConversions.data),
      },
      lastMonth: {
        label: lastMonthLabel,
        clicks: lastMonthClicks.count || 0,
        signups: lastMonthSignups.count || 0,
        conversions: lastMonthConversions.data?.length || 0,
        earnedCents: sumEarnings(lastMonthConversions.data),
        payoutStatus: lastMonthPayout?.status || null,
        paidAt: lastMonthPayout?.paid_at || null,
      },
      lifetime: {
        clicks: lifetimeClicks.count || 0,
        signups: lifetimeSignups.count || 0,
        conversions: lifetimeConversions.data?.length || 0,
        earnedCents: sumEarnings(lifetimeConversions.data),
      },
    });
  } catch (error) {
    console.error('[affiliate-stats] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
