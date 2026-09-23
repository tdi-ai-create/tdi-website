/**
 * When each contract line becomes ready to invoice.
 *
 * Nothing here predicts a send. Rae, 22 September 2026: an invoice only ever
 * leaves the building when Bella or another team member presses Send on a
 * drafted email they can edit first. So every date this file produces is the
 * day a line becomes *ready*, which is a prompt for a person rather than a
 * promise to a client. The screen must say ready everywhere, never sent.
 *
 * Two ledgers, never one number. Grant funded work is gated on a funder
 * deciding, not on us delivering, and on 22 September it was $97,527 against
 * $54,920 of client money. Adding them would tell the CFO that two thirds of
 * the pipeline is collectable when it is contingent.
 */

export type Ledger = 'client' | 'grant' | 'complimentary';

/** Services that happen on a day, and become billable once that day is behind us. */
const VISIT_SHAPED = new Set(['observation', 'virtual_session', 'executive_session', 'pd_day']);

/**
 * Services that are not a visit and become billable when the contract starts.
 *
 * This is what the team already does rather than a rule invented here. Seven Hub
 * memberships and a book set have been billed, and every one went out within
 * about a month of its contract start, several of them on the same invoice.
 * One line even records delivered_by as the words "start of contract".
 */
const MILESTONE_SHAPED = new Set(['hub_membership', 'book']);

export type ForecastInput = {
  id: string;
  label: string;
  service_type: string;
  total_amount: string | number | null;
  is_complimentary: boolean | null;
  funding_hold: boolean | null;
  delivery_state: string | null;
  billing_state: string | null;
  planned_date: string | null;
  planned_confidence: string | null;
  district_name: string | null;
  /** From the partnership. When a membership or a book set becomes billable. */
  contract_start?: string | null;
};

export type ForecastRow = {
  id: string;
  label: string;
  client: string;
  ledger: Ledger;
  amount: number;
  /** The day it becomes ready to invoice. Null means it cannot be placed yet. */
  readyOn: string | null;
  /** Why it cannot be placed. Null when it can. */
  blockedBy: string | null;
  serviceOn: string | null;
  held: boolean;
};

const addDays = (iso: string, days: number) => {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
};

export const monthKey = (iso: string) => iso.slice(0, 7);

function ledgerOf(l: ForecastInput): Ledger {
  if (l.is_complimentary) return 'complimentary';
  if (l.funding_hold) return 'grant';
  return 'client';
}

/**
 * A line belongs on the forecast only while it is still ahead of us. Delivered,
 * cancelled and already-billed lines are history, and counting them would
 * double the pipeline against the invoices they already produced.
 */
export function isForecastable(l: ForecastInput): boolean {
  return l.delivery_state === 'scheduled' && l.billing_state === 'not_billed';
}

/**
 * The rule, in one place so the screen and any export cannot drift apart.
 *
 * Client money on a visit: the day after the service. That leaves room for the
 * wrap up email and dashboard update already promised within 24 hours, and
 * means an invoice never lands before the Love Notes do.
 *
 * Client money on a milestone: the contract start date. Memberships and book
 * sets are not a day someone turns up, they are access that begins when the
 * contract does, and that is already how every one of them has been billed.
 *
 * Grant money: not on the calendar at all until the grant is awarded. Rae,
 * 22 September 2026: funding work is only allowed once funding has been
 * awarded. So a held line waits in the queue saying exactly that. The moment
 * the grant lands, funding_hold clears and the line becomes ordinary work,
 * taking whichever client rule fits its service type.
 *
 * Nothing here reads the funding pursuit. Rae, 23 September 2026: funding and
 * billing are separate systems. funding_hold lives on the contract line itself
 * and is all billing needs to know, so there is no cross-system join to go
 * stale, and no field that only the other system can fill.
 */
export function forecastLine(l: ForecastInput): ForecastRow {
  const ledger = ledgerOf(l);
  const amount = Number(l.total_amount ?? 0);
  const visitShaped = VISIT_SHAPED.has(l.service_type);
  const milestoneShaped = MILESTONE_SHAPED.has(l.service_type);

  // What day the service itself happens. For a visit that is the date someone
  // planned. For a membership it is the day access begins, which is the
  // contract start and needs nobody to plan it.
  const serviceOn = milestoneShaped ? (l.contract_start ?? null) : l.planned_date;

  const base = {
    id: l.id,
    label: l.label,
    client: l.district_name ?? 'Unknown client',
    ledger,
    amount,
    serviceOn,
    held: l.planned_confidence === 'held',
  };

  // A grant line cannot be scheduled, let alone billed, until the funder says
  // yes. It waits in the queue saying so, whatever its service type.
  if (ledger === 'grant') {
    return {
      ...base,
      readyOn: null,
      blockedBy: 'Waiting on the grant to be awarded. Work cannot be scheduled until it is.',
    };
  }

  if (milestoneShaped) {
    return serviceOn
      ? { ...base, readyOn: serviceOn, blockedBy: null }
      : { ...base, readyOn: null, blockedBy: 'No contract start date, so there is nothing to bill this from.' };
  }

  if (!visitShaped) {
    return {
      ...base,
      readyOn: null,
      blockedBy: `${l.service_type.replace(/_/g, ' ')} has no billing trigger in the system yet.`,
    };
  }

  if (!serviceOn) {
    return { ...base, readyOn: null, blockedBy: 'No planned date. Nobody has booked this line.' };
  }

  return { ...base, readyOn: addDays(serviceOn, 1), blockedBy: null };
}

export type Month = {
  key: string;
  /** Client money on a date the client has agreed. */
  client: number;
  /**
   * Client money on a date we are holding and they have not agreed. Kept apart
   * from `client` because a month total that mixes the two reports a pencilled
   * date as revenue, which is how a forecast quietly becomes a promise.
   */
  clientHeld: number;
  grant: number;
  complimentaryLines: number;
  rows: ForecastRow[];
};

/** Complimentary lines are real delivery days and are never money. */
export function groupByMonth(rows: ForecastRow[]): Month[] {
  const byMonth = new Map<string, Month>();
  for (const r of rows) {
    if (!r.readyOn) continue;
    const key = monthKey(r.readyOn);
    const m = byMonth.get(key) ?? { key, client: 0, clientHeld: 0, grant: 0, complimentaryLines: 0, rows: [] };
    if (r.ledger === 'client') { if (r.held) m.clientHeld += r.amount; else m.client += r.amount; }
    else if (r.ledger === 'grant') m.grant += r.amount;
    else m.complimentaryLines += 1;
    m.rows.push(r);
    byMonth.set(key, m);
  }
  for (const m of byMonth.values()) {
    m.rows.sort((a, b) => (a.readyOn! < b.readyOn! ? -1 : a.readyOn! > b.readyOn! ? 1 : a.client.localeCompare(b.client)));
  }
  return [...byMonth.values()].sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * The undated queue. This is the finding, not an empty state: on 22 September
 * every one of the 43 scheduled lines was in here, so it belongs above the
 * calendar rather than under it.
 */
export function undated(rows: ForecastRow[]): ForecastRow[] {
  return rows
    .filter((r) => !r.readyOn)
    .sort((a, b) => b.amount - a.amount || a.client.localeCompare(b.client));
}
