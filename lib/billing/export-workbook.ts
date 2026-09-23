import * as XLSX from 'xlsx';
import { forecastLine, isForecastable, type ForecastInput, type ForecastRow, type Ledger } from '@/lib/billing/forecast';

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
 * The first thing the file opens on, so it has to be the money, in the shape a
 * CFO can act on.
 *
 * Two rounds of Rae's feedback are in here. It first opened on a page of prose
 * with the figures hidden behind tabs: "this is not helpful at all." Then the
 * month roll-up that replaced it was still too thin, because it named no client
 * and drew no line between money that is agreed and money that is pencilled.
 * Rae, 23 September 2026: "dates and client details vs predicted details is
 * important."
 *
 * That distinction is the one that matters most here. Saunemin's second
 * observation is held for March on the superintendent's suggestion, subject to
 * the district calendar, and a roll-up that shows $4,500 in March 2027 next to
 * genuinely agreed money is telling the CFO something untrue.
 *
 * So: confirmed and held are separate columns everywhere, grant money keeps its
 * own column and is never added to either, and the sheet ends with every dated
 * line named, dated and attributed to a client.
 */
function summarySheet(rows: { row: ForecastRow; serviceType: string }[], generatedOn: string) {
  const dated = rows.filter((r) => r.row.readyOn);
  const undatedRows = rows.filter((r) => !r.row.readyOn);

  const money = (rs: typeof rows, ledger: Ledger, held?: boolean) =>
    rs.filter((r) => r.row.ledger === ledger && (held === undefined || r.row.held === held))
      .reduce((s, r) => s + r.row.amount, 0);
  const count = (rs: typeof rows, ledger: Ledger) => rs.filter((r) => r.row.ledger === ledger).length;

  const months = [...new Set(dated.map((r) => (r.row.readyOn as string).slice(0, 7)))].sort();
  const clients = [...new Set(rows.map((r) => r.row.client))].sort();

  const body: unknown[][] = [
    ['Teachers Deserve It, ready to invoice', '', '', '', '', ''],
    [`Generated ${generatedOn}`, '', '', '', '', ''],
    ['', '', '', '', '', ''],

    ['BY MONTH', '', '', '', '', ''],
    ['Month', 'Confirmed', 'Held, not agreed', 'Grant, awaiting award', 'Complimentary days', ''],
    ...months.map((m) => {
      const inMonth = dated.filter((r) => (r.row.readyOn as string).startsWith(m));
      return [m, money(inMonth, 'client', false), money(inMonth, 'client', true), money(inMonth, 'grant'), count(inMonth, 'complimentary'), ''];
    }),
    ['Dated total', money(dated, 'client', false), money(dated, 'client', true), money(dated, 'grant'), count(dated, 'complimentary'), ''],
    ['Not dated yet', money(undatedRows, 'client'), '', money(undatedRows, 'grant'), count(undatedRows, 'complimentary'), ''],
    ['', '', '', '', '', ''],

    ['BY CLIENT', '', '', '', '', ''],
    ['Client', 'Confirmed', 'Held, not agreed', 'Grant, awaiting award', 'Complimentary days', 'Client money with no date'],
    ...clients.map((c) => {
      const mine = rows.filter((r) => r.row.client === c);
      const myDated = mine.filter((r) => r.row.readyOn);
      return [
        c,
        money(myDated, 'client', false),
        money(myDated, 'client', true),
        money(mine, 'grant'),
        count(mine, 'complimentary'),
        money(mine.filter((r) => !r.row.readyOn), 'client'),
      ];
    }),
    ['', '', '', '', '', ''],

    ['EVERY DATED LINE', '', '', '', '', ''],
    ['Ready to invoice on', 'Client', 'Service', 'Amount', 'Confirmed or held', 'Service happens on'],
    ...dated
      .slice()
      .sort((a, b) => (a.row.readyOn as string).localeCompare(b.row.readyOn as string) || a.row.client.localeCompare(b.row.client))
      .map(({ row: r }) => [
        r.readyOn,
        r.client,
        r.label,
        r.ledger === 'complimentary' ? 0 : r.amount,
        r.ledger === 'grant' ? 'grant, not schedulable' : r.held ? 'held, client has not agreed' : 'confirmed',
        r.serviceOn ?? '',
      ]),
    ['', '', '', '', '', ''],

    ['Confirmed, held and grant are never added together.', '', '', '', '', ''],
    ['Confirmed means the client has agreed the date. Held means we are keeping a date they have not agreed.', '', '', '', '', ''],
    ['Grant money needs the funder to award it first, and the work cannot be scheduled until then.', '', '', '', '', ''],
    ['Complimentary work is real delivery that will never produce an invoice, so it is counted in days.', '', '', '', '', ''],
    ['Every date is when a line becomes ready. Nothing sends itself.', '', '', '', '', ''],
  ];

  const ws = XLSX.utils.aoa_to_sheet(body);
  ws['!cols'] = [
    { wch: 34 }, { wch: 30 }, { wch: 34 }, { wch: 22 }, { wch: 28 }, { wch: 24 },
  ];
  return ws;
}

function sheetFrom(headers: string[], rows: unknown[][]) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  // Size to the widest cell, not just the header. A truncated client name is
  // the first thing that makes an export look careless.
  ws['!cols'] = headers.map((h, c) => {
    const widest = rows.reduce((w, r) => Math.max(w, String(r[c] ?? '').length), h.length);
    return { wch: Math.min(Math.max(widest + 2, 12), 60) };
  });
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
  XLSX.utils.book_append_sheet(wb, summarySheet(rows, generatedOn), 'Summary');
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
  XLSX.utils.book_append_sheet(wb, sheetFrom(LINE_HEADERS, of('client')), 'Client money');
  XLSX.utils.book_append_sheet(wb, sheetFrom(LINE_HEADERS, of('grant')), 'Grant money');
  XLSX.utils.book_append_sheet(wb, sheetFrom(LINE_HEADERS, of('complimentary')), 'Complimentary');
  return wb;
}
