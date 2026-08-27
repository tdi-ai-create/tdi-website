'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const ACC = '#B45309';
export const money = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
export const money2 = (n: number | string) => Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
export const shortDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : null;

const TABS = [
  ['/tdi-admin/billing', 'Contracts'],
  ['/tdi-admin/billing/money', 'Money'],
  ['/tdi-admin/billing/documents', 'Documents'],
  ['/tdi-admin/billing/outbox', 'Outbox'],
] as const;

/** Three pages. Everything else opens in place. */
export function BillingNav() {
  const path = usePathname();
  return (
    <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid #E2E8F0', marginBottom: 20 }}>
      {TABS.map(([href, label]) => {
        const on = path === href;
        return (
          <Link key={href} href={href} style={{
            padding: '9px 14px', fontSize: 13.5, textDecoration: 'none',
            color: on ? '#0B1120' : '#64748B', fontWeight: on ? 700 : 500,
            borderBottom: `2px solid ${on ? ACC : 'transparent'}`, marginBottom: -1,
          }}>{label}</Link>
        );
      })}
    </div>
  );
}

export function Shell({ title, blurb, children }: { title: string; blurb: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '24px 30px 80px', maxWidth: 1340 }}>
      <div style={{ fontSize: 12, color: '#64748B', marginBottom: 5 }}>TDI Admin / <b style={{ color: '#0B1120' }}>Billing</b></div>
      <h1 style={{ fontSize: 25, margin: '0 0 4px', fontWeight: 700, letterSpacing: '-.018em' }}>{title}</h1>
      <p style={{ color: '#64748B', margin: '0 0 18px', maxWidth: 730 }}>{blurb}</p>
      <BillingNav />
      {children}
    </div>
  );
}

export function MoneyStrip({ items }: { items: { label: string; value: string; note: string; dot: string }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(142px,1fr))', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', marginBottom: 18 }}>
      {items.map((s) => (
        <div key={s.label} style={{ padding: '14px 16px', borderRight: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.07em', color: '#64748B', fontWeight: 650, display: 'flex', alignItems: 'center', gap: 6 }}>
            <i style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot, flex: '0 0 7px' }} />{s.label}
          </div>
          <div style={{ fontSize: 21, fontWeight: 750, letterSpacing: '-.025em', marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>{s.value}</div>
          <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 2 }}>{s.note}</div>
        </div>
      ))}
    </div>
  );
}

const TONES: Record<string, [string, string]> = {
  green: ['#ECFDF5', '#059669'], amber: ['#FFFBEB', '#D97706'], red: ['#FEF2F2', '#DC2626'],
  slate: ['#F1F5F9', '#64748B'], violet: ['#F5F3FF', '#7C3AED'], blue: ['#EFF6FF', '#2563EB'],
  acc: ['#FFFBEB', ACC], dark: ['#F1F5F9', '#0B1120'],
};
export function Pill({ tone, children }: { tone: keyof typeof TONES | 'none'; children: React.ReactNode }) {
  const base: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 650, padding: '3px 9px', borderRadius: 20, whiteSpace: 'nowrap' };
  if (tone === 'none') return <span style={{ ...base, color: '#94A3B8', border: '1px dashed #CBD5E1' }}>{children}</span>;
  const [bg, fg] = TONES[tone];
  return <span style={{ ...base, background: bg, color: fg }}><i style={{ width: 6, height: 6, borderRadius: '50%', background: fg, flex: '0 0 6px' }} />{children}</span>;
}

export function Caret({ open, small }: { open: boolean; small?: boolean }) {
  const s = small ? 14 : 16;
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" stroke={open ? ACC : '#94A3B8'} strokeWidth={2}
      style={{ flex: `0 0 ${s}px`, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .16s' }} aria-hidden>
      <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Banner({ tone, title, children, action }: { tone: 'red' | 'amber' | 'blue' | 'green'; title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  const map = { red: ['#FEF2F2', '#FECACA', '#450A0A', '#7F1D1D'], amber: ['#FFFBEB', '#FDE68A', '#451A03', '#78350F'], blue: ['#EFF6FF', '#BFDBFE', '#172554', '#1E3A8A'], green: ['#ECFDF5', '#A7F3D0', '#022C22', '#065F46'] } as const;
  const [bg, border, head, text] = map[tone];
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '13px 16px', marginBottom: 18, display: 'flex', gap: 13, alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 240, color: text }}>
        <b style={{ color: head }}>{title}</b>
        {children && <span style={{ display: 'block', fontSize: 12.8, marginTop: 2 }}>{children}</span>}
      </div>
      {action}
    </div>
  );
}

export function KV({ k, v, tone }: { k: string; v: string; tone?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, fontSize: 12.8, padding: '3px 0' }}>
      <span style={{ color: '#64748B' }}>{k}</span>
      <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: tone }}>{v}</span>
    </div>
  );
}

export function Pane({ title, children, bad }: { title: string; children: React.ReactNode; bad?: boolean }) {
  return (
    <div style={{ background: bad ? '#FEF2F2' : '#fff', border: `1px solid ${bad ? '#FECACA' : '#E2E8F0'}`, borderRadius: 10, padding: '13px 15px' }}>
      <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.07em', color: bad ? '#991B1B' : '#64748B', fontWeight: 650, marginBottom: 7 }}>{title}</div>
      {children}
    </div>
  );
}

export const S: Record<string, React.CSSProperties> = {
  card: { background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' },
  filters: { display: 'flex', gap: 7, padding: '11px 14px', borderBottom: '1px solid #E2E8F0', flexWrap: 'wrap', background: '#FCFCFD' },
  chip: { border: '1px solid #CBD5E1', background: '#fff', borderRadius: 20, padding: '5px 12px', fontSize: 12.5, color: '#64748B', cursor: 'pointer' },
  chipOn: { border: '1px solid #0B1120', background: '#0B1120', color: '#fff', borderRadius: 20, padding: '5px 12px', fontSize: 12.5, fontWeight: 650, cursor: 'pointer' },
  row: { display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', width: '100%', border: 0, cursor: 'pointer', font: 'inherit', color: 'inherit' },
  body: { padding: '0 16px 18px 46px', background: '#FAFBFC', borderTop: '1px solid #F1F5F9' },
  panes: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12, marginTop: 12 },
  btn: { background: '#0B1120', color: '#fff', border: 0, borderRadius: 8, padding: '7px 13px', fontSize: 12.5, fontWeight: 650, cursor: 'pointer', whiteSpace: 'nowrap' },
  btnGhost: { background: '#fff', color: '#0B1120', border: '1px solid #CBD5E1', borderRadius: 8, padding: '7px 13px', fontSize: 12.5, fontWeight: 650, cursor: 'pointer', whiteSpace: 'nowrap' },
};
