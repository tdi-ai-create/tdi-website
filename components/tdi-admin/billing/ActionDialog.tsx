'use client';

import { useState } from 'react';
import { ACC, money2 } from './ui';

/**
 * Every billing action goes through here, so they all behave the same way.
 *
 * The pattern is always: say what will change, let the person confirm, then do it.
 * Destructive actions (void, delete) ask for a typed reason rather than a click, so
 * "why did this happen" is answerable six months later.
 */
export type Field = {
  name: string;
  label: string;
  type?: 'text' | 'date' | 'select' | 'textarea' | 'money';
  required?: boolean;
  options?: string[];
  value?: string;
  hint?: string;
};

export function ActionDialog({
  title, subtitle, fields, effects, warning, confirmLabel, tone = 'acc',
  onCancel, onConfirm,
}: {
  title: string;
  subtitle?: string;
  fields?: Field[];
  effects?: string[];
  warning?: string;
  confirmLabel: string;
  tone?: 'acc' | 'green' | 'danger';
  onCancel: () => void;
  onConfirm: (values: Record<string, string>) => Promise<string | void>;
}) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries((fields ?? []).map((f) => [f.name, f.value ?? ''])),
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const missing = (fields ?? []).filter((f) => f.required && !values[f.name]?.trim());

  async function go() {
    if (missing.length) { setErr(`${missing[0].label} is required.`); return; }
    setBusy(true); setErr('');
    const problem = await onConfirm(values);
    setBusy(false);
    if (problem) setErr(problem);
  }

  const btnBg = tone === 'danger' ? '#DC2626' : tone === 'green' ? '#059669' : ACC;

  return (
    <div role="dialog" aria-modal="true" aria-label={title}
      onClick={(e) => { if (e.target === e.currentTarget && !busy) onCancel(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(11,17,32,.55)', zIndex: 90,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 18px', overflowY: 'auto' }}>
      <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 560, boxShadow: '0 22px 60px rgba(11,17,32,.3)' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #E2E8F0' }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{title}</h3>
          {subtitle && <div style={{ color: '#64748B', fontSize: 12.8, marginTop: 2 }}>{subtitle}</div>}
        </div>

        <div style={{ padding: '18px 22px', maxHeight: 'calc(100vh - 260px)', overflowY: 'auto' }}>
          {warning && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '11px 13px', marginBottom: 14, fontSize: 13, color: '#7F1D1D' }}>
              {warning}
            </div>
          )}

          {(fields ?? []).map((f) => (
            <div key={f.name} style={{ marginBottom: 13 }}>
              <label htmlFor={f.name} style={{ display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', color: '#64748B', fontWeight: 650, marginBottom: 5 }}>
                {f.label}{f.required && <span style={{ color: '#DC2626' }}> *</span>}
              </label>
              {f.type === 'select' ? (
                <select id={f.name} value={values[f.name]} onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))} style={inp}>
                  <option value="">Choose one</option>
                  {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea id={f.name} rows={3} value={values[f.name]} onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} />
              ) : (
                <input id={f.name} type={f.type === 'date' ? 'date' : 'text'} value={values[f.name]}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))} style={inp} />
              )}
              {f.hint && <div style={{ fontSize: 12, color: '#64748B', marginTop: 5 }}>{f.hint}</div>}
            </div>
          ))}

          {effects && effects.length > 0 && (
            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '12px 14px', marginTop: 4 }}>
              <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.07em', color: '#1E40AF', fontWeight: 650, marginBottom: 7 }}>What this changes</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: '#1E3A8A', fontSize: 13 }}>
                {effects.map((e, i) => <li key={i} style={{ marginBottom: 3 }}>{e}</li>)}
              </ul>
            </div>
          )}

          {err && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '11px 13px', marginTop: 14, fontSize: 13, color: '#7F1D1D' }}>
              {err}
            </div>
          )}
        </div>

        <div style={{ padding: '14px 22px', borderTop: '1px solid #E2E8F0', background: '#FCFCFD', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} disabled={busy}
            style={{ background: '#fff', color: '#0B1120', border: '1px solid #CBD5E1', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 650, cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={go} disabled={busy}
            style={{ background: btnBg, color: '#fff', border: 0, borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 650, cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.6 : 1 }}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const inp: React.CSSProperties = {
  width: '100%', border: '1px solid #CBD5E1', borderRadius: 8, padding: '9px 11px', fontSize: 13.5, background: '#fff',
};

/** Small button used inline on a row to start an action. */
export function ActionButton({ tone, onClick, children }: { tone: 'acc' | 'green' | 'danger' | 'dark'; onClick: () => void; children: React.ReactNode }) {
  const bg = { acc: ACC, green: '#059669', danger: '#DC2626', dark: '#0B1120' }[tone];
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{ background: bg, color: '#fff', border: 0, borderRadius: 7, padding: '5px 10px', fontSize: 12, fontWeight: 650, cursor: 'pointer', whiteSpace: 'nowrap' }}>
      {children}
    </button>
  );
}

export { money2 };
