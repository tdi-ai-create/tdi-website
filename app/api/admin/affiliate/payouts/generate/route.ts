import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const supabase = getServiceSupabase();
    const { period } = await req.json();

    if (!period) {
      return NextResponse.json({ error: 'period required (e.g. 2026-05)' }, { status: 400 });
    }

    const [year, month] = period.split('-').map(Number);
    const start = new Date(year, month - 1, 1).toISOString();
    const end = new Date(year, month, 1).toISOString();

    // Find unpaid, non-refunded conversions in the period
    const { data: conversions, error: fetchErr } = await supabase
      .from('affiliate_conversions')
      .select('*')
      .gte('converted_at', start)
      .lt('converted_at', end)
      .is('payout_id', null)
      .eq('refunded', false);

    if (fetchErr) throw fetchErr;

    if (!conversions || conversions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No unpaid conversions for this period',
        payoutsCreated: 0,
      });
    }

    // Group by creator
    const grouped: Record<string, typeof conversions> = {};
    conversions.forEach(c => {
      if (!grouped[c.creator_id]) grouped[c.creator_id] = [];
      grouped[c.creator_id].push(c);
    });

    let payoutsCreated = 0;

    const linkFailures: { payoutId: string; error: string }[] = [];

    for (const [creatorId, creatorConversions] of Object.entries(grouped)) {
      const grossCents = creatorConversions.reduce((s, c) => s + c.gross_amount_cents, 0);
      const netCents = creatorConversions.reduce((s, c) => s + (c.net_revenue_cents || 0), 0);
      const payoutCents = creatorConversions.reduce((s, c) => s + (c.creator_payout_cents || 0), 0);

      // Insert payout row
      const { data: payout, error: insertErr } = await supabase
        .from('affiliate_payouts')
        .insert({
          creator_id: creatorId,
          period,
          conversion_count: creatorConversions.length,
          gross_revenue_cents: grossCents,
          net_revenue_cents: netCents,
          payout_amount_cents: payoutCents,
          status: 'pending',
          // Attribution comes from the authenticated session, not from the
          // request body, which the caller could set to anyone.
          generated_by: auth.member.email,
        })
        .select()
        .single();

      if (insertErr) {
        console.error(`Failed to create payout for creator ${creatorId}:`, insertErr);
        continue;
      }

      // Link conversions to this payout.
      //
      // This must not fail quietly. If the payout row exists but its
      // conversions are still unlinked, the next run sees them as unpaid and
      // generates a second payout for the same work.
      const conversionIds = creatorConversions.map(c => c.id);
      const { error: linkErr } = await supabase
        .from('affiliate_conversions')
        .update({ payout_id: payout.id })
        .in('id', conversionIds);

      if (linkErr) {
        console.error('[payouts/generate] Failed to link conversions', {
          payoutId: payout.id, conversionIds, error: linkErr.message,
        });
        linkFailures.push({ payoutId: payout.id, error: linkErr.message });
      }

      payoutsCreated++;
    }

    // A payout whose conversions did not link is not a finished payout, so
    // this reports the partial state rather than success.
    if (linkFailures.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Payouts were created but some conversions could not be linked. Link them before the next run or they will be paid twice.',
        payoutsCreated,
        linkFailures,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      payoutsCreated,
      totalConversions: conversions.length,
    });
  } catch (err) {
    console.error('[affiliate/payouts/generate]', err);
    return NextResponse.json({ error: 'Failed to generate payouts' }, { status: 500 });
  }
}
