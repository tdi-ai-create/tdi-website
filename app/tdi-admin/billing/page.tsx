'use client';

import { useEffect, useState } from 'react';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { Shell as BillingShell, Banner } from '@/components/tdi-admin/billing/ui';
import { ActionDialog, ActionButton, type Field } from '@/components/tdi-admin/billing/ActionDialog';

const ACC = '#B45309';

type Line = {
  id: string; label: string; service_type: string; quantity: number;
  unit_price: string; total_amount: string; is_complimentary: boolean;
  delivery_state: string | null; billing_state: string | null; funding_hold: boolean;
  delivery_date: string | null; delivered_by: string | null;
  invoice: { id: string; invoice_number: string; status: string; amount: string; due_date: string | null } | null;
  mismatch: boolean;
};
type Contract = {
  quote_id: string; quote_number: string; client: string; signed_at: string | null;
  po_required: boolean | null; po_number: string | null;
  contact_name: string | null; contact_email: string | null;
  value: number; collected: number; outstanding: number;
  not_billed: number; on_funding: number; ready_to_bill: number;
  has_mismatch: boolean; no_delivery_record: number; items: Line[];
};
type Totals = {
  value: number; collected: number; outstanding: number; not_billed: number;
  on_funding: number; ready_to_bill: number; contracts: number; mismatches: number;
};

const money = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const money2 = (n: number | string) =>
  Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

