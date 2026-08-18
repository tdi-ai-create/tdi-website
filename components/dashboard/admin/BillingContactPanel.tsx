'use client';

import { useState, useEffect, useCallback } from 'react';
import { Mail, Pencil, Check, X, Link as LinkIcon, AlertCircle } from 'lucide-react';

/**
 * "Invoices go to ___" at the top of the Billing tab.
 *
 * The point is to make the answer visible without anyone asking. When we do not
 * actually know, it says so rather than quietly showing the person who signed
 * the contract as though they were the billing contact. That distinction is the
 * whole reason invoices were reaching principals.
 */

type Info = {
  billing: {
    name: string | null;
    email: string | null;
    title: string | null;
    isFallback: boolean;
    source: string | null;
    updatedAt: string | null;
  };
  relationship: { name: string | null; email: string | null };
  shareUrl: string | null;
};

const SOURCE_LABEL: Record<string, string> = {
  onboarding: 'Given at onboarding',
  school: 'Set by the school',
  tdi: 'Set by us',
};

export default function BillingContactPanel({ partnershipId }: { partnershipId: string }) {
  const [info, setInfo] = useState<Info | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', title: '' });

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/tdi-admin/partnerships/${partnershipId}/billing-contact`);
      if (!res.ok) return;
      const data: Info = await res.json();
      setInfo(data);
      setForm({
        name: data.billing.isFallback ? '' : data.billing.name || '',
        email: data.billing.isFallback ? '' : data.billing.email || '',
        title: data.billing.title || '',
      });
    } finally {
      setLoading(false);
    }
  }, [partnershipId]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/tdi-admin/partnerships/${partnershipId}/billing-contact`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEditing(false);
        await load();
      } else {
        setError(data.error || 'Could not save that.');
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !info) return null;

  const { billing, relationship, shareUrl } = info;
  const unknown = billing.isFallback;

  return (
    <div
      className="mb-5 rounded-xl p-4"
      style={{
        background: unknown ? '#FFFBEB' : '#F8FAFC',
        border: `1px solid ${unknown ? '#FDE68A' : '#E2E8F0'}`,
      }}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: unknown ? '#FEF3C7' : '#E8F0FD' }}
          >
            {unknown
              ? <AlertCircle size={17} style={{ color: '#B45309' }} />
              : <Mail size={17} style={{ color: '#1e2749' }} />}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">
              Invoices go to
            </p>
            {unknown ? (
              <>
                <p className="text-sm font-semibold text-gray-900">
                  Nobody has told us yet
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Falling back to {relationship.name || 'the contract signer'}
                  {relationship.email ? ` (${relationship.email})` : ''}, who may not handle invoices.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {billing.name}
                  {billing.title && <span className="font-normal text-gray-500"> &middot; {billing.title}</span>}
                </p>
                <p className="text-xs text-gray-600 truncate">{billing.email}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {SOURCE_LABEL[billing.source || ''] || 'Set manually'}
                  {billing.updatedAt && ` on ${new Date(billing.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                  {relationship.name && ` · Everything else goes to ${relationship.name.split(' ')[0]}`}
                </p>
              </>
            )}
          </div>
        </div>

        {!editing && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {shareUrl && (
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(shareUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white inline-flex items-center gap-1.5"
                title="A no-login link the school can use to set this themselves"
              >
                {copied ? <Check size={13} /> : <LinkIcon size={13} />}
                {copied ? 'Copied' : 'Copy link for school'}
              </button>
            )}
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5"
              style={{ background: '#E8B84B', color: '#1B2A4A' }}
            >
              <Pencil size={12} />
              {unknown ? 'Set it' : 'Change'}
            </button>
          </div>
        )}
      </div>

      {editing && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
            <input
              className="text-sm p-2 rounded border border-gray-200"
              placeholder="Name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
            <input
              className="text-sm p-2 rounded border border-gray-200"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
            <input
              className="text-sm p-2 rounded border border-gray-200"
              placeholder="Role, optional"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>
          {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white inline-flex items-center gap-1.5"
              style={{ background: '#059669', opacity: saving ? 0.6 : 1 }}
            >
              <Check size={13} />
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => { setEditing(false); setError(''); }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 inline-flex items-center gap-1.5"
            >
              <X size={13} />
              Cancel
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            The school is emailed a heads-up when this changes, and it posts to #financials.
          </p>
        </div>
      )}
    </div>
  );
}
