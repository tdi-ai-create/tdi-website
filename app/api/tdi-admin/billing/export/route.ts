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

  // Every live invoice, not only those a contract line points at. The oldest
  // unpaid ones belong to no line: three are the 2025-26 Allenwood backfill and
  // one is a speaking fee that never had a contract. A receivables sheet built
  // from the lines alone would omit the money most overdue.
  const [districts, partnerships, quotes, invoices, allInvoices, payments] = await Promise.all([
    // Every district, not only those a contract line names. An invoice can
    // belong to a client with no contract line at all, and one does: the
    // speaking fee. Narrowing this map rendered it as "Unknown client".
    sb.from('districts').select('id, name'),
    ids('partnership_id').length ? sb.from('partnerships').select('id, contract_start').in('id', ids('partnership_id')) : { data: [], error: null },
    ids('quote_id').length ? sb.from('quotes').select('id, quote_number').in('id', ids('quote_id')) : { data: [], error: null },
    ids('invoice_id').length ? sb.from('intelligence_invoices').select('id, invoice_number, status, amount, invoice_date, due_date').in('id', ids('invoice_id')) : { data: [], error: null },
    sb.from('intelligence_invoices').select('id, invoice_number, status, amount, invoice_date, due_date, po_number, district_id').neq('status', 'void'),
    sb.from('billing_payment_applications').select('invoice_id, amount'),
  ]);
  for (const r of [districts, partnerships, quotes, invoices, allInvoices, payments]) {
    if (r.error) throw new Error(r.error.message);
  }

  const appliedTo = new Map<string, number>();
  for (const p of payments.data ?? []) {
    appliedTo.set((p as any).invoice_id, (appliedTo.get((p as any).invoice_id) ?? 0) + Number((p as any).amount));
  }

  const lookups: Lookups = {
    districtName: new Map((districts.data ?? []).map((d: any) => [d.id, d.name])),
    contractStart: new Map((partnerships.data ?? []).map((p: any) => [p.id, p.contract_start])),
    quoteNumber: new Map((quotes.data ?? []).map((q: any) => [q.id, q.quote_number])),
    invoice: new Map((invoices.data ?? []).map((i: any) => [i.id, i])),
    invoices: (allInvoices.data ?? []).map((i: any) => ({ ...i, applied: appliedTo.get(i.id) ?? 0 })),
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
