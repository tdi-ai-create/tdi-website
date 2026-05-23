import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const supabase = getServiceSupabase();
    const { payoutIds, paidMethod, paidReference, paidAt } = await req.json();

    if (!payoutIds || !Array.isArray(payoutIds) || payoutIds.length === 0) {
      return NextResponse.json({ error: 'payoutIds required' }, { status: 400 });
    }
    if (!paidMethod) {
      return NextResponse.json({ error: 'paidMethod required' }, { status: 400 });
    }

    const paidDate = paidAt || new Date().toISOString();

    // Update payouts
    const { error: updateErr } = await supabase
      .from('affiliate_payouts')
      .update({
        status: 'paid',
        paid_at: paidDate,
        paid_method: paidMethod,
        paid_reference: paidReference || null,
      })
      .in('id', payoutIds);

    if (updateErr) throw updateErr;

    // Update related conversions
    const { error: convErr } = await supabase
      .from('affiliate_conversions')
      .update({ paid_to_creator_at: paidDate })
      .in('payout_id', payoutIds);

    if (convErr) {
      console.error('[mark-paid] Failed to update conversions:', convErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[affiliate/payouts/mark-paid]', err);
    return NextResponse.json({ error: 'Failed to mark paid' }, { status: 500 });
  }
}
