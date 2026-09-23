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

/** Services that happen on a day. Everything else bills on a milestone. */
const VISIT_SHAPED = new Set(['observation', 'virtual_session', 'executive_session', 'pd_day']);

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
  /** From the funding pursuit this line is held against, when it is held. */
  award_expected_on?: string | null;
  pursuit_name?: string | null;
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
  awardOn: string | null;
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
 * Client money: the day after the service. That leaves room for the wrap up
 * email and dashboard update already promised within 24 hours, and means an
 * invoice never lands before the Love Notes do.
 *
 * Grant money: not on the calendar until the grant is awarded. Rae,
 * 22 September 2026, gave two rules together. The award date is the gate, and
 * funding work is only allowed once funding has been awarded. Taken together
 * the award always precedes the visit, so placing a grant line on its award
 * date would show money a month or more before anything could be billed, and
 * createInvoice would refuse it anyway for having no delivery record.
 *
 * So a held line waits in the queue carrying its expected decision date, which
 * is the honest statement of where that money stands. The moment the grant
 * lands, funding_hold flips and the line becomes ordinary work: ready the day
 * after its visit, exactly like money a school is paying directly.
 *
 * Anything not visit shaped has no date here at all. Hub memberships bill on
 * activation and books bill when they ship, and inventing a visit for them
 * would be worse than admitting we do not model their trigger yet.
 */
export function forecastLine(l: ForecastInput): ForecastRow {
  const ledger = ledgerOf(l);
  const amount = Number(l.total_amount ?? 0);
  const serviceOn = l.planned_date;
  const awardOn = ledger === 'grant' ? (l.award_expected_on ?? null) : null;
  const visitShaped = VISIT_SHAPED.has(l.service_type);

  const base = {
    id: l.id,
    label: l.label,
    client: l.district_name ?? 'Unknown client',
    ledger,
    amount,
    serviceOn,
    awardOn,
    held: l.planned_confidence === 'held',
  };

  // A grant line cannot be scheduled, let alone billed, until the funder says
  // yes. It belongs in the queue with its decision date, not in a month.
  if (ledger === 'grant') {
    return {
      ...base,
      readyOn: null,
      blockedBy: awardOn
        ? `Waiting on the grant decision, expected ${awardOn}. Work cannot be scheduled until it is awarded.`
        : 'Waiting on a grant with no expected decision date, so there is nothing to forecast against.',
    };
  }
  if (!visitShaped) {
    return { ...base, readyOn: null, blockedBy: `${l.service_type.replace(/_/g, ' ')} bills on a milestone, not a visit. Not modelled yet.` };
  }
  if (!serviceOn) {
    return { ...base, readyOn: null, blockedBy: 'No planned date. Nobody has booked this line.' };
  }

  const readyAfterVisit = addDays(serviceOn, 1);

  return { ...base, readyOn: readyAfterVisit, blockedBy: null };
}

export type Month = {
  key: string;
  client: number;
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
    const m = byMonth.get(key) ?? { key, client: 0, grant: 0, complimentaryLines: 0, rows: [] };
    if (r.ledger === 'client') m.client += r.amount;
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
