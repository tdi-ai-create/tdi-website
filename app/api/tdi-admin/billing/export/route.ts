import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
import { getServiceSupabase } from '@/lib/supabase';
import { forecastLine, isForecastable, type ForecastInput } from '@/lib/billing/forecast';

export const dynamic = 'force-dynamic';

/**
 * Billing as a file, for Omar.
 *
 * Two views, one route, because they read the same rows and must never
 * disagree. The forecast view is the Ready to invoice screen. The contracts
 * view is every line with its delivery and billing position.
 *
 * Ledger is its own column in both, so a spreadsheet cannot accidentally sum
 * grant money and client money into one figure. That is the single thing this
 * file exists to prevent: the screen is careful about it and a careless export
 * would undo that in one click of AutoSum.
 *
 * Money is written as a bare number with two decimals, no currency symbol and
 * no thousands separator, because Excel reads $4,500.00 as text and then
 * silently refuses to add it up.
 */

/** RFC 4180. Quote everything that could contain a comma, quote or newline. */
function csvCell(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  // A leading =, +, - or @ is executed as a formula by Excel and Sheets. A
  // client name is not a formula, so it gets a leading apostrophe.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

const csv = (rows: unknown[][]) => rows.map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
const amount = (n: unknown) => (n === null || n === undefined ? '' : Number(n).toFixed(2));

export async function GET(request: NextRequest) {
  // An x-user-email header is a claim, not proof. Anyone could send it.
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const view = request.nextUrl.searchParams.get('view') === 'contracts' ? 'contracts' : 'forecast';
  const sb = getServiceSupabase();

  const { data: lines, error: lErr } = await sb
    .from('contract_deliverables')
    .select('id, label, service_type, quantity, unit_price, total_amount, is_complimentary, funding_hold, delivery_state, billing_state, delivery_date, delivered_by, planned_date, planned_confidence, district_id, quote_id, funding_pursuit_id, invoice_id, sequence_number, sequence_total');
  if (lErr) {
    console.error('[billing/export] deliverables:', lErr.message);
    return NextResponse.json({ error: lErr.message }, { status: 500 });
  }

  const districtIds = [...new Set((lines ?? []).map((l) => l.district_id).filter(Boolean))];
  const pursuitIds = [...new Set((lines ?? []).map((l) => l.funding_pursuit_id).filter(Boolean))];
  const quoteIds = [...new Set((lines ?? []).map((l) => l.quote_id).filter(Boolean))];
  const invoiceIds = [...new Set((lines ?? []).map((l) => l.invoice_id).filter(Boolean))];

  const [{ data: districts }, { data: pursuits }, { data: quotes }, { data: invoices }] = await Promise.all([
    districtIds.length ? sb.from('districts').select('id, name').in('id', districtIds) : Promise.resolve({ data: [] } as any),
    pursuitIds.length ? sb.from('funding_pursuits').select('id, pursuit_name, expected_decision_date').in('id', pursuitIds) : Promise.resolve({ data: [] } as any),
    quoteIds.length ? sb.from('quotes').select('id, quote_number').in('id', quoteIds) : Promise.resolve({ data: [] } as any),
    invoiceIds.length ? sb.from('intelligence_invoices').select('id, invoice_number, status, amount, due_date, invoice_date').in('id', invoiceIds) : Promise.resolve({ data: [] } as any),
  ]);

  const dName = new Map<string, string>((districts ?? []).map((d: any) => [d.id, d.name]));
  type PursuitRow = { id: string; pursuit_name: string | null; expected_decision_date: string | null };
  const pursuit = new Map<string, PursuitRow>((pursuits ?? []).map((p: any) => [p.id, p as PursuitRow]));
  const qNumber = new Map<string, string>((quotes ?? []).map((q: any) => [q.id, q.quote_number]));
  type InvoiceRow = { id: string; invoice_number: string; status: string; amount: string; due_date: string | null; invoice_date: string | null };
  const invoice = new Map<string, InvoiceRow>((invoices ?? []).map((i: any) => [i.id, i as InvoiceRow]));

  const ledgerOf = (l: any) => (l.is_complimentary ? 'complimentary' : l.funding_hold ? 'grant' : 'client');

  let rows: unknown[][];
  let filename: string;

  if (view === 'forecast') {
    const forecast = (lines ?? [])
      .filter((l) => isForecastable(l as unknown as ForecastInput))
      .map((l) => {
        const p = l.funding_pursuit_id ? pursuit.get(l.funding_pursuit_id) : null;
        return {
          row: forecastLine({
            ...(l as unknown as ForecastInput),
            district_name: dName.get(l.district_id) ?? null,
            award_expected_on: p?.expected_decision_date ?? null,
          }),
          pursuitName: p?.pursuit_name ?? null,
          serviceType: l.service_type,
        };
      })
      // Dated rows first, in date order. Undated after, biggest first, because
      // that is the order they are worth chasing in.
      .sort((a, b) => {
        if (a.row.readyOn && b.row.readyOn) return a.row.readyOn < b.row.readyOn ? -1 : 1;
        if (a.row.readyOn) return -1;
        if (b.row.readyOn) return 1;
        return b.row.amount - a.row.amount;
      });

    rows = [
      ['ready_to_invoice_on', 'month', 'client', 'line', 'service_type', 'ledger', 'amount', 'service_date', 'date_confidence', 'grant_decision_expected', 'grant_pursuit', 'not_yet_datable_because'],
      ...forecast.map(({ row: r, pursuitName, serviceType }) => [
        r.readyOn ?? '',
        r.readyOn ? r.readyOn.slice(0, 7) : '',
        r.client,
        r.label,
        serviceType,
        r.ledger,
        r.ledger === 'complimentary' ? '0.00' : amount(r.amount),
        r.serviceOn ?? '',
        r.held ? 'held' : r.serviceOn ? 'confirmed' : '',
        r.awardOn ?? '',
        pursuitName ?? '',
        r.blockedBy ?? '',
      ]),
    ];
    filename = 'tdi-ready-to-invoice';
  } else {
    const sorted = (lines ?? []).slice().sort((a, b) => {
      const ca = dName.get(a.district_id) ?? '';
      const cb = dName.get(b.district_id) ?? '';
      return ca.localeCompare(cb) || (a.sequence_number ?? 0) - (b.sequence_number ?? 0);
    });

    rows = [
      ['client', 'quote', 'line', 'service_type', 'sequence', 'quantity', 'unit_price', 'amount', 'ledger', 'delivery_state', 'delivered_on', 'delivered_by', 'planned_date', 'date_confidence', 'billing_state', 'invoice_number', 'invoice_status', 'invoice_amount', 'invoice_date', 'due_date', 'grant_pursuit', 'grant_decision_expected'],
      ...sorted.map((l) => {
        const inv = l.invoice_id ? invoice.get(l.invoice_id) : null;
        const p = l.funding_pursuit_id ? pursuit.get(l.funding_pursuit_id) : null;
        return [
          dName.get(l.district_id) ?? '',
          qNumber.get(l.quote_id) ?? '',
          l.label,
          l.service_type,
          l.sequence_number && l.sequence_total ? `${l.sequence_number} of ${l.sequence_total}` : '',
          l.quantity,
          amount(l.unit_price),
          amount(l.total_amount),
          ledgerOf(l),
          l.delivery_state ?? '',
          l.delivery_date ?? '',
          l.delivered_by ?? '',
          l.planned_date ?? '',
          l.planned_confidence ?? '',
          l.billing_state ?? '',
          inv?.invoice_number ?? '',
          inv?.status ?? '',
          amount(inv?.amount),
          inv?.invoice_date ?? '',
          inv?.due_date ?? '',
          p?.pursuit_name ?? '',
          p?.expected_decision_date ?? '',
        ];
      }),
    ];
    filename = 'tdi-billing-lines';
  }

  const today = new Date().toISOString().slice(0, 10);
  // The BOM is what makes Excel open a UTF-8 file without mangling accents.
  const body = '﻿' + csv(rows);

  return new NextResponse(body, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${filename}-${today}.csv"`,
      'cache-control': 'no-store',
    },
  });
}
