'use client';

import { useEffect, useState } from 'react';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { Shell, MoneyStrip, Pill, Caret, Banner, KV, Pane, S, money, money2, shortDate } from '@/components/tdi-admin/billing/ui';

type Send = { id: string; kind: string; to_email: string; subject: string; status: string; sent_at: string | null; send_result: string | null };
type Invoice = {
  kind: 'invoice'; id: string; ref: string; client: string; contract: string | null;
  amount: number; status: string; date: string | null; due_date: string | null; po_number: string | null;
  days_overdue: number; paid_applied: number; outstanding: number; part_paid: boolean;
  missing_payment_record: boolean; school_year: string | null;
  voided_at: string | null; void_reason: string | null; sends: Send[];
  note_count: number; last_note_at: string | null; overdue_unchased: boolean;
};
type Note = {
  id: string; body: string; kind: string; author_email: string;
  created_at: string; updated_at: string | null; edited: boolean; mine: boolean;
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

  // A payment that lands entirely on one invoice is not a second thing that happened.
  // It is the other half of that invoice, and listing it separately made a single
  // $1,499.10 transaction read as two records at the same amount. Nest it instead.
  // A payment spanning several invoices, or carrying an unapplied remainder, stays
  // top level: it is not owned by any one invoice and hiding it would lose it.
  const invoiceByRef = new Map(data.invoices.map((i) => [i.ref, i]));
  const nested = new Map<string, Payment[]>();
  for (const p of data.payments) {
    if (p.settles.length !== 1 || Math.abs(p.unapplied) > 0.005) continue;
    const ref = p.settles[0].invoice_number;
    const parent = invoiceByRef.get(ref);
    // Never nest under a row the list is about to hide, or the payment goes with it.
    if (!parent || parent.status === 'void') continue;
    nested.set(ref, [...(nested.get(ref) ?? []), p]);
  }
  const nestedIds = new Set([...nested.values()].flat().map((p) => p.id));

  // Nesting is a courtesy of the combined list only. Every payment-facing filter stays
  // flat, so a nested payment is never unreachable and never drops out of a count.
  const flatPayments = filter === 'payments' || filter === 'attention';
  const rows: (Invoice | Payment)[] = [
    ...data.invoices,
    ...data.payments.filter((p) => flatPayments || !nestedIds.has(p.id)),
  ];
  const shown = rows.filter((r) => {
    if (filter === 'invoices') return r.kind === 'invoice' && r.status !== 'void';
    if (filter === 'payments') return r.kind === 'payment';
    if (filter === 'overdue') return r.kind === 'invoice' && r.status === 'overdue';
    if (filter === 'void') return r.kind === 'invoice' && r.status === 'void';
    if (filter === 'attention') return (r.kind === 'invoice' && (r.missing_payment_record || r.status === 'overdue')) || (r.kind === 'payment' && !r.details_verified);
    return r.kind !== 'invoice' || r.status !== 'void';
  });
  const allCount = t.invoices + data.payments.filter((p) => !nestedIds.has(p.id)).length;

  return (
    <Shell title="Money" blurb="Every invoice and every payment in one list. Open a row to see the document, what was sent, and the notes.">
      <MoneyStrip items={[
        { label: 'Collected', value: money(t.collected), note: `${t.payments} payments`, dot: '#059669' },
        { label: 'Out, not due', value: money(t.outstanding), note: 'sent invoices', dot: '#D97706' },
        { label: 'Overdue', value: money(t.overdue), note: 'past due date', dot: '#DC2626' },
        { label: 'Draft', value: money(t.draft), note: 'never sent', dot: '#64748B' },
        ...(t.prior_year_outstanding > 0
          ? [{ label: 'Prior year', value: money2(t.prior_year_outstanding), note: 'closed school year, chased on its own', dot: '#7C3AED' }]
          : []),
      ]} />

      {t.missing_payment_records > 0 && (
        <Banner tone="amber" title={`${t.missing_payment_records} invoice${t.missing_payment_records > 1 ? 's are' : ' is'} marked paid with no payment recorded`}>
          The money may have arrived, but nothing here can tie it to the bank.
        </Banner>
      )}
      {t.overdue_unchased > 0 && (
        <Banner tone="red" title={`${t.overdue_unchased} overdue invoice${t.overdue_unchased > 1 ? 's have' : ' has'} no follow-up recorded against ${t.overdue_unchased > 1 ? 'them' : 'it'}`}>
          Either nobody has chased it, or somebody has and it was never written down. Open the row and add a note.
        </Banner>
      )}
      {t.unverified_payments > 0 && (
        <Banner tone="blue" title={`${t.unverified_payments} payment${t.unverified_payments > 1 ? 's are' : ' is'} missing its method or receipt date`}>
          Recorded as received, but the detail was never captured. Add it from the bank when convenient.
        </Banner>
      )}

      <div style={S.card}>
        <div style={S.filters}>
          {[['all', `All (${allCount})`], ['invoices', `Invoices (${t.invoices})`], ['payments', `Payments (${t.payments})`],
            ['overdue', `Overdue (${data.invoices.filter((i) => i.status === 'overdue').length})`],
            ['attention', 'Needs attention'], ['void', `Voided (${t.voided})`]].map(([k, label]) => (
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
                style={{ ...S.row, background: flagged ? '#FFFCFC' : isOpen ? '#FAFBFC' : '#fff', opacity: r.kind === 'invoice' && r.status === 'void' ? 0.6 : 1 }}>
                <Caret open={isOpen} />
                <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <b style={{ display: 'block', fontSize: 13.5, textDecoration: r.kind === 'invoice' && r.status === 'void' ? 'line-through' : 'none' }}>{r.ref}</b>
                  <span style={{ display: 'block', color: '#64748B', fontSize: 11.8 }}>
                    {r.client}{r.kind === 'invoice' && r.school_year ? `, ${r.school_year}` : ''}{r.kind === 'invoice' && r.contract ? `, ${r.contract}` : ''}{r.kind === 'payment' ? (r.settles.length === 1 ? ` · settles ${r.settles[0].invoice_number}` : r.settles.length === 0 ? ' · settles nothing yet' : ` · settles ${r.settles.length} invoices`) : ''}
                    {r.kind === 'invoice' && r.note_count > 0 ? `, ${r.note_count} note${r.note_count === 1 ? '' : 's'}` : ''}
                  </span>
                </span>
                <span style={{ flex: '0 0 150px' }}>
                  {r.kind === 'payment' ? <Pill tone="green">Received</Pill>
                    : r.status === 'paid' ? <Pill tone="green">Paid</Pill>
                    : r.status === 'overdue' ? <Pill tone="red">{r.days_overdue} days late</Pill>
                    : r.status === 'sent' ? <Pill tone="amber">Sent</Pill>
                    : r.status === 'void' ? <Pill tone="slate">Voided</Pill>
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

              {r.kind === 'invoice' && !flatPayments && (nested.get(r.ref) ?? []).map((p) => (
                <NestedPayment key={p.id} p={p} open={open.has(p.id)} onToggle={() => toggle(p.id)} />
              ))}
            </div>
          );
        })}
      </div>
    </Shell>
  );
}