export default function BillingPage() {
  const { teamMember } = useTDIAdmin();
  const [data, setData] = useState<{ contracts: Contract[]; totals: Totals } | null>(null);
  const [err, setErr] = useState('');
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'ready' | 'out' | 'funding' | 'settled'>('all');
  const [action, setAction] = useState<null | { line: Line; kind: string; client: string }>(null);
  const [flash, setFlash] = useState('');

  /** Every action posts here. The API refuses anything the rules do not allow. */
  async function runAction(payload: any): Promise<string | void> {
    const r = await fetch('/api/tdi-admin/billing/actions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return j.error || `That did not work (${r.status})`;
    setAction(null);
    setFlash(j.message || 'Done. Refreshing…');
    load();
  }

  function load() {
    fetch('/api/tdi-admin/billing/contracts')
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || `HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setErr(e.message));
  }
  useEffect(() => { load(); }, []);

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  if (err) return <Shell><div style={S.bad}>Could not load billing: {err}</div></Shell>;
  if (!data) return <Shell><div style={{ color: '#64748B', padding: 40 }}>Loading…</div></Shell>;

  const { totals } = data;
  const contracts = data.contracts.filter((c) => {
    if (filter === 'ready') return c.ready_to_bill > 0;
    if (filter === 'out') return c.outstanding > 0;
    if (filter === 'funding') return c.on_funding > 0;
    if (filter === 'settled') return c.value > 0 && c.collected >= c.value;
    return true;
  });

  const counts = {
    all: data.contracts.length,
    ready: data.contracts.filter((c) => c.ready_to_bill > 0).length,
    out: data.contracts.filter((c) => c.outstanding > 0).length,
    funding: data.contracts.filter((c) => c.on_funding > 0).length,
    settled: data.contracts.filter((c) => c.value > 0 && c.collected >= c.value).length,
  };

  return (
    <Shell>
      <div style={S.money}>
        <Stat label="Contracted" value={money(totals.value)} note={`${totals.contracts} contracts`} dot="#0B1120" />
        <Stat label="Collected" value={money(totals.collected)} note="payment recorded" dot="#059669" />
        <Stat label="Out" value={money(totals.outstanding)} note="invoiced, unpaid" dot="#D97706" />
        <Stat label="Ready to bill" value={money(totals.ready_to_bill)} note="delivered, unbilled" dot="#64748B" />
        <Stat label="Not billed" value={money(totals.not_billed)} note="not yet delivered" dot="#94A3B8" />
        <Stat label="On funding" value={money(totals.on_funding)} note="waiting on a grant" dot="#7C3AED" />
      </div>

      {totals.mismatches > 0 && (
        <div style={S.bar}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#DC2626', flex: '0 0 9px' }} />
          <div style={{ flex: 1, color: '#7F1D1D' }}>
            <b style={{ color: '#450A0A' }}>
              {totals.mismatches === 1 ? '1 contract is' : `${totals.mismatches} contracts are`} out of balance
            </b>
            <span style={{ display: 'block', fontSize: 12.5 }}>
              A line says it was invoiced for one amount and the invoice says another. Billing is blocked there until it is resolved.
            </span>
          </div>
        </div>
      )}

      {totals.ready_to_bill === 0 && (
        <div style={S.info}>
          <b style={{ color: '#172554' }}>Ready to bill reads zero, and that is correct.</b>
          <span style={{ display: 'block', marginTop: 2 }}>
            None of the billable work has happened yet. Once a visit is delivered, mark it and it appears here.
          </span>
        </div>
      )}

      <div style={S.card}>
        <div style={S.filters}>
          {([
            ['all', `All signed (${counts.all})`],
            ['ready', `Ready to bill (${counts.ready})`],
            ['out', `Money out (${counts.out})`],
            ['funding', `On funding (${counts.funding})`],
            ['settled', `Settled (${counts.settled})`],
          ] as const).map(([k, label]) => (
            <button key={k} onClick={() => setFilter(k)} style={filter === k ? S.chipOn : S.chip}>{label}</button>
          ))}
        </div>

        {contracts.length === 0 && <div style={{ padding: 36, textAlign: 'center', color: '#64748B' }}>Nothing matches that filter.</div>}

        {contracts.map((c) => {
          const isOpen = open.has(c.quote_id);
          return (
            <div key={c.quote_id} style={{ borderBottom: '1px solid #F1F5F9' }}>
              <button
                onClick={() => toggle(c.quote_id)}
                aria-expanded={isOpen}
                style={{ ...S.row, background: c.has_mismatch ? '#FFFCFC' : isOpen ? '#FAFBFC' : '#fff' }}
              >
                <Caret open={isOpen} />
                <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <b style={{ display: 'block', fontSize: 13.5 }}>{c.client}</b>
                  <span style={{ display: 'block', color: '#64748B', fontSize: 11.8 }}>
                    {c.quote_number}, {c.items.length} {c.items.length === 1 ? 'line' : 'lines'}
                  </span>
                </span>
                <span style={{ flex: '0 0 150px' }}>
                  {c.has_mismatch ? <Pill tone="red">Out of balance</Pill>
                    : c.on_funding > 0 ? <Pill tone="violet">On funding</Pill>
                    : c.outstanding > 0 ? <Pill tone="amber">Awaiting payment</Pill>
                    : c.collected >= c.value && c.value > 0 ? <Pill tone="green">Settled</Pill>
                    : <Pill tone="slate">Not billed</Pill>}
                </span>
                <Num label="Value" value={money(c.value)} />
                <Num label="Collected" value={money(c.collected)} muted={c.collected === 0} tone={c.collected > 0 ? '#059669' : undefined} />
                <Num label="Out" value={money(c.outstanding)} muted={c.outstanding === 0} tone={c.outstanding > 0 ? '#D97706' : undefined} />
              </button>

              {isOpen && (
                <div style={S.body}>
                  {c.has_mismatch && (
                    <div style={S.bad}>
                      <b style={{ color: '#450A0A' }}>Amounts do not agree.</b> A line below says it was invoiced for one amount and the
                      invoice it points at says another. Resolve it before billing anything further on this contract.
                    </div>
                  )}

                  <div style={S.lines}>
                    <div style={S.lhead}>
                      <span style={{ flex: 1 }}>Line item</span>
                      <span style={{ flex: '0 0 132px' }} title="Did the work happen. Captured once, when you mark the line delivered.">Delivered</span>
                      <span style={{ flex: '0 0 132px' }} title="Did we invoice for it, and did they pay. Separate from whether the work happened.">Billed</span>
                      <span style={{ flex: '0 0 104px', textAlign: 'right' }}>Amount</span>
                      <span style={{ flex: '0 0 128px' }}>Next step</span>
                    </div>
                    {c.items.map((l) => <LineRow key={l.id} l={l} onAction={(kind) => setAction({ line: l, kind, client: c.client })} />)}
                  </div>

                  <div style={S.panes}>
                    <Pane title="Position">
                      <KV k="Contract value" v={money2(c.value)} />
                      <KV k="Collected" v={money2(c.collected)} />
                      <KV k="Invoiced, unpaid" v={money2(c.outstanding)} />
                      <KV k="Delivered, unbilled" v={money2(c.ready_to_bill)} />
                      <KV k="Not yet delivered" v={money2(c.not_billed - c.ready_to_bill)} />
                      <KV k="On funding hold" v={money2(c.on_funding)} />
                    </Pane>
                    <Pane title="Billing contact">
                      <div style={{ fontWeight: 650 }}>{c.contact_name || 'Not recorded'}</div>
                      <div style={{ color: '#64748B', fontSize: 12.5 }}>{c.contact_email || 'No address on file'}</div>
                      <div style={{ marginTop: 9 }}>
                        <KV k="PO required" v={c.po_required ? 'yes' : 'no'} />
                        <KV k="PO on file" v={c.po_number || 'none'} />
                        <KV k="Signed" v={c.signed_at ? new Date(c.signed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'unknown'} />
                      </div>
                      <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 9 }}>
                        The person who signed is the billing contact until the client tells us otherwise.
                      </div>
                    </Pane>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {flash && (
        <div role="status" style={{ position: 'fixed', left: '50%', bottom: 26, transform: 'translateX(-50%)',
          background: '#0B1120', color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 13.5,
          fontWeight: 650, boxShadow: '0 10px 30px rgba(11,17,32,.3)', zIndex: 120 }}>
          {flash}
        </div>
      )}

      {action && <ActionFor a={action} onCancel={() => setAction(null)} run={runAction} />}
    </Shell>
  );
}

/**
 * Turns a line item plus an action name into the right dialog. Each one states
 * what will change before it happens, and the destructive ones require a reason.
 */
function ActionFor({ a, onCancel, run }: {
  a: { line: Line; kind: string; client: string };
  onCancel: () => void;
  run: (payload: any) => Promise<string | void>;
}) {
  const l = a.line;
  const amount = money2(l.total_amount);
  const today = new Date().toISOString().slice(0, 10);
  const net30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  if (a.kind === 'mark_delivered') {
    return (
      <ActionDialog
        title="Mark delivered"
        subtitle={`${l.label}, ${a.client}`}
        tone="green"
        confirmLabel="Mark delivered"
        fields={[
          { name: 'delivered_on', label: 'Date delivered', type: 'date', required: true, value: today,
            hint: 'The day the work actually happened, not today if they differ.' },
          { name: 'delivered_by', label: 'Delivered by', type: 'text' },
          { name: 'notes', label: 'Notes', type: 'textarea',
            hint: 'Attendance, anything that changed on the day, anything worth remembering at renewal.' },
        ]}
        effects={[
          'Records that the work happened. Nothing is billed by this.',
          l.is_complimentary
            ? 'This line is complimentary, so it stays at no charge.'
            : `${amount} becomes ready to bill.`,
        ]}
        onCancel={onCancel}
        onConfirm={(v) => run({ action: 'mark_delivered', deliverable_id: l.id, ...v })}
      />
    );
  }

  if (a.kind === 'create_invoice') {
    return (
      <ActionDialog
        title="Create invoice"
        subtitle={`${l.label}, ${a.client}, ${amount}`}
        confirmLabel="Create invoice"
        fields={[
          { name: 'due_date', label: 'Due date', type: 'date', value: net30, hint: 'Net 30 from today.' },
          { name: 'po_number', label: 'PO number', type: 'text',
            hint: 'Some districts will not process an invoice without one.' },
        ]}
        effects={[
          'Creates a draft invoice. Nothing is emailed.',
          'The line moves to invoiced. Its delivery record is untouched.',
          'Send it from the Outbox when you are ready.',
        ]}
        onCancel={onCancel}
        onConfirm={(v) => run({ action: 'create_invoice', deliverable_ids: [l.id], ...v })}
      />
    );
  }

  if (a.kind === 'record_payment') {
    return (
      <ActionDialog
        title="Record payment"
        subtitle={`${l.label}, ${a.client}`}
        tone="green"
        confirmLabel="Record payment"
        fields={[
          { name: 'amount', label: 'Amount received', type: 'text', required: true, value: String(Number(l.total_amount)) },
          { name: 'received_on', label: 'Date received', type: 'date', required: true, value: today,
            hint: 'The day the money arrived, not the day you are entering it.' },
          { name: 'method', label: 'Method', type: 'select', required: true, options: ['check', 'ach', 'card', 'wire', 'other'] },
          { name: 'reference', label: 'Reference', type: 'text', hint: 'Cheque number or ACH trace.' },
          { name: 'note', label: 'Note', type: 'textarea' },
        ]}
        effects={[
          'Records the money against this invoice.',
          'The invoice is marked paid once payments cover it in full.',
        ]}
        onCancel={onCancel}
        onConfirm={(v) => run({
          action: 'record_payment',
          applications: [{ invoice_id: l.invoice?.id, amount: Number(v.amount) }],
          amount: Number(v.amount),
          method: v.method, reference: v.reference, received_on: v.received_on, note: v.note,
        })}
      />
    );
  }

  if (a.kind === 'fix_mismatch') {
    const inv = l.invoice;
    return (
      <ActionDialog
        title="Fix mismatch"
        subtitle={`${l.label}, ${a.client}`}
        tone="danger"
        confirmLabel="Apply the fix"
        warning={inv
          ? `The line says ${amount} and invoice ${inv.invoice_number} says ${money2(inv.amount)}. One of them is wrong.`
          : 'This line and its invoice disagree.'}
        fields={[
          { name: 'resolution', label: 'Which is right', type: 'select', required: true,
            options: ['invoice_is_right', 'line_is_right'],
            hint: 'invoice_is_right changes the contract line. line_is_right changes the invoice, and only works while it is still a draft.' },
          { name: 'reason', label: 'Reason', type: 'textarea', required: true,
            hint: 'Recorded permanently on both records. Say how you confirmed which figure is correct.' },
        ]}
        effects={['Billing on this contract stays blocked until the two agree.']}
        onCancel={onCancel}
        onConfirm={(v) => run({ action: 'fix_mismatch', deliverable_id: l.id, ...v })}
      />
    );
  }

  return null;
}

function LineRow({ l, onAction }: { l: Line; onAction: (kind: string) => void }) {
  const [open, setOpen] = useState(false);
  const delivered = l.delivery_state === 'delivered';
  const free = l.is_complimentary;

  return (
    <div style={{ borderBottom: '1px solid #F1F5F9' }}>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open}
        style={{ ...S.lrow, background: l.mismatch ? '#FFFCFC' : open ? '#FAFBFC' : 'transparent' }}>
        <Caret open={open} small />
        <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
          <b style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>{l.label}</b>
          <span style={{ display: 'block', color: '#64748B', fontSize: 11.5 }}>
            {l.quantity} at {money2(l.unit_price)}
          </span>
        </span>
        <span style={{ flex: '0 0 132px' }}>
          {delivered ? <Pill tone="blue">{l.delivery_date ? new Date(l.delivery_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Delivered'}</Pill>
            : <Pill tone="none">no record</Pill>}
        </span>
        <span style={{ flex: '0 0 132px' }}>
          {l.mismatch ? <Pill tone="red">Mismatch</Pill>
            : free ? <Pill tone="none">No charge</Pill>
            : l.billing_state === 'paid' ? <Pill tone="green">Paid</Pill>
            : l.billing_state === 'invoiced' ? <Pill tone="amber">Invoiced</Pill>
            : l.funding_hold ? <Pill tone="violet">On funding</Pill>
            : <Pill tone="slate">Not billed</Pill>}
        </span>
        <span style={{ flex: '0 0 104px', textAlign: 'right', fontWeight: 650, fontVariantNumeric: 'tabular-nums' }}>
          {money2(l.total_amount)}
        </span>
        <span style={{ flex: '0 0 128px' }}>
          {l.mismatch ? <ActionButton tone="danger" onClick={() => onAction('fix_mismatch')}>Fix mismatch</ActionButton>
            : l.funding_hold ? <span style={{ color: '#94A3B8', fontSize: 12 }}>On funding</span>
            : !delivered ? <ActionButton tone="green" onClick={() => onAction('mark_delivered')}>Mark delivered</ActionButton>
            : free ? <span style={{ color: '#94A3B8', fontSize: 12 }}>No charge</span>
            : l.billing_state === 'not_billed' ? <ActionButton tone="acc" onClick={() => onAction('create_invoice')}>Create invoice</ActionButton>
            : l.billing_state === 'invoiced' ? <ActionButton tone="dark" onClick={() => onAction('record_payment')}>Record payment</ActionButton>
            : <span style={{ color: '#94A3B8', fontSize: 12 }}>Settled</span>}
        </span>
      </button>

      {open && (
        <div style={S.lbody}>
          <div style={S.panes}>
            <Pane title="Delivery">
              {delivered
                ? <>
                    <Pill tone="blue">Delivered</Pill>
                    <div style={{ marginTop: 9 }}>
                      <KV k="Date" v={l.delivery_date ? new Date(l.delivery_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'not set'} />
                      <KV k="By" v={l.delivered_by || 'not recorded'} />
                    </div>
                  </>
                : <>
                    <Pill tone="none">Never recorded</Pill>
                    <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 8 }}>
                      Nobody has confirmed this work happened. Marking it delivered is what makes it billable.
                    </div>
                  </>}
            </Pane>
            <Pane title="Billing" bad={l.mismatch}>
              {l.invoice ? (
                <>
                  <KV k="Invoice" v={l.invoice.invoice_number} />
                  <KV k="Status" v={l.invoice.status} />
                  <KV k="Invoice amount" v={money2(l.invoice.amount)} />
                  <KV k="This line" v={money2(l.total_amount)} />
                  {l.mismatch && (
                    <div style={{ fontSize: 12.5, color: '#7F1D1D', marginTop: 8 }}>
                      These two should be the same number. They are {money2(Math.abs(Number(l.invoice.amount) - Number(l.total_amount)))} apart.
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Pill tone={free ? 'none' : 'slate'}>{free ? 'No charge' : 'Not billed'}</Pill>
                  <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 8 }}>
                    {free
                      ? 'Complimentary. Never billed, but it still gets a delivery record so you can prove at renewal that you gave it away.'
                      : l.funding_hold
                      ? 'Held until the grant lands. Kept out of the not billed figure so your billable pipeline stays honest.'
                      : delivered
                      ? 'Delivered and ready to invoice.'
                      : 'Available to invoice once the line is marked delivered.'}
                  </div>
                </>
              )}
            </Pane>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- small pieces ---------- */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <BillingShell
      title="Contracts"
      blurb="Signed contracts pull straight from Sales. Open a contract to see its line items, then open a line to see the whole story behind it."
    >
      {children}
    </BillingShell>
  );
}
function Caret({ open, small }: { open: boolean; small?: boolean }) {
  const s = small ? 14 : 16;
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={open ? ACC : '#94A3B8'} strokeWidth={2}
      style={{ flex: `0 0 ${s}px`, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .16s' }} aria-hidden>
      <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Stat({ label, value, note, dot }: { label: string; value: string; note: string; dot: string }) {
  return (
    <div style={{ padding: '14px 16px', borderRight: '1px solid #F1F5F9' }}>
      <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.07em', color: '#64748B', fontWeight: 650, display: 'flex', alignItems: 'center', gap: 6 }}>
        <i style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flex: '0 0 7px' }} />{label}
      </div>
      <div style={{ fontSize: 21, fontWeight: 750, letterSpacing: '-.025em', marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 2 }}>{note}</div>
    </div>
  );
}
function Num({ label, value, muted, tone }: { label: string; value: string; muted?: boolean; tone?: string }) {
  return (
    <span style={{ flex: '0 0 106px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
      <span style={{ display: 'block', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.05em', color: '#94A3B8', marginBottom: 2 }}>{label}</span>
      <b style={{ fontWeight: 650, color: muted ? '#CBD5E1' : tone || '#0B1120' }}>{value}</b>
    </span>
  );
}
const TONES: Record<string, [string, string]> = {
  green: ['#ECFDF5', '#059669'], amber: ['#FFFBEB', '#D97706'], red: ['#FEF2F2', '#DC2626'],
  slate: ['#F1F5F9', '#64748B'], violet: ['#F5F3FF', '#7C3AED'], blue: ['#EFF6FF', '#2563EB'],
  acc: ['#FFFBEB', ACC], dark: ['#F1F5F9', '#0B1120'],
};
function Pill({ tone, children }: { tone: keyof typeof TONES | 'none'; children: React.ReactNode }) {
  if (tone === 'none') {
    return <span style={{ ...S.pill, background: 'transparent', color: '#94A3B8', border: '1px dashed #CBD5E1' }}>{children}</span>;
  }
  const [bg, fg] = TONES[tone];
  return (
    <span style={{ ...S.pill, background: bg, color: fg }}>
      <i style={{ width: 6, height: 6, borderRadius: '50%', background: fg, flex: '0 0 6px' }} />{children}
    </span>
  );
}
function Tag({ tone, children }: { tone: keyof typeof TONES; children: React.ReactNode }) {
  const [bg, fg] = TONES[tone];
  return <span style={{ ...S.pill, background: bg, color: fg, fontWeight: 650 }}>{children}</span>;
}
function Pane({ title, children, bad }: { title: string; children: React.ReactNode; bad?: boolean }) {
  return (
    <div style={{ background: bad ? '#FEF2F2' : '#fff', border: `1px solid ${bad ? '#FECACA' : '#E2E8F0'}`, borderRadius: 10, padding: '13px 15px' }}>
      <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.07em', color: bad ? '#991B1B' : '#64748B', fontWeight: 650, marginBottom: 7 }}>{title}</div>
      {children}
    </div>
  );
}
function KV({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, fontSize: 12.8, padding: '3px 0' }}>
      <span style={{ color: '#64748B' }}>{k}</span>
      <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{v}</span>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  money: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(142px,1fr))', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', marginBottom: 18 },
  bar: { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '13px 16px', marginBottom: 18, display: 'flex', gap: 13, alignItems: 'center' },
  info: { background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '13px 16px', marginBottom: 18, color: '#1E3A8A', fontSize: 13.5 },
  bad: { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 14px', color: '#7F1D1D', fontSize: 13, marginBottom: 12 },
  card: { background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' },
  filters: { display: 'flex', gap: 7, padding: '11px 14px', borderBottom: '1px solid #E2E8F0', flexWrap: 'wrap', background: '#FCFCFD' },
  chip: { border: '1px solid #CBD5E1', background: '#fff', borderRadius: 20, padding: '5px 12px', fontSize: 12.5, color: '#64748B', cursor: 'pointer' },
  chipOn: { border: '1px solid #0B1120', background: '#0B1120', color: '#fff', borderRadius: 20, padding: '5px 12px', fontSize: 12.5, fontWeight: 650, cursor: 'pointer' },
  row: { display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', width: '100%', border: 0, cursor: 'pointer', font: 'inherit', color: 'inherit' },
  body: { padding: '0 16px 18px 46px', background: '#FAFBFC', borderTop: '1px solid #F1F5F9' },
  lines: { border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden', background: '#fff', marginTop: 14 },
  lhead: { display: 'flex', gap: 11, alignItems: 'center', padding: '10px 14px 10px 39px', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.07em', color: '#64748B', fontWeight: 650, background: '#FCFCFD', borderBottom: '1px solid #E2E8F0' },
  lrow: { display: 'flex', gap: 11, alignItems: 'center', padding: '11px 14px', width: '100%', border: 0, cursor: 'pointer', font: 'inherit', color: 'inherit' },
  lbody: { padding: '2px 14px 14px 39px', background: '#FCFCFD', borderTop: '1px solid #F1F5F9' },
  panes: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12, marginTop: 12 },
  pill: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 650, padding: '3px 9px', borderRadius: 20, whiteSpace: 'nowrap' },
};
