import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const supabase = getServiceSupabase();
    const period = req.nextUrl.searchParams.get('period');

    if (!period) {
      return NextResponse.json({ error: 'period required' }, { status: 400 });
    }

    const { data: payouts, error } = await supabase
      .from('affiliate_payouts')
      .select('*, creators(name, email, affiliate_slug)')
      .eq('period', period)
      .order('payout_amount_cents', { ascending: false });

    if (error) throw error;

    const monthLabel = formatPeriodLabel(period);
    const headers = 'Creator Name,Email,Affiliate Slug,Period,Conversions Count,Gross Revenue,Net Revenue,Creator Payout (50%),Payment Method,Notes';

    const rows = (payouts || []).map(p => {
      const creator = p.creators as any;
      return [
        esc(creator?.name || ''),
        esc(creator?.email || ''),
        esc(creator?.affiliate_slug || ''),
        esc(monthLabel),
        p.conversion_count,
        `$${(p.gross_revenue_cents / 100).toFixed(2)}`,
        `$${(p.net_revenue_cents / 100).toFixed(2)}`,
        `$${(p.payout_amount_cents / 100).toFixed(2)}`,
        esc(p.paid_method || ''),
        esc(p.paid_reference || ''),
      ].join(',');
    });

    const csv = [headers, ...rows].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="affiliate-payouts-${period}.csv"`,
      },
    });
  } catch (err) {
    console.error('[affiliate/payouts/export]', err);
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 });
  }
}

function esc(v: string): string {
  if (!v) return '';
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

function formatPeriodLabel(period: string): string {
  const [year, month] = period.split('-').map(Number);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${months[month - 1]} ${year}`;
}
