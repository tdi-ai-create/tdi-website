import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const supabase = getServiceSupabase();
    const creatorId = req.nextUrl.searchParams.get('id');
    if (!creatorId) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const [clicksRes, signupsRes, conversionsRes, payoutsRes] = await Promise.all([
      supabase
        .from('affiliate_clicks')
        .select('*')
        .eq('creator_id', creatorId)
        .order('clicked_at', { ascending: false })
        .limit(50),
      supabase
        .from('affiliate_signups')
        .select('*')
        .eq('creator_id', creatorId)
        .order('signed_up_at', { ascending: false })
        .limit(50),
      supabase
        .from('affiliate_conversions')
        .select('*')
        .eq('creator_id', creatorId)
        .order('converted_at', { ascending: false })
        .limit(50),
      supabase
        .from('affiliate_payouts')
        .select('*')
        .eq('creator_id', creatorId)
        .order('generated_at', { ascending: false }),
    ]);

    return NextResponse.json({
      clicks: clicksRes.data || [],
      signups: signupsRes.data || [],
      conversions: conversionsRes.data || [],
      payouts: payoutsRes.data || [],
    });
  } catch (err) {
    console.error('[affiliate/creator]', err);
    return NextResponse.json({ error: 'Failed to load creator detail' }, { status: 500 });
  }
}
