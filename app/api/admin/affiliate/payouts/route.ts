import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from('affiliate_payouts')
      .select('*, creators(name, email)')
      .order('generated_at', { ascending: false });

    if (error) throw error;

    // Group by period + generated_at batch
    const batches: Record<string, {
      period: string;
      totalPayoutCents: number;
      totalConversions: number;
      status: string;
      generatedAt: string;
      generatedBy: string | null;
      payoutIds: string[];
      creators: Array<{ name: string; email: string; payoutCents: number; conversions: number }>;
    }> = {};

    (data || []).forEach(row => {
      // Group by period + generatedAt (rounded to minute for batch grouping)
      const batchKey = `${row.period}__${row.generated_at?.slice(0, 16)}`;
      if (!batches[batchKey]) {
        batches[batchKey] = {
          period: row.period,
          totalPayoutCents: 0,
          totalConversions: 0,
          status: row.status,
          generatedAt: row.generated_at,
          generatedBy: row.generated_by,
          payoutIds: [],
          creators: [],
        };
      }
      const batch = batches[batchKey];
      batch.totalPayoutCents += row.payout_amount_cents;
      batch.totalConversions += row.conversion_count;
      batch.payoutIds.push(row.id);
      // If any payout in batch is pending, batch is pending
      if (row.status === 'pending') batch.status = 'pending';
      const creator = row.creators as any;
      if (creator) {
        batch.creators.push({
          name: creator.name,
          email: creator.email,
          payoutCents: row.payout_amount_cents,
          conversions: row.conversion_count,
        });
      }
    });

    return NextResponse.json({ batches: Object.values(batches) });
  } catch (err) {
    console.error('[affiliate/payouts]', err);
    return NextResponse.json({ error: 'Failed to load payouts' }, { status: 500 });
  }
}
