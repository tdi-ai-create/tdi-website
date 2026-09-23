import * as XLSX from 'xlsx';
import { forecastLine, isForecastable, type ForecastInput, type ForecastRow } from '@/lib/billing/forecast';

/**
 * Billing as a workbook.
 *
 * The rows are built here rather than in the route, so the file and the screen
 * cannot drift apart and so a verifier can build the real thing offline and
 * read it back. That pattern already exists here for the sales export, which
 * shipped for months silently dropping the notes column.
 *
 * Client money and grant money are on separate sheets. That is the whole point
 * of this file. The screen is careful never to add them together, and a single
 * flat sheet would undo that care with one AutoSum, because a spreadsheet does
 * not know that two thirds of the pipeline is contingent on a funder. Separate
 * sheets make the wrong number difficult to produce by accident rather than
 * merely discouraged.
 *
 * Money is written as real numbers, never as formatted strings. Excel reads
 * "$4,500.00" as text and then refuses to add it up, which is how an export
 * ends up looking complete and totalling zero.
 */

export type LineRow = {
  id: string;
  label: string;
  service_type: string;
  quantity: number | null;
  unit_price: string | number | null;
  total_amount: string | number | null;
  is_complimentary: boolean | null;
  funding_hold: boolean | null;
  delivery_state: string | null;
  billing_state: string | null;
  delivery_date: string | null;
  delivered_by: string | null;
  planned_date: string | null;
  planned_confidence: string | null;
  sequence_number: number | null;
  sequence_total: number | null;
  district_id: string | null;
  partnership_id: string | null;
  quote_id: string | null;
  invoice_id: string | null;
};

export type Lookups = {
  districtName: Map<string, string>;
  contractStart: Map<string, string | null>;
  quoteNumber: Map<string, string>;
  invoice: Map<string, { invoice_number: string; status: string; amount: string | number; invoice_date: string | null; due_date: string | null }>;
};

const num = (v: unknown) => (v === null || v === undefined || v === '' ? null : Number(v));

/** A leading =, +, - or @ is run as a formula by Excel. A client name is not a formula. */
const text = (v: unknown) => {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /^[=+\-@]/.test(s) ? `'${s}` : s;
};

const ledgerOf = (l: LineRow) => (l.is_complimentary ? 'complimentary' : l.funding_hold ? 'grant' : 'client');

export const FORECAST_HEADERS = [
  'ready_to_invoice_on', 'month', 'client', 'line', 'service_type', 'amount',
  'service_date', 'date_confidence', 'not_yet_datable_because',
];

export const LINE_HEADERS = [
  'client', 'quote', 'line', 'service_type', 'sequence', 'quantity', 'unit_price', 'amount',
  'delivery_state', 'delivered_on', 'delivered_by', 'planned_date', 'date_confidence',
  'billing_state', 'invoice_number', 'invoice_status', 'invoice_amount', 'invoice_date', 'due_date',
];

/** One forecast row, as a spreadsheet row. Amount is a number, not a string. */
export function forecastRowCells(r: ForecastRow, serviceType: string): unknown[] {
  return [
    r.readyOn ?? '',
    r.readyOn ? r.readyOn.slice(0, 7) : '',
    text(r.client),
    text(r.label),
    serviceType,
    r.ledger === 'complimentary' ? 0 : r.amount,
    r.serviceOn ?? '',
    r.held ? 'held' : r.serviceOn ? 'confirmed' : '',
    r.blockedBy ?? '',
  ];
}

export function lineRowCells(l: LineRow, lk: Lookups): unknown[] {
  const inv = l.invoice_id ? lk.invoice.get(l.invoice_id) : null;
  return [
    text(l.district_id ? lk.districtName.get(l.district_id) ?? '' : ''),
    text(l.quote_id ? lk.quoteNumber.get(l.quote_id) ?? '' : ''),
    text(l.label),
    l.service_type,
    l.sequence_number && l.sequence_total ? `${l.sequence_number} of ${l.sequence_total}` : '',
    num(l.quantity),
    num(l.unit_price),
    num(l.total_amount),
    l.delivery_state ?? '',
    l.delivery_date ?? '',
    text(l.delivered_by),
    l.planned_date ?? '',
    l.planned_confidence ?? '',
    l.billing_state ?? '',
    text(inv?.invoice_number),
    inv?.status ?? '',
    inv ? num(inv.amount) : null,
    inv?.invoice_date ?? '',
    inv?.due_date ?? '',
  ];
}

