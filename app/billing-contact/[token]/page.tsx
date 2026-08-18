'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

/**
 * Where the "Tell us who is" link in every billing email lands.
 *
 * No login on purpose. A business manager who has been forwarded an invoice has
 * no TDI account and never will, and asking them to make one is how this stays
 * wrong forever. See app/api/billing-contact/[token]/route.ts for the limits
 * that make that safe.
 */

type Info = {
  orgName: string | null;
  hasBillingContact: boolean;
  billingContactName: string | null;
  billingContactTitle: string | null;
  relationshipContactFirstName: string | null;
};

export default function BillingContactPage() {
  const params = useParams();
  const token = params.token as string;

  const [info, setInfo] = useState<Info | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', title: '' });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/billing-contact/${token}`);
        if (!res.ok) { setNotFound(true); return; }
        const data = await res.json();
        setInfo(data);
        setForm(f => ({
          ...f,
          name: data.billingContactName || '',
          title: data.billingContactTitle || '',
        }));
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    if (token) load();
  }, [token]);

  async function save() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/billing-contact/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaved(true);
      } else {
        setError(data.error || 'We could not save that. Please try again.');
      }
    } catch {
      setError('We could not reach the server. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const wrap: React.CSSProperties = {
    minHeight: '100vh',
    background: '#F5F6F8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 20px',
    fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
    color: '#1e2749',
  };
  const card: React.CSSProperties = {
    background: '#fff',
    borderRadius: 16,
    border: '1px solid #E3E7EF',
    boxShadow: '0 1px 2px rgba(27,42,74,.05), 0 10px 30px -18px rgba(27,42,74,.35)',
    padding: '36px 32px',
    maxWidth: 460,
    width: '100%',
  };
  const label: React.CSSProperties = { display: 'block', fontSize: 12.5, color: '#6B7489', marginBottom: 6 };
  const input: React.CSSProperties = {
    width: '100%', padding: '10px 12px', border: '1px solid #E3E7EF',
    borderRadius: 8, fontSize: 15, fontFamily: 'inherit', color: '#1e2749', background: '#fff',
  };
  const btn: React.CSSProperties = {
    width: '100%', background: '#E8B84B', color: '#1B2A4A', fontWeight: 700,
    fontSize: 15, border: 'none', borderRadius: 9, padding: '12px 18px',
    cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1,
  };
  const brand: React.CSSProperties = {
    fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase',
    color: '#9AA2B5', textAlign: 'center', marginBottom: 20,
  };

  if (loading) {
    return <div style={wrap}><div style={card}><p style={{ color: '#9AA2B5', margin: 0 }}>Loading...</p></div></div>;
  }

  if (notFound) {
    return (
      <div style={wrap}>
        <div style={{ ...card, textAlign: 'center' }}>
          <div style={brand}>Teachers Deserve It</div>
          <h1 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 21, margin: '0 0 8px' }}>
            This link is not valid
          </h1>
          <p style={{ color: '#6B7489', fontSize: 14.5, margin: 0 }}>
            It may have been replaced by a newer one. Reply to your most recent invoice
            and we will sort it out, or email{' '}
            <a href="mailto:Billing@teachersdeserveit.com" style={{ color: '#B8860B', fontWeight: 600 }}>
              Billing@teachersdeserveit.com
            </a>.
          </p>
        </div>
      </div>
    );
  }

  if (saved) {
    return (
      <div style={wrap}>
        <div style={{ ...card, textAlign: 'center' }}>
          <div style={brand}>Teachers Deserve It</div>
          <div style={{
            width: 54, height: 54, borderRadius: '50%', margin: '0 auto 16px',
            background: '#EAF5F0', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 20, height: 11, borderLeft: '3px solid #4A9D7E', borderBottom: '3px solid #4A9D7E', transform: 'rotate(-45deg) translate(2px,-3px)' }} />
          </div>
          <h1 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 21, margin: '0 0 8px' }}>
            Thank you, that is updated
          </h1>
          <p style={{ color: '#6B7489', fontSize: 14.5, margin: 0 }}>
            Invoices for {info?.orgName || 'your school'} will go to <strong>{form.name}</strong> from now on.
            {info?.relationshipContactFirstName
              ? ` Everything else still goes to ${info.relationshipContactFirstName}.`
              : ' Everything else is unchanged.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={brand}>Teachers Deserve It</div>

        <h1 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 21, lineHeight: 1.25, margin: '0 0 8px', textAlign: 'center' }}>
          Who should get invoices for {info?.orgName || 'your school'}?
        </h1>
        <p style={{ color: '#6B7489', fontSize: 14.5, textAlign: 'center', margin: '0 0 24px' }}>
          Change this any time. It takes effect on your next invoice.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div>
            <label style={label} htmlFor="bc-name">Name</label>
            <input id="bc-name" style={input} value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Dana Kellerman" />
          </div>
          <div>
            <label style={label} htmlFor="bc-email">Email</label>
            <input id="bc-email" type="email" style={input} value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="business.office@yourschool.org" />
          </div>
          <div>
            <label style={label} htmlFor="bc-title">Role, optional</label>
            <input id="bc-title" style={input} value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Business Manager" />
          </div>
        </div>

        {error && (
          <p style={{ color: '#A8452E', fontSize: 13.5, margin: '14px 0 0' }}>{error}</p>
        )}

        <div style={{ marginTop: 20 }}>
          <button style={btn} onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        <p style={{ color: '#9AA2B5', fontSize: 12.5, textAlign: 'center', margin: '14px 0 0' }}>
          {info?.relationshipContactFirstName
            ? `We will keep sending everything else to ${info.relationshipContactFirstName}. Only billing moves.`
            : 'This only changes where invoices go. Nothing else moves.'}
        </p>
      </div>
    </div>
  );
}
