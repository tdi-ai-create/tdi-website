'use client';

import { useEffect, useState } from 'react';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { Shell, MoneyStrip, Pill, Caret, Banner, S, shortDate } from '@/components/tdi-admin/billing/ui';
import { ActionDialog } from '@/components/tdi-admin/billing/ActionDialog';

type Doc = { id: string; doc_type: string; title: string; expires_on: string | null; note: string | null; created_at: string; attach_by_default: boolean };
type Client = { client: string; documents: Doc[]; required: string[]; missing: string[] };

const LABEL: Record<string, string> = {
  purchase_order: 'Purchase order', w9: 'W-9', coi: 'Certificate of insurance',
  signed_contract: 'Signed contract', vendor_registration: 'Vendor registration',
  delivery_evidence: 'Delivery evidence', check_photo: 'Cheque photo',
  roster: 'Roster', invoice_pdf: 'Invoice PDF', other: 'Other',
};

export default function DocumentsPage() {
  const { teamMember } = useTDIAdmin();
  const [data, setData] = useState<{ company: Doc[]; clients: Client[]; totals: any } | null>(null);
  const [err, setErr] = useState('');
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState<null | { client?: string }>(null);
  const [flash, setFlash] = useState('');

  const load = () => {
    fetch('/api/tdi-admin/billing/documents')
      .then(async (r) => { if (!r.ok) throw new Error((await r.json()).error); return r.json(); })
      .then(setData).catch((e) => setErr(e.message));
  };
  useEffect(load, []);

  /**
   * Records that a document exists and where it lives. The file itself is not uploaded
   * here: districts send these by email and portal, and pretending otherwise would mean
   * a second place for them to go missing. What matters is that the system knows we
   * have it, so a send is not blocked on a document sitting in someone's inbox.
   */
  async function addDoc(v: Record<string, string>): Promise<string | void> {
    const r = await fetch('/api/tdi-admin/billing/documents', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        doc_type: v.doc_type, title: v.title, storage_path: v.location || null,
        expires_on: v.expires_on || null, note: v.note || null,
        is_company_wide: !v.client, district_id: null,
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return j.error || 'That did not save';
    setAdding(null); setFlash('Recorded.'); load();
    setTimeout(() => setFlash(''), 3000);
  }

  const toggle = (k: string) => setOpen((p) => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });

  if (err) return <Shell title="Documents" blurb=""><Banner tone="red" title="Could not load">{err}</Banner></Shell>;
  if (!data) return <Shell title="Documents" blurb=""><div style={{ color: '#64748B', padding: 40 }}>Loading…</div></Shell>;

  const t = data.totals;
  const missing = data.clients.filter((c) => c.missing.length);

  return (
    <Shell title="Documents" blurb="Everything an accounts payable office asks for, and everything that proves the work happened. Most of it files itself.">
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button onClick={() => setAdding({})} style={{ ...S.btn, background: '#B45309' }}>Record a document</button>
      </div>
      <MoneyStrip items={[
        { label: 'On file', value: String(t.on_file), note: 'documents', dot: '#0B1120' },
        { label: 'Missing, required', value: String(t.missing_required), note: 'a district asked for these', dot: '#DC2626' },
        { label: 'Expiring', value: String(t.expiring), note: 'within 90 days', dot: '#D97706' },
        { label: 'Delivery evidence', value: String(t.delivery_evidence), note: 'attached to a delivered line', dot: '#64748B' },
      ]} />

      {missing.length > 0 && (
        <Banner tone="red" title={`${t.missing_required} required document${t.missing_required > 1 ? 's are' : ' is'} missing`}>
          {missing.map((c) => `${c.client} needs ${c.missing.map((m) => LABEL[m] ?? m).join(' and ')}`).join('. ')}. Districts that have told us what they need should never be chased for money instead.
        </Banner>
      )}

      <div style={{ ...S.card, marginBottom: 16 }}>
        <div style={{ ...S.filters, justifyContent: 'space-between' }}>
          <b style={{ fontSize: 14 }}>TDI company documents</b>
          <span style={{ fontSize: 12.5, color: '#64748B' }}>shared across every client</span>
        </div>
        <div style={{ padding: '14px 16px', display: 'grid', gap: 8 }}>
          {data.company.map((d) => (
            <div key={d.id} style={{ display: 'flex', gap: 12, alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: 9, padding: '10px 13px' }}>
              <span style={{ flex: 1 }}>
                <b style={{ display: 'block', fontSize: 13.3 }}>{d.title}</b>
                <span style={{ color: '#64748B', fontSize: 11.8 }}>
                  {LABEL[d.doc_type] ?? d.doc_type}
                  {d.attach_by_default ? ', attached to every invoice' : ''}
                  {d.expires_on ? `, expires ${shortDate(d.expires_on)}` : ''}
                </span>
              </span>
              {d.expires_on ? <Pill tone="amber">Expires {shortDate(d.expires_on)}</Pill> : <Pill tone="green">Current</Pill>}
            </div>
          ))}
        </div>
      </div>

      <div style={S.card}>
        <div style={S.filters}><b style={{ fontSize: 14 }}>By client</b></div>
        {data.clients.length === 0 && <div style={{ padding: 36, textAlign: 'center', color: '#64748B' }}>No client documents on file yet.</div>}
        {data.clients.map((c) => {
          const isOpen = open.has(c.client);
          return (
            <div key={c.client} style={{ borderBottom: '1px solid #F1F5F9' }}>
              <button onClick={() => toggle(c.client)} aria-expanded={isOpen}
                style={{ ...S.row, background: c.missing.length ? '#FFFCFC' : isOpen ? '#FAFBFC' : '#fff' }}>
                <Caret open={isOpen} />
                <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <b style={{ display: 'block', fontSize: 13.5 }}>{c.client}</b>
                  <span style={{ display: 'block', color: '#64748B', fontSize: 11.8 }}>
                    {c.documents.length} on file{c.required.length ? `, ${c.required.length} required` : ''}
                  </span>
                </span>
                <span style={{ flex: '0 0 170px' }}>
                  {c.missing.length
                    ? <Pill tone="red">{c.missing.map((m) => LABEL[m] ?? m).join(', ')} missing</Pill>
                    : <Pill tone="green">Nothing missing</Pill>}
                </span>
              </button>
              {isOpen && (
                <div style={S.body}>
                  {c.documents.length === 0 && <div style={{ fontSize: 12.8, color: '#64748B', paddingTop: 12 }}>Nothing on file for this client yet.</div>}
                  <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                    {c.documents.map((d) => (
                      <div key={d.id} style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 9, padding: '10px 13px' }}>
                        <span style={{ flex: 1 }}>
                          <b style={{ display: 'block', fontSize: 13.3 }}>{d.title}</b>
                          <span style={{ color: '#64748B', fontSize: 11.8 }}>{LABEL[d.doc_type] ?? d.doc_type}, added {shortDate(d.created_at)}</span>
                        </span>
                      </div>
                    ))}
                    {c.missing.map((m) => (
                      <div key={m} style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#FEF2F2', border: '1px dashed #FECACA', borderRadius: 9, padding: '10px 13px' }}>
                        <span style={{ flex: 1 }}>
                          <b style={{ display: 'block', fontSize: 13.3 }}>{LABEL[m] ?? m}</b>
                          <span style={{ color: '#DC2626', fontSize: 11.8 }}>This district requires it before they will pay</span>
                        </span>
                      </div>
                    ))}
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
          fontWeight: 650, boxShadow: '0 10px 30px rgba(11,17,32,.3)', zIndex: 120 }}>{flash}</div>
      )}

      {adding && (
        <ActionDialog
          title="Record a document"
          subtitle="Tells the system we hold this, so a send is not blocked on a file in someone's inbox."
          confirmLabel="Record it"
          fields={[
            { name: 'doc_type', label: 'Type', type: 'select', required: true,
              options: ['purchase_order','w9','coi','signed_contract','vendor_registration','delivery_evidence','check_photo','roster','invoice_pdf','other'] },
            { name: 'title', label: 'Title', type: 'text', required: true,
              hint: 'What someone would search for, such as "PGCPS purchase order 867826".' },
            { name: 'location', label: 'Where it lives', type: 'text',
              hint: 'A Drive link, an email subject, wherever the actual file is.' },
            { name: 'expires_on', label: 'Expires', type: 'date',
              hint: 'Leave blank if it does not expire. Certificates of insurance and W-9s usually do.' },
            { name: 'note', label: 'Note', type: 'textarea' },
          ]}
          effects={[
            'Appears under company documents and clears any matching requirement.',
            'If you set an expiry, a guardrail warns 90 days out.',
          ]}
          onCancel={() => setAdding(null)}
          onConfirm={addDoc}
        />
      )}
    </Shell>
  );
}