/** The money half of an invoice, shown as a child of the bill it settles. */
function NestedPayment({ p, open, onToggle }: { p: Payment; open: boolean; onToggle: () => void }) {
  return (
    <>
      <button onClick={onToggle} aria-expanded={open} aria-label={`Payment of ${money2(p.amount)} settling ${p.settles[0]?.invoice_number ?? 'this invoice'}`}
        style={{ ...S.row, padding: '9px 16px 9px 46px', background: open ? '#FAFBFC' : '#fff', borderTop: '1px solid #F8FAFC' }}>
        <span aria-hidden style={{ color: '#CBD5E1', fontSize: 12.5, marginLeft: -12, marginRight: 2 }}>&#9492;</span>
        <span style={{ flex: 1, minWidth: 0, textAlign: 'left', fontSize: 12.5, color: '#475569' }}>
          {p.ref === 'Payment' ? 'Payment' : p.ref} {money2(p.amount)}
          <span style={{ color: '#94A3B8' }}>
            {' \u00b7 '}{p.method ? p.method : 'method not captured'}
            {p.received_on ? `, ${shortDate(p.received_on)}` : ', date unknown'}
          </span>
        </span>
        {!p.details_verified && <Pill tone="amber">detail missing</Pill>}
      </button>
      {open && <div style={S.body}><PaymentDetail p={p} /></div>}
    </>
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
      {i.status === 'void' && <Banner tone="amber" title="Voided">{i.void_reason}</Banner>}

      <InvoiceDocumentBar i={i} />

      <div style={S.panes}>
        <Pane title="Invoice">
          <KV k="Amount" v={money2(i.amount)} />
          <KV k="Status" v={i.status} />
          <KV k="Invoice date" v={shortDate(i.date) ?? 'not set'} />
          <KV k="Due" v={shortDate(i.due_date) ?? 'not set'} tone={i.due_date ? undefined : '#DC2626'} />
          <KV k="PO number" v={i.po_number || 'none'} />
          <KV k="School year" v={i.school_year || 'not recorded'} />
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

      <InvoiceNotes invoiceId={i.id} />
    </>
  );
}

