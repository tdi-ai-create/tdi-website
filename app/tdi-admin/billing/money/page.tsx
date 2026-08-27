'use client';

import { useEffect, useState } from 'react';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { Shell, MoneyStrip, Pill, Caret, Banner, KV, Pane, S, money, money2, shortDate } from '@/components/tdi-admin/billing/ui';

type Send = { id: string; kind: string; to_email: string; subject: string; status: string; sent_at: string | null; send_result: string | null };
type Invoice = {
  kind: 'invoice'; id: string; ref: string; client: string; contract: string | null;
  amount: number; status: string; date: string | null; due_date: string | null; po_number: string | null;
  days_overdue: number; paid_applied: number; outstanding: number; part_paid: boolean;
  missing_payment_record: boolean;
  voided_at: string | null; void_reason: string | null; sends: Send[];
};
type Payment = {
  kind: 'payment'; id: string; ref: string; client: string; amount: number;
  method: string | null; received_on: string | null; details_verified: boolean;
  note: string | null; settles: { invoice_number: string; amount: number }[]; unapplied: number;
};

export default function MoneyPage() {
  const { teamMember } = useTDIAdmin();
  const [data, setData] = useState<{ invoices: Invoice[]; payments: Payment[]; totals: any } | null>(null);
  const [err, setErr] = useState('');
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!teamMember?.email) return;
    fetch('/api/tdi-admin/billing/money', { headers: { 'x-user-email': teamMember.email } })
      .then(async (r) => { if (!r.ok) throw new Error((await r.json()).error); return r.json(); })
      .then(setData).catch((e) => setErr(e.message));
  }, [teamMember?.email]);

  const toggle = (id: string) => setOpen((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  if (err) return <Shell title="Money" blurb=""><Banner tone="red" title="Could not load">{err}</Banner></Shell>;
  if (!data) return <Shell title="Money" blurb=""><div style={{ color: '#64748B', padding: 40 }}>Loading…</div></Shell>;

  const t = data.totals;
  const rows: (Invoice | Payment)[] = [...data.invoices, ...data.payments];
  const shown = rows.filter((r) => {
    if (filter === 'invoices') return r.kind === 'invoice' && r.status !== 'voided';
    if (filter === 'payments') return r.kind === 'payment';
    if (filter === 'overdue') return r.kind === 'invoice' && r.status === 'overdue';
    if (filter === 'voided') return r.kind === 'invoice' && r.status === 'voided';
    if (filter === 'attention') return (r.kind === 'invoice' && (r.missing_payment_record || r.status === 'overdue')) || (r.kind === 'payment' && !r.details_verified);
    return r.kind !== 'invoice' || r.status !== 'voided';
  });

  return (
    <Shell title="Money" blurb="Every invoice and every payment in one list. Open a row to see the document, what was sent, and the notes.">
      <MoneyStrip items={[
        { label: 'Collected', value: money(t.collected), note: `${t.payments} payments`, dot: '#059669' },
        { label: 'Out, not due', value: money(t.outstanding), note: 'sent invoices', dot: '#D97706' },
        { label: 'Overdue', value: money(t.overdue), note: 'past due date', dot: '#DC2626' },
        { label: 'Draft', value: money(t.draft), note: 'never sent', dot: '#64748B' },
      ]} />

      {t.missing_payment_records > 0 && (
        <Banner tone="amber" title={`${t.missing_payment_records} invoice${t.missing_payment_records > 1 ? 's are' : ' is'} marked paid with no payment recorded`}>
          The money may have arrived, but nothing here can tie it to the bank.
        </Banner>
      )}
      {t.unverified_payments > 0 && (
        <Banner tone="blue" title={`${t.unverified_payments} payment${t.unverified_payments > 1 ? 's are' : ' is'} missing its method or receipt date`}>
          Recorded as received, but the detail was never captured. Add it from the bank when convenient.
        </Banner>
      )}

      <div style={S.card}>
        <div style={S.filters}>
          {[['all', `All (${t.invoices + t.payments})`], ['invoices', `Invoices (${t.invoices})`], ['payments', `Payments (${t.payments})`],
            ['overdue', `Overdue (${data.invoices.filter((i) => i.status === 'overdue').length})`],
            ['attention', 'Needs attention'], ['voided', `Voided (${t.voided})`]].map(([k, label]) => (
            <button key={k} onClick={() => setFilter(k)} style={filter === k ? S.chipOn : S.chip}>{label}</button>
          ))}
        </div>

        {shown.length === 0 && <div style={{ padding: 36, textAlign: 'center', color: '#64748B' }}>Nothing matches that filter.</div>}

        {shown.map((r) => {
          const isOpen = open.has(r.id);
          const flagged = r.kind === 'invoice' ? (r.status === 'overdue' || r.missing_payment_record) : !r.details_verified;
          return (
            <div key={r.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
              <button onClick={() => toggle(r.id)} aria-expanded={isOpen}
                style={{ ...S.row, background: flagged ? '#FFFCFC' : isOpen ? '#FAFBFC' : '#fff', opacity: r.kind === 'invoice' && r.status === 'voided' ? 0.6 : 1 }}>
                <Caret open={isOpen} />
                <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <b style={{ display: 'block', fontSize: 13.5, textDecoration: r.kind === 'invoice' && r.status === 'voided' ? 'line-through' : 'none' }}>{r.ref}</b>
                  <span style={{ display: 'block', color: '#64748B', fontSize: 11.8 }}>
                    {r.client}{r.kind === 'invoice' && r.contract ? `, ${r.contract}` : ''}{r.kind === 'payment' ? `, ${r.settles.length} invoice${r.settles.length === 1 ? '' : 's'}` : ''}
                  </span>
                </span>
                <span style={{ flex: '0 0 150px' }}>
                  {r.kind === 'payment' ? <Pill tone="green">Received</Pill>
                    : r.status === 'paid' ? <Pill tone="green">Paid</Pill>
                    : r.status === 'overdue' ? <Pill tone="red">{r.days_overdue} days late</Pill>
                    : r.status === 'sent' ? <Pill tone="amber">Sent</Pill>
                    : r.status === 'voided' ? <Pill tone="slate">Voided</Pill>
                    : <Pill tone="slate">Draft</Pill>}
                </span>
                <span style={{ flex: '0 0 118px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  <span style={{ display: 'block', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.05em', color: '#94A3B8' }}>Amount</span>
                  <b style={{ color: r.kind === 'payment' ? '#059669' : '#0B1120' }}>
                    {r.kind === 'invoice' && r.part_paid ? money2(r.outstanding) : money2(r.amount)}
                  </b>
                  {r.kind === 'invoice' && r.part_paid && (
                    <span style={{ display: 'block', fontSize: 10.5, color: '#64748B', fontWeight: 400 }}>
                      of {money2(r.amount)}
                    </span>
                  )}
                </span>
                <span style={{ flex: '0 0 106px', textAlign: 'right', fontSize: 12.5, color: '#64748B' }}>
                  {r.kind === 'invoice' ? (r.due_date ? `due ${shortDate(r.due_date)}` : 'no due date') : (r.received_on ? shortDate(r.received_on) : 'date unknown')}
                </span>
              </button>

              {isOpen && (
                <div style={S.body}>
                  {r.kind === 'invoice' ? <InvoiceDetail i={r} /> : <PaymentDetail p={r} />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Shell>
  );
}

function InvoiceDetail({ i }: { i: Invoice }) {
  return (
    <>
      {i.missing_payment_record && (
        <Banner tone="amber" title="Marked paid, but nothing was ever recorded">
          No method, no reference, no date, no evidence. Either the money arrived and nobody logged it, or it did not arrive.
        </Banner>
      )}
      {i.status === 'draft' && (
        <Banner tone="blue" title="Never sent">
          The client has no idea this exists. A draft can be deleted outright; once sent it can only be voided.
        </Banner>
      )}
      {i.status === 'voided' && <Banner tone="amber" title="Voided">{i.void_reason}</Banner>}

      <div style={S.panes}>
        <Pane title="Invoice">
          <KV k="Amount" v={money2(i.amount)} />
          <KV k="Status" v={i.status} />
          <KV k="Invoice date" v={shortDate(i.date) ?? 'not set'} />
          <KV k="Due" v={shortDate(i.due_date) ?? 'not set'} tone={i.due_date ? undefined : '#DC2626'} />
          <KV k="PO number" v={i.po_number || 'none'} />
          <KV k="Contract" v={i.contract || 'not linked'} />
        </Pane>
        <Pane title="Payments applied" bad={i.missing_payment_record}>
          {i.paid_applied > 0
            ? <><KV k="Invoice total" v={money2(i.amount)} /><KV k="Applied" v={money2(i.paid_applied)} /><KV k="Still owed" v={money2(i.outstanding)} tone={i.outstanding > 0 ? '#DC2626' : '#059669'} /></>
            : <div style={{ fontSize: 12.8, color: '#64748B' }}>Nothing recorded against this invoice.</div>}
        </Pane>
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.07em', color: '#64748B', fontWeight: 650, marginBottom: 8 }}>What has been sent</div>
        {i.sends.length === 0
          ? <div style={{ fontSize: 12.8, color: '#64748B' }}>Nothing has been sent from the portal for this invoice.</div>
          : i.sends.map((s) => (
              <div key={s.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '11px 13px', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <b style={{ fontSize: 13 }}>{s.subject}</b>
                  <Pill tone={s.status === 'sent' ? 'green' : s.status === 'failed' ? 'red' : 'slate'}>{s.status}</Pill>
                </div>
                <div style={{ fontSize: 12.3, color: '#64748B', marginTop: 3 }}>
                  to {s.to_email}{s.sent_at ? `, ${new Date(s.sent_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : ', not sent yet'}
                </div>
              </div>
            ))}
      </div>
    </>
  );
}

function PaymentDetail({ p }: { p: Payment }) {
  return (
    <>
      {p.settles.length > 1 && (
        <Banner tone="green" title="One payment, several invoices">
          Recorded once and applied {p.settles.length} times, so the collected figure cannot count it twice.
        </Banner>
      )}
      {!p.details_verified && (
        <Banner tone="amber" title="Details were never captured">
          Recorded as received without a method, reference or true receipt date. The date shown, if any, may be when it was typed in rather than when the money arrived.
        </Banner>
      )}
      <div style={S.panes}>
        <Pane title="Payment">
          <KV k="Amount" v={money2(p.amount)} />
          <KV k="Method" v={p.method || 'not captured'} />
          <KV k="Reference" v={p.ref.replace('Cheque ', '') || 'none'} />
          <KV k="Received" v={shortDate(p.received_on) ?? 'unknown'} />
          <KV k="Unapplied" v={money2(p.unapplied)} tone={Math.abs(p.unapplied) > 0.005 ? '#DC2626' : undefined} />
        </Pane>
        <Pane title="Settles">
          {p.settles.map((s) => <KV key={s.invoice_number} k={s.invoice_number} v={money2(s.amount)} />)}
        </Pane>
      </div>
      {p.note && <div style={{ marginTop: 12, fontSize: 12.8, color: '#64748B', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '11px 13px' }}>{p.note}</div>}
    </>
  );
}
