import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const supabase = getServiceSupabase();
    const period = req.nextUrl.searchParams.get('period') || getCurrentPeriod();
    const { start, end } = periodToRange(period);

    // Get all creators with affiliate slugs
    const { data: creators } = await supabase
      .from('creators')
      .select('id, name, email, affiliate_slug')
      .not('affiliate_slug', 'is', null)
      .order('name');

    if (!creators || creators.length === 0) {
      return NextResponse.json({ period, creators: [] });
    }

    // Get period stats in parallel
    const [clicksRes, signupsRes, conversionsRes, lifetimeRes] = await Promise.all([
      supabase
        .from('affiliate_clicks')
        .select('creator_id')
        .gte('clicked_at', start)
        .lt('clicked_at', end),
      supabase
        .from('affiliate_signups')
        .select('creator_id')
        .gte('signed_up_at', start)
        .lt('signed_up_at', end),
      supabase
        .from('affiliate_conversions')
        .select('creator_id, creator_payout_cents')
        .gte('converted_at', start)
        .lt('converted_at', end)
        .eq('refunded', false),
      supabase
        .from('affiliate_conversions')
        .select('creator_id, creator_payout_cents')
        .eq('refunded', false),
    ]);

    // Count per creator
    const clickCounts = countBy(clicksRes.data || [], 'creator_id');
    const signupCounts = countBy(signupsRes.data || [], 'creator_id');
    const conversionCounts = countBy(conversionsRes.data || [], 'creator_id');
    const periodEarnings = sumBy(conversionsRes.data || [], 'creator_id', 'creator_payout_cents');
    const lifetimeEarnings = sumBy(lifetimeRes.data || [], 'creator_id', 'creator_payout_cents');

    // Get last activity per creator (most recent click)
    const { data: lastClicks } = await supabase
      .from('affiliate_clicks')
      .select('creator_id, clicked_at')
      .order('clicked_at', { ascending: false });

    const lastActivity: Record<string, string> = {};
    (lastClicks || []).forEach(c => {
      if (!lastActivity[c.creator_id]) lastActivity[c.creator_id] = c.clicked_at;
    });

    const result = creators.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      slug: c.affiliate_slug,
      clicks: clickCounts[c.id] || 0,
      signups: signupCounts[c.id] || 0,
      conversions: conversionCounts[c.id] || 0,
      earnedCents: periodEarnings[c.id] || 0,
      lifetimeEarnedCents: lifetimeEarnings[c.id] || 0,
      lastActivity: lastActivity[c.id] || null,
    }));

    // Sort by earnings descending
    result.sort((a, b) => b.earnedCents - a.earnedCents);

    return NextResponse.json({ period, creators: result });
  } catch (err) {
    console.error('[affiliate/leaderboard]', err);
    return NextResponse.json({ error: 'Failed to load leaderboard' }, { status: 500 });
  }
}

function countBy(rows: any[], key: string): Record<string, number> {
  const counts: Record<string, number> = {};
  rows.forEach(r => { counts[r[key]] = (counts[r[key]] || 0) + 1; });
  return counts;
}

function sumBy(rows: any[], groupKey: string, sumKey: string): Record<string, number> {
  const sums: Record<string, number> = {};
  rows.forEach(r => { sums[r[groupKey]] = (sums[r[groupKey]] || 0) + (r[sumKey] || 0); });
  return sums;
}

function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function periodToRange(period: string): { start: string; end: string } {
  const [year, month] = period.split('-').map(Number);
  return {
    start: new Date(year, month - 1, 1).toISOString(),
    end: new Date(year, month, 1).toISOString(),
  };
}