const KINDS: [string, string][] = [
  ['note', 'Note'],
  ['call', 'Call'],
  ['email', 'Email'],
  ['meeting', 'Meeting'],
  ['promise', 'Promise to pay'],
];
const KIND_LABEL = Object.fromEntries(KINDS);

const stamp = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/**
 * What the team has actually done about this invoice.
 *
 * Chasing happens on the phone and in email, and none of it could be written
 * against the invoice it belonged to. The only record of a fortnight's work was
 * in somebody's memory or sent mail, which is how Allenwood went three weeks
 * before anyone noticed the invoice had bounced.
 *
 * Internal only. Nothing here reaches the PDF or the client.
 */
function InvoiceNotes({ invoiceId }: { invoiceId: string }) {
  const { teamMember } = useTDIAdmin();
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [err, setErr] = useState('');
  const [body, setBody] = useState('');
  const [kind, setKind] = useState('note');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const url = `/api/tdi-admin/billing/invoice/${invoiceId}/notes`;
  const headers = { 'Content-Type': 'application/json', 'x-user-email': teamMember?.email ?? '' };

  const load = () =>
    fetch(url, { headers })
      .then(async (r) => { if (!r.ok) throw new Error((await r.json()).error); return r.json(); })
      .then((d) => setNotes(d.notes))
      .catch((e) => setErr(e.message));

  // Reloads when the row changes. `load` is rebuilt every render and listing it
  // would refetch on each keystroke in the note box.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [invoiceId]);

  // Every write reloads from the server rather than patching local state, so
  // what is on screen is what was actually stored. A note that appears to save
  // but did not is worse than no notes feature at all.
  async function send(method: string, payload: object) {
    setBusy(true); setErr('');
    try {
      const r = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error((await r.json()).error);
      await load();
      return true;
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.07em', color: '#64748B', fontWeight: 650, marginBottom: 8 }}>
        Follow-up notes{notes?.length ? ` (${notes.length})` : ''}
        <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, color: '#94A3B8' }}> · internal, never sent to the client</span>
      </div>

      {err && <Banner tone="red" title="Could not save that">{err}</Banner>}

      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: 11, marginBottom: 10 }}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Called AP, cheque goes out in the next board run…"
          rows={2}
          style={{ width: '100%', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 10px', font: 'inherit', fontSize: 13, resize: 'vertical' }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={kind} onChange={(e) => setKind(e.target.value)}
            style={{ border: '1px solid #CBD5E1', borderRadius: 8, padding: '6px 10px', fontSize: 12.5 }}>
            {KINDS.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </select>
          <button
            disabled={busy || !body.trim()}
            onClick={async () => { if (await send('POST', { body, kind })) { setBody(''); setKind('note'); } }}
            style={{ ...S.btn, opacity: busy || !body.trim() ? 0.5 : 1 }}
          >
            {busy ? 'Saving…' : 'Add note'}
          </button>
        </div>
      </div>

      {notes === null && <div style={{ fontSize: 12.8, color: '#64748B' }}>Loading…</div>}
      {notes?.length === 0 && (
        <div style={{ fontSize: 12.8, color: '#64748B' }}>
          Nothing recorded yet. If someone has chased this, it is not written down anywhere.
        </div>
      )}

      {(notes ?? []).map((n) => (
        <div key={n.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '11px 13px', marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 5 }}>
            <Pill tone={n.kind === 'promise' ? 'amber' : 'slate'}>{KIND_LABEL[n.kind] ?? n.kind}</Pill>
            <span style={{ fontSize: 12.3, color: '#64748B' }}>
              {n.author_email.split('@')[0]}, {stamp(n.created_at)}{n.edited ? ', edited' : ''}
            </span>
            {n.mine && editing !== n.id && (
              <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                <button onClick={() => { setEditing(n.id); setDraft(n.body); }}
                  style={{ ...S.btnGhost, padding: '3px 9px', fontSize: 11.5 }}>Edit</button>
                <button disabled={busy} onClick={() => send('DELETE', { note_id: n.id })}
                  style={{ ...S.btnGhost, padding: '3px 9px', fontSize: 11.5, color: '#B91C1C' }}>Retract</button>
              </span>
            )}
          </div>

          {editing === n.id ? (
            <>
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3}
                style={{ width: '100%', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 10px', font: 'inherit', fontSize: 13, resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button disabled={busy || !draft.trim()}
                  onClick={async () => { if (await send('PATCH', { note_id: n.id, body: draft })) setEditing(null); }}
                  style={{ ...S.btn, padding: '5px 11px', fontSize: 12 }}>Save</button>
                <button onClick={() => setEditing(null)} style={{ ...S.btnGhost, padding: '5px 11px', fontSize: 12 }}>Cancel</button>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: '#0B1120', whiteSpace: 'pre-wrap' }}>{n.body}</div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * The invoice itself, as a document you can open.
 *
 * This is the thing the page promised in its own blurb and did not have. An
 * invoice was a row and some line items, never a file, so when a client asked
 * for a copy the only way to answer was to search somebody's sent mail.
 *
 * Both links point at the same renderer, so what you read on screen is byte for
 * byte what downloads and what a client would be sent.
 */
function InvoiceDocumentBar({ i }: { i: Invoice }) {
  const href = `/api/tdi-admin/billing/invoice/${i.id}/pdf`;
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10,
        padding: '11px 13px', marginTop: 12,
      }}
    >
      <span style={{ flex: 1, minWidth: 180 }}>
        <b style={{ display: 'block', fontSize: 13 }}>Invoice {i.ref}</b>
        <span style={{ display: 'block', fontSize: 12.3, color: '#64748B' }}>
          {i.status === 'draft'
            ? 'Not sent. This is what the client would receive.'
            : `Rebuilt from the record, ${money2(i.amount)}${i.part_paid ? `, ${money2(i.outstanding)} still owed` : ''}.`}
        </span>
      </span>
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ ...S.btn, textDecoration: 'none' }}>
        View PDF
      </a>
      <a href={`${href}?download=1`} style={{ ...S.btnGhost, textDecoration: 'none' }}>
        Download PDF
      </a>
    </div>
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
