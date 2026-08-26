'use client';

import { useState } from 'react';

/**
 * Sends a creator a working way into Creator Studio.
 *
 * Always shows the email before it goes. Thirteen creators spent up to three
 * months locked out while receiving mail asking why they had gone quiet, so an
 * invite that sends on a single click, with nobody having read it, is not the
 * thing to build here.
 */
export function CreatorInviteButton({
  creatorId,
  creatorName,
  adminEmail,
  lastInviteSent,
  compact = false,
  onSent,
}: {
  creatorId: string;
  creatorName: string;
  adminEmail: string;
  lastInviteSent?: string | null;
  compact?: boolean;
  onSent?: () => void;
}) {
  const [preview, setPreview] = useState<{ subject: string; html: string; openStep: string | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentAt, setSentAt] = useState<string | null>(lastInviteSent ?? null);

  async function loadPreview() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/creators/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-email': adminEmail },
        body: JSON.stringify({ creatorId, dryRun: true }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Could not build the invite.'); return; }
      setPreview({ subject: data.subject, html: data.html, openStep: data.openStep });
    } catch {
      setError('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/creators/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-email': adminEmail },
        body: JSON.stringify({ creatorId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'The invite was not sent.'); return; }
      setSentAt(new Date().toISOString());
      setPreview(null);
      onSent?.();
    } catch {
      setError('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  }

  const sentLabel = sentAt
    ? `Invite sent ${new Date(sentAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
    : null;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={loadPreview}
          disabled={busy}
          style={{
            fontSize: compact ? 13 : 14,
            fontWeight: 600,
            padding: compact ? '6px 12px' : '9px 16px',
            borderRadius: 8,
            border: sentAt ? '1px solid #d5dbe8' : 'none',
            background: sentAt ? '#ffffff' : '#1e2749',
            color: sentAt ? '#4d587a' : '#ffffff',
            cursor: busy ? 'wait' : 'pointer',
          }}
        >
          {busy ? 'Working...' : sentAt ? 'Send again' : 'Send them a way in'}
        </button>
        {sentLabel && <span style={{ fontSize: 12.5, color: '#7e88a6' }}>{sentLabel}</span>}
      </div>

      {error && (
        <p style={{ fontSize: 13, color: '#a32c2c', margin: '8px 0 0' }}>{error}</p>
      )}

      {preview && (
        <div
          role="dialog"
          aria-label={`Invite for ${creatorName}`}
          style={{
            position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(30,39,73,.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 640, maxHeight: '86vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e7f2' }}>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 650, color: '#1e2749' }}>
                This is what {creatorName.split(' ')[0]} will get
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#7e88a6' }}>
                {preview.subject}
                {preview.openStep ? ` · lands on ${preview.openStep}` : ''}
              </p>
            </div>

            <div style={{ overflowY: 'auto', padding: 20, background: '#f4f6fb', flex: 1 }}>
              <div dangerouslySetInnerHTML={{ __html: preview.html }} />
            </div>

            <div style={{ padding: '16px 22px', borderTop: '1px solid #e2e7f2', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setPreview(null)}
                style={{ fontSize: 14, fontWeight: 600, padding: '10px 16px', borderRadius: 8, border: '1px solid #d5dbe8', background: '#fff', color: '#4d587a', cursor: 'pointer' }}
              >
                Not now
              </button>
              <button
                type="button"
                onClick={send}
                disabled={busy}
                style={{ fontSize: 14, fontWeight: 650, padding: '10px 20px', borderRadius: 8, border: 'none', background: '#1e2749', color: '#fff', cursor: busy ? 'wait' : 'pointer' }}
              >
                {busy ? 'Sending...' : `Send it to ${creatorName.split(' ')[0]}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