/**
 * The sheet that travels with the file.
 *
 * An export gets forwarded, and the person who opens it third has not read the
 * screen it came from. Without this they see two columns of money and one
 * obvious thing to do with them.
 */
function readMeSheet(kind: 'forecast' | 'lines', generatedOn: string) {
  const rows: unknown[][] = [
    ['Teachers Deserve It, billing export'],
    [],
    ['Generated', generatedOn],
    ['Contents', kind === 'forecast' ? 'When contracted work becomes ready to invoice' : 'Every contract line with its delivery and billing position'],
    [],
    ['Client money and grant money are on separate sheets, and are never added together.'],
    ['Client money is gated on us delivering the work.'],
    ['Grant money is gated on a funder awarding it, and cannot be invoiced until the award lands.'],
    ['Complimentary work is real delivery that will never produce an invoice. It is counted in days, never in money.'],
    [],
    ['Every date in this file is when a line becomes ready to invoice.'],
    ['Nothing sends itself. An invoice leaves only when someone presses Send on a drafted email.'],
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 100 }];
  return ws;
}

function sheetFrom(headers: string[], rows: unknown[][]) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = headers.map((h) => ({ wch: Math.min(Math.max(h.length + 2, 12), 52) }));
  if (rows.length) ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length, c: headers.length - 1 } }) };
  return ws;
}

/** Dated first in date order, then undated with the largest amount at the top. */
function sortForecast(a: ForecastRow, b: ForecastRow) {
  if (a.readyOn && b.readyOn) return a.readyOn < b.readyOn ? -1 : a.readyOn > b.readyOn ? 1 : a.client.localeCompare(b.client);
  if (a.readyOn) return -1;
  if (b.readyOn) return 1;
  return b.amount - a.amount || a.client.localeCompare(b.client);
}

export function buildForecastWorkbook(lines: LineRow[], lk: Lookups, generatedOn: string) {
  const rows = lines
    .filter((l) => isForecastable(l as unknown as ForecastInput))
    .map((l) => ({
      row: forecastLine({
        ...(l as unknown as ForecastInput),
        district_name: l.district_id ? lk.districtName.get(l.district_id) ?? null : null,
        contract_start: l.partnership_id ? lk.contractStart.get(l.partnership_id) ?? null : null,
      }),
      serviceType: l.service_type,
    }));

  const of = (ledger: string) =>
    rows.filter((r) => r.row.ledger === ledger).sort((a, b) => sortForecast(a.row, b.row))
      .map(({ row, serviceType }) => forecastRowCells(row, serviceType));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, readMeSheet('forecast', generatedOn), 'Read me');
  XLSX.utils.book_append_sheet(wb, sheetFrom(FORECAST_HEADERS, of('client')), 'Client money');
  XLSX.utils.book_append_sheet(wb, sheetFrom(FORECAST_HEADERS, of('grant')), 'Grant money');
  XLSX.utils.book_append_sheet(wb, sheetFrom(FORECAST_HEADERS, of('complimentary')), 'Complimentary');
  return wb;
}

export function buildLinesWorkbook(lines: LineRow[], lk: Lookups, generatedOn: string) {
  const sorted = lines.slice().sort((a, b) => {
    const ca = a.district_id ? lk.districtName.get(a.district_id) ?? '' : '';
    const cb = b.district_id ? lk.districtName.get(b.district_id) ?? '' : '';
    return ca.localeCompare(cb) || (a.sequence_number ?? 0) - (b.sequence_number ?? 0);
  });
  const of = (ledger: string) => sorted.filter((l) => ledgerOf(l) === ledger).map((l) => lineRowCells(l, lk));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, readMeSheet('lines', generatedOn), 'Read me');
  XLSX.utils.book_append_sheet(wb, sheetFrom(LINE_HEADERS, of('client')), 'Client money');
  XLSX.utils.book_append_sheet(wb, sheetFrom(LINE_HEADERS, of('grant')), 'Grant money');
  XLSX.utils.book_append_sheet(wb, sheetFrom(LINE_HEADERS, of('complimentary')), 'Complimentary');
  return wb;
}
