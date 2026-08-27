'use client';

import { useEffect, useState } from 'react';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { Shell, MoneyStrip, Pill, Caret, Banner, S } from '@/components/tdi-admin/billing/ui';

type Draft = {
  id: string; kind: string; to_email: string; cc_email: string | null;
  subject: string; body: string; status: string; sent_at: string | null;
  send_result: string | null; drafted_by: string | null; sent_by: string | null;
  attachments: { name: string }[]; created_at: string;
  delivered_at: string | null; bounced_at: string | null; bounce_reason: string | null;
  opened_at: string | null; last_event: string | null;
};

const KIND: Record<string, string> = {
  invoice: 'Invoice', resend: 'Resend', reminder: 'Reminder',
  po_request: 'Purchase order request', void_notice: 'Void notice',
};

export default function OutboxPage() {
  const { teamMember } = useTDIAdmin();
  const [data, setData] = useState<{ outbox: Draft[]; totals: any; from: string } | null>(null);
  const [err, setErr] = useState('');
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [edits, setEdits] = useState<Record<string, Partial<Draft>>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState<'draft' | 'sent' | 'all'>('draft');

  const load = () => {
    if (!teamMember?.email) return;
    fetch('/api/tdi-admin/billing/outbox', { headers: { 'x-user-email': teamMember.email } })
      .then(async (r) => { if (!r.ok) throw new Error((await r.json()).error); return r.json(); })
      .then(setData).catch((e) => setErr(e.message));
  };
  useEffect(load, [teamMember?.email]);

  async function act(body: any, id: string) {
    setBusy(id);
    try {
      const r = await fetch('/api/tdi-admin/billing/outbox', {
        method: 'POST',
        headers: { 'x-user-email': teamMember!.email, 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!r.ok) { alert(j.error || 'That did not work'); return; }
      setEdits((e) => { const n = { ...e }; delete n[id]; return n; });
      load();
    } finally { setBusy(null); }
  }

  const toggle = (id: string) => setOpen((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const field = (d: Draft, k: keyof Draft) => (edits[d.id]?.[k] ?? d[k]) as string;
  const dirty = (id: string) => Boolean(edits[id] && Object.keys(edits[id]).length);

  if (err) return <Shell title="Outbox" blurb=""><Banner tone="red" title="Could not load">{err}</Banner></Shell>;
  if (!data) return <Shell title="Outbox" blurb=""><div style={{ color: '#64748B', padding: 40 }}>Loading…</div></Shell>;

  const t = data.totals;
  const rows = data.outbox.filter((o) => filter === 'all' ? true : filter === 'draft' ? o.status === 'draft' : o.status !== 'draft');

  return (
    <Shell
      title="Outbox"
      blurb="Every billing message is drafted here and sent by a person. Nothing goes to a client on its own. Read it, change anything you want, then send."
    >
      <MoneyStrip items={[
        { label: 'Waiting for you', value: String(t.drafts), note: 'not sent yet', dot: '#B45309' },
        { label: 'Sent', value: String(t.sent), note: 'left the building', dot: '#059669' },
        { label: 'Unconfirmed', value: String(t.unconfirmed ?? 0), note: 'no delivery receipt yet', dot: '#D97706' },
        { label: 'Bounced', value: String(t.bounced ?? 0), note: 'never arrived', dot: '#DC2626' },
      ]} />

      {(t.bounced ?? 0) > 0 && (
        <Banner tone="red" title={`${t.bounced} message${t.bounced > 1 ? 's' : ''} never reached the client`}>
          A bounced invoice is worse than an unsent one, because the clock keeps running while nobody knows. Fix the address and resend.
        </Banner>
      )}

      <Banner tone="blue" title={`Everything sends from ${data.from}`}>
        Signed &quot;Billing, TDI Team&quot;. Replies come back to that address, so your own name is never on collections work. If a client wants to talk, offer a call with a team member.
      </Banner>

      <div style={S.card}>
        <div style={S.filters}>
          {([['draft', `Waiting for you (${t.drafts})`], ['sent', `Already sent (${t.sent})`], ['all', 'Everything']] as const)
            .map(([k, label]) => (
              <button key={k} onClick={() => setFilter(k)} style={filter === k ? S.chipOn : S.chip}>{label}</button>
            ))}
        </div>

        {rows.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
            {filter === 'draft' ? 'Nothing waiting. When someone drafts a message it appears here.' : 'Nothing here yet.'}
          </div>
        )}

        {rows.map((d) => {
          const isOpen = open.has(d.id);
          const isDraft = d.status === 'draft';
          return (
            <div key={d.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
              <button onClick={() => toggle(d.id)} aria-expanded={isOpen}
                style={{ ...S.row, background: d.status === 'failed' ? '#FFFCFC' : isOpen ? '#FAFBFC' : '#fff' }}>
                <Caret open={isOpen} />
                <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <b style={{ display: 'block', fontSize: 13.5 }}>{d.subject}</b>
                  <span style={{ display: 'block', color: '#64748B', fontSize: 11.8 }}>
                    to {d.to_email}{d.cc_email ? `, cc ${d.cc_email}` : ''}
                  </span>
                </span>
                <span style={{ flex: '0 0 190px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {d.status === 'draft' ? <Pill tone="acc">Waiting for you</Pill>
                    : d.bounced_at ? <Pill tone="red">Bounced</Pill>
                    : d.status === 'failed' ? <Pill tone="red">Failed</Pill>
                    : d.status === 'sent' ? (
                        d.delivered_at ? <Pill tone="green">Delivered</Pill>
                                       : <Pill tone="amber">Sent, unconfirmed</Pill>
                      )
                    : <Pill tone="slate">Cancelled</Pill>}
                  {d.opened_at && <Pill tone="blue">Opened</Pill>}
                </span>
                <span style={{ flex: '0 0 128px', fontSize: 12.5, color: '#64748B', textAlign: 'right' }}>
                  {KIND[d.kind] ?? d.kind}
                </span>
              </button>

              {isOpen && (
                <div style={S.body}>
                  {d.bounced_at && (
                    <Banner tone="red" title="This never reached them">
                      Bounced on {new Date(d.bounced_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}.
                      {d.bounce_reason ? ` ${d.bounce_reason}` : ''} The client has not seen this, so do not chase them for it.
                      Fix the address and send again.
                    </Banner>
                  )}
                  {d.status === 'failed' && !d.bounced_at && (
                    <Banner tone="red" title="This did not send">
                      It is still here and nothing was lost. {d.send_result?.slice(0, 200)}
                    </Banner>
                  )}
                  {d.status === 'sent' && !d.delivered_at && !d.bounced_at && (
                    <Banner tone="amber" title="Sent, but not yet confirmed delivered">
                      The provider accepted it. Until a delivery confirmation arrives we know it left, not that it landed.
                      This usually resolves within a minute or two.
                    </Banner>
                  )}
                  {d.delivered_at && (
                    <Banner tone="green" title={`Delivered ${new Date(d.delivered_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`}>
                      Confirmed by the provider.{d.opened_at ? ` Opened ${new Date(d.opened_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}.` : ' Not opened yet.'}
                    </Banner>
                  )}
                  {d.status === 'sent' && (
                    <Banner tone="green" title={`Sent${d.sent_by ? ` by ${d.sent_by.split('@')[0]}` : ''}${d.sent_at ? ` on ${new Date(d.sent_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : ''}`}>
                      This is the copy the client received. Sent messages are never edited.
                    </Banner>
                  )}

                  <div style={{ display: 'grid', gap: 12, marginTop: 14, maxWidth: 760 }}>
                    <Row label="To">
                      <input disabled={!isDraft} value={field(d, 'to_email')}
                        onChange={(e) => setEdits((s) => ({ ...s, [d.id]: { ...s[d.id], to_email: e.target.value } }))}
                        style={inp(isDraft)} />
                    </Row>
                    <Row label="Cc">
                      <input disabled={!isDraft} value={field(d, 'cc_email') || ''}
                        onChange={(e) => setEdits((s) => ({ ...s, [d.id]: { ...s[d.id], cc_email: e.target.value } }))}
                        style={inp(isDraft)} />
                    </Row>
                    <Row label="Subject">
                      <input disabled={!isDraft} value={field(d, 'subject')}
                        onChange={(e) => setEdits((s) => ({ ...s, [d.id]: { ...s[d.id], subject: e.target.value } }))}
                        style={inp(isDraft)} />
                    </Row>
                    <Row label="Message">
                      <textarea disabled={!isDraft} value={field(d, 'body')} rows={16}
                        onChange={(e) => setEdits((s) => ({ ...s, [d.id]: { ...s[d.id], body: e.target.value } }))}
                        style={{ ...inp(isDraft), lineHeight: 1.6, resize: 'vertical', fontFamily: 'inherit' }} />
                    </Row>
                    {d.attachments?.length > 0 && (
                      <Row label="Attached">
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {d.attachments.map((a, i) => <Pill key={i} tone="slate">{a.name}</Pill>)}
                        </div>
                      </Row>
                    )}
                  </div>

                  {isDraft && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        disabled={busy === d.id}
                        onClick={() => {
                          if (!confirm(`Send this to ${field(d, 'to_email')}?\n\nIt goes out from ${data.from} and cannot be unsent.`)) return;
                          act({ action: 'send', outbox_id: d.id }, d.id);
                        }}
                        style={{ ...S.btn, background: '#B45309', opacity: busy === d.id ? 0.5 : 1 }}>
                        {busy === d.id ? 'Sending…' : 'Send this'}
                      </button>
                      <button disabled={!dirty(d.id) || busy === d.id}
                        onClick={() => act({ action: 'edit', outbox_id: d.id, ...edits[d.id] }, d.id)}
                        style={{ ...S.btnGhost, opacity: dirty(d.id) ? 1 : 0.4 }}>
                        Save changes
                      </button>
                      <button disabled={busy === d.id}
                        onClick={() => { if (confirm('Discard this draft? It will not be sent.')) act({ action: 'cancel', outbox_id: d.id }, d.id); }}
                        style={S.btnGhost}>
                        Discard
                      </button>
                      {dirty(d.id) && <span style={{ fontSize: 12.5, color: '#B45309', fontWeight: 650 }}>Unsaved changes. Save before sending.</span>}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Shell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.07em', color: '#64748B', fontWeight: 650, marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  );
}
const inp = (enabled: boolean): React.CSSProperties => ({
  width: '100%', border: '1px solid #CBD5E1', borderRadius: 8, padding: '9px 11px',
  fontSize: 13.5, background: enabled ? '#fff' : '#F8FAFC', color: enabled ? '#0B1120' : '#64748B',
});
