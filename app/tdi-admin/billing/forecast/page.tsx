'use client';

import { useEffect, useState } from 'react';
import { Shell, Banner, MoneyStrip, Pill } from '@/components/tdi-admin/billing/ui';
import type { ForecastRow, Month } from '@/lib/billing/forecast';

type Payload = {
  months: Month[];
  queue: ForecastRow[];
  totals: {
    client: number; grant: number; complimentaryLines: number;
    datedClientConfirmed: number; datedClientHeld: number; datedGrant: number;
    lines: number; undatedLines: number;
  };
};

const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const money2 = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

// A date-only string parses as UTC midnight through new Date(), which renders a
// day early anywhere west of Greenwich. A ready date showing the wrong day is a
// forecast nobody will trust.
const parts = (iso: string) => iso.split('-').map(Number);
const dayMonth = (iso: string) => {
  const [y, m, d] = parts(iso);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};
const monthName = (key: string) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
};

export default function ForecastPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetch('/api/tdi-admin/billing/forecast')
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || `HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setErr(e.message));
  }, []);

  if (err) return <Frame><Banner tone="red" title="Could not load the forecast">{err}</Banner></Frame>;
  if (!data) return <Frame><div style={{ color: '#64748B', padding: 40 }}>Loading…</div></Frame>;

  const { months, queue, totals } = data;

  return (
    <Frame>
      <div style={S.topbar}>
        <p style={S.topnote}>
          Every date here is the day a line becomes <b>ready</b> to invoice. Nothing sends itself.
        </p>
        <a href="/api/tdi-admin/billing/export?view=forecast" style={S.dl} download>
          Export as a spreadsheet
        </a>
      </div>

      <MoneyStrip items={[
        { label: 'Client money', value: money(totals.client), note: 'we deliver, then invoice', dot: '#0B1120' },
        { label: 'Confirmed', value: money(totals.datedClientConfirmed), note: 'dated and agreed with the client', dot: '#059669' },
        { label: 'Held', value: money(totals.datedClientHeld), note: 'dated, not agreed yet', dot: '#94A3B8' },
        { label: 'Grant money', value: money(totals.grant), note: 'waiting on a funder to decide', dot: '#7C3AED' },
        { label: 'Awarded', value: money(totals.datedGrant), note: 'won, so it can be scheduled', dot: '#7C3AED' },
        { label: 'Undated lines', value: String(totals.undatedLines), note: `of ${totals.lines} ahead of us`, dot: '#D97706' },
      ]} />

      {/* Two numbers, never one. Adding them tells the CFO that contingent money
          is collectable. */}
      <div style={S.note}>
        <b style={{ color: '#172554' }}>Confirmed, held and grant are never added together.</b>
        <span style={{ display: 'block', marginTop: 2 }}>
          Confirmed means the client has agreed the date. Held means we are keeping a date they have not agreed,
          so it is not money yet. Grant money stays off the calendar until the award lands, because the work cannot
          be scheduled before then. Complimentary work appears as days, never as money.
        </span>
      </div>

      {months.length === 0 ? (
        <div style={S.card}>
          <div style={{ padding: 36, textAlign: 'center', color: '#64748B' }}>
            Nothing can be placed in a month yet. Set a planned date on a line in Contracts, and an expected
            decision date on a grant pursuit, and it appears here.
          </div>
        </div>
      ) : (
        months.map((m) => (
          <div key={m.key} style={S.card}>
            <div style={S.mhead}>
              <h2 style={S.h2}>{monthName(m.key)}</h2>
              <div style={S.mtotals}>
                <span style={S.mt}><i style={{ ...S.dot, background: '#0B1120' }} />Confirmed {money(m.client)}</span>
                {m.clientHeld > 0 && (
                  <span style={{ ...S.mt, color: '#94A3B8' }}>
                    <i style={{ ...S.dot, background: '#CBD5E1' }} />Held {money(m.clientHeld)}
                  </span>
                )}
                <span style={S.mt}><i style={{ ...S.dot, background: '#7C3AED' }} />Grant {money(m.grant)}</span>
                {m.complimentaryLines > 0 && (
                  <span style={{ ...S.mt, color: '#94A3B8' }}>
                    {m.complimentaryLines === 1 ? '1 complimentary day' : `${m.complimentaryLines} complimentary days`}
                  </span>
                )}
              </div>
            </div>
            {m.rows.map((r) => (
              <div key={r.id} style={S.row}>
                <span style={{ flex: '0 0 74px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                  {dayMonth(r.readyOn!)}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <b style={S.rlabel}>{r.label}</b>
                  <span style={S.rclient}>
                    {r.client}
                    {r.serviceOn && <> &middot; service {dayMonth(r.serviceOn)}{r.held ? ', held' : ''}</>}
                  </span>
                </span>
                <span style={{ flex: '0 0 150px' }}><LedgerPill ledger={r.ledger} /></span>
                <span style={{ flex: '0 0 110px', textAlign: 'right', fontWeight: 650, fontVariantNumeric: 'tabular-nums' }}>
                  {r.ledger === 'complimentary' ? <span style={{ color: '#94A3B8' }}>No charge</span> : money2(r.amount)}
                </span>
              </div>
            ))}
          </div>
        ))
      )}

      {queue.length > 0 && (
        <div style={S.card}>
          <div style={S.head}>
            <h2 style={S.h2}>Not on the calendar yet</h2>
            <p style={S.blurb}>
              {queue.length === totals.lines
                ? 'Every line ahead of us is in here. Until these have dates there is nothing to put in a month.'
                : 'These cannot be placed in a month yet, and that is the finding rather than an empty state.'}
            </p>
          </div>
          {queue.map((r) => (
            <div key={r.id} style={S.qrow}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <b style={S.rlabel}>{r.label}</b>
                <span style={S.rclient}>
                  {r.client}
                  {r.serviceOn && <> &middot; service {dayMonth(r.serviceOn)}{r.held ? ', held' : ''}</>}
                </span>
              </span>
              <span style={{ flex: '0 0 150px' }}><LedgerPill ledger={r.ledger} /></span>
              <span style={{ flex: '0 0 110px', textAlign: 'right', fontWeight: 650, fontVariantNumeric: 'tabular-nums' }}>
                {r.ledger === 'complimentary' ? <span style={{ color: '#94A3B8' }}>No charge</span> : money2(r.amount)}
              </span>
              <span style={S.why}>{r.blockedBy}</span>
            </div>
          ))}
        </div>
      )}

    </Frame>
  );
}

function LedgerPill({ ledger }: { ledger: string }) {
  if (ledger === 'grant') return <Pill tone="violet">Grant funded</Pill>;
  if (ledger === 'complimentary') return <Pill tone="none">Complimentary</Pill>;
  return <Pill tone="slate">Client funded</Pill>;
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <Shell
      title="Ready to invoice"
      blurb="When contracted work becomes billable, ahead of it happening. Client money and grant money are counted separately, because one is gated on us and the other on a funder."
    >
      {children}
    </Shell>
  );
}

const S: Record<string, React.CSSProperties> = {
  card: { background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', marginBottom: 18 },
  head: { padding: '16px 18px 12px', borderBottom: '1px solid #F1F5F9' },
  mhead: {
    padding: '14px 18px', borderBottom: '1px solid #F1F5F9', display: 'flex',
    alignItems: 'baseline', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
  },
  h2: { fontSize: 16, margin: 0, fontWeight: 700, letterSpacing: '-.01em' },
  blurb: { margin: '4px 0 0', color: '#64748B', fontSize: 13, maxWidth: 780 },
  mtotals: { display: 'flex', gap: 18, fontSize: 13, fontWeight: 650, flexWrap: 'wrap' },
  mt: { display: 'inline-flex', alignItems: 'center', gap: 6, fontVariantNumeric: 'tabular-nums' },
  dot: { width: 7, height: 7, borderRadius: '50%', flex: '0 0 7px' },
  row: {
    display: 'flex', alignItems: 'center', gap: 14, padding: '11px 18px',
    borderBottom: '1px solid #F8FAFC', fontSize: 13.5, flexWrap: 'wrap',
  },
  qrow: {
    display: 'flex', alignItems: 'center', gap: 14, padding: '11px 18px',
    borderBottom: '1px solid #F8FAFC', fontSize: 13.5, flexWrap: 'wrap',
  },
  rlabel: { display: 'block', fontSize: 13.5, fontWeight: 600 },
  rclient: { display: 'block', color: '#64748B', fontSize: 11.5 },
  why: { flexBasis: '100%', color: '#94A3B8', fontSize: 12 },
  note: {
    background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12,
    padding: '13px 16px', marginBottom: 18, color: '#1E3A8A', fontSize: 13,
  },
  topbar: { display: 'flex', gap: 18, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 14 },
  topnote: { color: '#64748B', fontSize: 12.5, maxWidth: 620, margin: 0 },
  dl: {
    background: '#0B1120', color: '#fff', border: 0, borderRadius: 7,
    padding: '8px 14px', fontSize: 12.5, fontWeight: 650, textDecoration: 'none', whiteSpace: 'nowrap',
  },
};
