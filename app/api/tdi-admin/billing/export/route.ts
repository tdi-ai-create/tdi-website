import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
import { getServiceSupabase } from '@/lib/supabase';
import { buildForecastWorkbook, buildLinesWorkbook, type LineRow, type Lookups } from '@/lib/billing/export-workbook';

export const dynamic = 'force-dynamic';

/**
 * Billing as a workbook, for Omar.
 *
 * This route only reads and joins. Every decision about what a row says lives
 * in lib/billing/export-workbook.ts alongside the forecast rules, so the file
 * and the screen cannot disagree and so a verifier can build the real workbook
 * offline and read it back rather than trusting that a download worked.
 */

/** Everything a workbook needs, fetched once. */
async function load(sb: ReturnType<typeof getServiceSupabase>) {
  const { data: lines, error } = await sb
    .from('contract_deliverables')
    .select('id, label, service_type, quantity, unit_price, total_amount, is_complimentary, funding_hold, delivery_state, billing_state, delivery_date, delivered_by, planned_date, planned_confidence, sequence_number, sequence_total, district_id, partnership_id, quote_id, invoice_id');
  if (error) throw new Error(error.message);

  const rows = (lines ?? []) as unknown as LineRow[];
  const ids = (k: keyof LineRow) => [...new Set(rows.map((l) => l[k]).filter(Boolean))] as string[];

  const [districts, partnerships, quotes, invoices] = await Promise.all([
    ids('district_id').length ? sb.from('districts').select('id, name').in('id', ids('district_id')) : { data: [], error: null },
    ids('partnership_id').length ? sb.from('partnerships').select('id, contract_start').in('id', ids('partnership_id')) : { data: [], error: null },
    ids('quote_id').length ? sb.from('quotes').select('id, quote_number').in('id', ids('quote_id')) : { data: [], error: null },
    ids('invoice_id').length ? sb.from('intelligence_invoices').select('id, invoice_number, status, amount, invoice_date, due_date').in('id', ids('invoice_id')) : { data: [], error: null },
  ]);
  for (const r of [districts, partnerships, quotes, invoices]) {
    if (r.error) throw new Error(r.error.message);
  }

  const lookups: Lookups = {
    districtName: new Map((districts.data ?? []).map((d: any) => [d.id, d.name])),
    contractStart: new Map((partnerships.data ?? []).map((p: any) => [p.id, p.contract_start])),
    quoteNumber: new Map((quotes.data ?? []).map((q: any) => [q.id, q.quote_number])),
    invoice: new Map((invoices.data ?? []).map((i: any) => [i.id, i])),
  };
  return { rows, lookups };
}

export async function GET(request: NextRequest) {
  // An x-user-email header is a claim, not proof. Anyone could send it.
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const view = request.nextUrl.searchParams.get('view') === 'lines' ? 'lines' : 'forecast';

  let rows: LineRow[];
  let lookups: Lookups;
  try {
    ({ rows, lookups } = await load(getServiceSupabase()));
  } catch (err) {
    console.error('[billing/export]', err);
    return NextResponse.json({ error: String(err instanceof Error ? err.message : err) }, { status: 500 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const wb = view === 'forecast'
    ? buildForecastWorkbook(rows, lookups, today)
    : buildLinesWorkbook(rows, lookups, today);

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  const filename = view === 'forecast' ? `tdi-ready-to-invoice-${today}.xlsx` : `tdi-billing-lines-${today}.xlsx`;

  return new NextResponse(new Uint8Array(buf), {
    headers: {
      'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'content-disposition': `attachment; filename="${filename}"`,
      'content-length': String(buf.length),
      'cache-control': 'no-store',
    },
  });
}
