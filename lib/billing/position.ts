/**
 * The finance side of billing: what is owed, what the book is worth, and when
 * the money actually arrives.
 *
 * The forecast answers when work becomes billable. Rae put that in front of a
 * CFO's eye on 23 September 2026 and the gaps were immediate. There was no
 * receivables position, so $8,332.20 already invoiced and unpaid appeared
 * nowhere. There was no cash date, only a billing date, so the one column a
 * cash forecast is built from had to be worked out in the margin. And there was
 * no waterfall, so nothing stated contracted, delivered, invoiced and collected
 * in one place.
 *
 * These are pure functions over rows the caller has already fetched, so the
 * workbook, any screen and the verifier all compute the same figures from the
 * same code rather than three similar queries that drift.
 */

export type InvoiceRow = {
  id: string;
  invoice_number: string;
  status: string;
  amount: string | number;
  invoice_date: string | null;
  due_date: string | null;
  po_number: string | null;
  district_id: string | null;
  applied: number;
};

export type DeliverableRow = {
  total_amount: string | number | null;
  is_complimentary: boolean | null;
  funding_hold: boolean | null;
  delivery_state: string | null;
  billing_state: string | null;
  district_id: string | null;
};

const n = (v: unknown) => Number(v ?? 0);

/**
 * Money, rounded to the cent.
 *
 * Summing floats produced 72864.29999999999 on the waterfall. In a finance file
 * that is not a rounding curiosity, it is the thing that makes a reader stop
 * trusting every other number on the sheet.
 */
const cents = (v: number) => Math.round(v * 100) / 100;

/** Contracted through to collected, with the two ledgers kept apart. */
export function waterfall(lines: DeliverableRow[], invoices: InvoiceRow[]) {
  const real = lines.filter((l) => !l.is_complimentary);
  const sum = (rs: DeliverableRow[]) => rs.reduce((s, l) => s + n(l.total_amount), 0);

  const client = real.filter((l) => !l.funding_hold);
  const grant = real.filter((l) => l.funding_hold);
  const live = invoices.filter((i) => i.status !== 'void');

  return {
    contractedClient: cents(sum(client)),
    contractedGrant: cents(sum(grant)),
    contracted: cents(sum(real)),
    delivered: cents(sum(real.filter((l) => l.delivery_state === 'delivered'))),
    invoiced: cents(live.reduce((s, i) => s + n(i.amount), 0)),
    collected: cents(live.reduce((s, i) => s + i.applied, 0)),
    outstanding: cents(live.reduce((s, i) => s + (n(i.amount) - i.applied), 0)),
    notYetDeliveredClient: cents(sum(client.filter((l) => l.delivery_state !== 'delivered'))),
    notYetDeliveredGrant: cents(sum(grant.filter((l) => l.delivery_state !== 'delivered'))),
  };
}

/**
 * Share of the contracted book per client.
 *
 * Allenwood is 44.9 percent of it, and two thirds of their share is contingent
 * on a grant nobody has won. A total that does not show this reads as a
 * healthier book than it is.
 */
export function concentration(lines: DeliverableRow[], name: (id: string | null) => string) {
  const real = lines.filter((l) => !l.is_complimentary);
  const total = real.reduce((s, l) => s + n(l.total_amount), 0);
  const byClient = new Map<string, { contracted: number; grant: number; comp: number }>();

  for (const l of lines) {
    const c = name(l.district_id);
    const e = byClient.get(c) ?? { contracted: 0, grant: 0, comp: 0 };
    if (l.is_complimentary) e.comp += 1;
    else {
      e.contracted += n(l.total_amount);
      if (l.funding_hold) e.grant += n(l.total_amount);
    }
    byClient.set(c, e);
  }

  return [...byClient.entries()]
    .map(([client, e]) => ({
      client,
      ...e,
      contracted: cents(e.contracted),
      grant: cents(e.grant),
      share: total > 0 ? (e.contracted / total) * 100 : 0,
    }))
    .sort((a, b) => b.contracted - a.contracted);
}

export type AgingBucket = 'current' | '1 to 30 days' | '31 to 60 days' | 'over 60 days' | 'cannot be aged';

/**
 * An invoice with no due date cannot be aged, and three of the five open ones
 * have none. Calling those current would hide them inside a healthy looking
 * number, so they get a bucket of their own that names the problem.
 */
export function bucketOf(due: string | null, today: string): AgingBucket {
  if (!due) return 'cannot be aged';
  if (today <= due) return 'current';
  const days = daysBetween(due, today);
  if (days <= 30) return '1 to 30 days';
  if (days <= 60) return '31 to 60 days';
  return 'over 60 days';
}

export function daysBetween(from: string, to: string) {
  const d = (iso: string) => {
    const [y, m, day] = iso.split('-').map(Number);
    return Date.UTC(y, m - 1, day);
  };
  return Math.round((d(to) - d(from)) / 86400000);
}

export type Receivable = {
  invoice: string;
  client: string;
  invoiced: number;
  paid: number;
  owed: number;
  invoiceDate: string | null;
  dueDate: string | null;
  daysPastDue: number | null;
  bucket: AgingBucket;
  po: string | null;
  status: string;
  /** Set when the record contradicts itself and somebody has to look. */
  problem: string | null;
};

/** Every invoice with money still against it, oldest first. */
export function receivables(invoices: InvoiceRow[], name: (id: string | null) => string, today: string): Receivable[] {
  return invoices
    .filter((i) => i.status !== 'void' && n(i.amount) - i.applied > 0.005)
    .map((i) => {
      const owed = cents(n(i.amount) - i.applied);
      const bucket = bucketOf(i.due_date, today);
      return {
        invoice: i.invoice_number,
        client: name(i.district_id),
        invoiced: cents(n(i.amount)),
        paid: cents(i.applied),
        owed,
        invoiceDate: i.invoice_date,
        dueDate: i.due_date,
        daysPastDue: i.due_date && today > i.due_date ? daysBetween(i.due_date, today) : null,
        bucket,
        po: i.po_number,
        status: i.status,
        // A record that disagrees with itself is the most expensive thing in a
        // billing file, because it looks settled.
        problem:
          i.status === 'paid'
            ? 'Marked paid with nothing applied against it.'
            : !i.due_date
              ? 'No due date, so it cannot be aged.'
              : null,
      };
    })
    .sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999') || b.owed - a.owed);
}

export function agingTotals(rs: Receivable[]) {
  const of = (b: AgingBucket) => cents(rs.filter((r) => r.bucket === b).reduce((s, r) => s + r.owed, 0));
  return {
    current: of('current'),
    d1to30: of('1 to 30 days'),
    d31to60: of('31 to 60 days'),
    over60: of('over 60 days'),
    cannotBeAged: of('cannot be aged'),
    total: cents(rs.reduce((s, r) => s + r.owed, 0)),
  };
}

/** Default payment terms. Matches what send-invoice already computes. */
export const NET_DAYS = 30;

export function addDays(iso: string, days: number) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/**
 * When a line that is ready turns into money.
 *
 * Net 30 from the day it becomes ready, which assumes the invoice goes out that
 * day. No invoice has ever been sent through the Outbox, so there is no
 * measured lag to use instead, and the sheet says so rather than presenting an
 * assumption as a fact. Once a few have gone out this becomes evidence.
 */
export function expectedCashOn(readyOn: string) {
  return addDays(readyOn, NET_DAYS);
}
