'use client';

import { useEffect, useState } from 'react';
import { Shell, MoneyStrip, Pill, Caret, Banner, S, money } from '@/components/tdi-admin/billing/ui';

type Check = {
  name: string; why: string; severity: 'money' | 'data' | 'documents';
  passing: boolean; failures: Record<string, any>[];
};

const SEVERITY: Record<string, { label: string; tone: 'red' | 'amber' | 'blue' }> = {
  money: { label: 'Money', tone: 'red' },
  data: { label: 'Data', tone: 'amber' },
  documents: { label: 'Documents', tone: 'blue' },
};

export default function GuardrailsPage() {
  const [data, setData] = useState<{ checked_at: string; summary: any; checks: Check[] } | null>(null);
  const [err, setErr] = useState('');
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [showPassing, setShowPassing] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setBusy(true);
    fetch('/api/tdi-admin/billing/guardrails')
      .then(async (r) => { if (!r.ok) throw new Error((await r.json()).error); return r.json(); })
      .then(setData).catch((e) => setErr(e.message)).finally(() => setBusy(false));
  };
  useEffect(load, []);

  const toggle = (n: string) => setOpen((p) => { const s = new Set(p); s.has(n) ? s.delete(n) : s.add(n); return s; });

  if (err) return <Shell title="Guardrails" blurb=""><Banner tone="red" title="Could not load">{err}</Banner></Shell>;
  if (!data) return <Shell title="Guardrails" blurb=""><div style={{ color: '#64748B', padding: 40 }}>Checking…</div></Shell>;

  const s = data.summary;
  const failing = data.checks.filter((c) => !c.passing);
  const passing = data.checks.filter((c) => c.passing);

  return (
    <Shell
      title="Guardrails"
      blurb="Continuous checks reconciling contracts against invoices against payments. These exist because Oak Grove drifted $4,400 for three weeks and nothing compared the three."
    >
      <MoneyStrip items={[
        { label: 'Failing', value: String(s.failing), note: 'need a person', dot: '#DC2626' },
        { label: 'Passing', value: String(s.passing), note: `of ${s.total} checks`, dot: '#059669' },
        { label: 'Money at risk', value: money(s.money_at_risk), note: 'unreconciled', dot: '#B45309' },
        { label: 'Last checked', value: new Date(data.checked_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), note: 'runs on load', dot: '#64748B' },
      ]} />

      {failing.length === 0 && (
        <Banner tone="green" title="Everything reconciles">
          Contracts, invoices and payments all agree. Nothing needs a person right now.
        </Banner>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={load} disabled={busy} style={{ ...S.btnGhost, opacity: busy ? 0.5 : 1 }}>
          {busy ? 'Checking…' : 'Run again'}
        </button>
        <button onClick={() => setShowPassing((v) => !v)} style={S.btnGhost}>
          {showPassing ? 'Hide' : 'Show'} the {passing.length} that pass
        </button>
      </div>

      {failing.map((c) => {
        const isOpen = open.has(c.name);
        const sev = SEVERITY[c.severity] ?? SEVERITY.money;
        return (
          <div key={c.name} style={{ ...S.card, marginBottom: 10, borderColor: '#FECACA' }}>
            <button onClick={() => toggle(c.name)} aria-expanded={isOpen}
              style={{ ...S.row, background: '#FFFCFC' }}>
              <Caret open={isOpen} />
              <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <b style={{ display: 'block', fontSize: 13.5 }}>{c.name}</b>
                <span style={{ display: 'block', color: '#64748B', fontSize: 11.8 }}>{c.why}</span>
              </span>
              <span style={{ flex: '0 0 96px' }}><Pill tone={sev.tone === 'red' ? 'red' : sev.tone === 'amber' ? 'amber' : 'blue'}>{sev.label}</Pill></span>
              <span style={{ flex: '0 0 84px', textAlign: 'right', fontWeight: 650, color: '#DC2626', fontVariantNumeric: 'tabular-nums' }}>
                {c.failures.length}
              </span>
            </button>
            {isOpen && (
              <div style={{ padding: '4px 16px 16px 46px', background: '#FAFBFC', borderTop: '1px solid #F1F5F9' }}>
                {c.failures.map((f, i) => (
                  <div key={i} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 9, padding: '11px 13px', marginTop: 10 }}>
                    {Object.entries(f).map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, fontSize: 12.8, padding: '2px 0' }}>
                        <span style={{ color: '#64748B' }}>{k.replace(/_/g, ' ')}</span>
                        <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                          {typeof v === 'number' && /amount|gap|total|applied/.test(k) ? money(v) : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {showPassing && passing.map((c) => (
        <div key={c.name} style={{ ...S.card, marginBottom: 8, padding: '13px 16px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <Pill tone="green">Pass</Pill>
          <span style={{ flex: 1 }}>
            <b style={{ display: 'block', fontSize: 13.3 }}>{c.name}</b>
            <span style={{ color: '#64748B', fontSize: 11.8 }}>{c.why}</span>
          </span>
        </div>
      ))}
    </Shell>
  );
}
