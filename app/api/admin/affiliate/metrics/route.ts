import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const supabase = getServiceSupabase();
    const period = req.nextUrl.searchParams.get('period') || getCurrentPeriod();
    const { start, end } = periodToRange(period);

    const [clicksRes, conversionsRes, lifetimePayoutsRes] = await Promise.all([
      supabase
        .from('affiliate_clicks')
        .select('id', { count: 'exact', head: true })
        .gte('clicked_at', start)
        .lt('clicked_at', end),
      supabase
        .from('affiliate_conversions')
        .select('*')
        .gte('converted_at', start)
        .lt('converted_at', end)
        .eq('refunded', false),
      supabase
        .from('affiliate_payouts')
        .select('payout_amount_cents, net_revenue_cents')
        .eq('status', 'paid'),
    ]);

    const conversions = conversionsRes.data || [];
    const totalPayoutCents = conversions.reduce((s, c) => s + (c.creator_payout_cents || 0), 0);
    const totalRevenueCents = conversions.reduce((s, c) => s + (c.net_revenue_cents || 0), 0);

    return NextResponse.json({
      period,
      clicks: clicksRes.count || 0,
      conversions: conversions.length,
      creatorPayoutCents: totalPayoutCents,
      tdiRevenueCents: totalRevenueCents - totalPayoutCents,
    });
  } catch (err) {
    console.error('[affiliate/metrics]', err);
    return NextResponse.json({ error: 'Failed to load metrics' }, { status: 500 });
  }
}

function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function periodToRange(period: string): { start: string; end: string } {
  const [year, month] = period.split('-').map(Number);
  const start = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 1);
  const end = endDate.toISOString();
  return { start, end };
}
