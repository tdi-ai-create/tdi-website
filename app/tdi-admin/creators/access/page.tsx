'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { CreatorInviteButton } from '@/components/admin/CreatorInviteButton';

/**
 * Who can actually get into Creator Studio.
 *
 * Nothing in the product ever showed this, which is how thirteen of twenty
 * active creators went up to three months locked out while receiving mail
 * asking why they had gone quiet. This should read all-clear most of the time.
 */

type Row = {
  id: string;
  name: string;
  email: string | null;
  contentPath: string | null;
  paused: boolean;
  hasAccount: boolean;
  accountMade: string | null;
  lastSignIn: string | null;
  lastInviteSent: string | null;
  blocker: 'no_account' | 'never_invited' | 'invited_not_arrived' | null;
};

const BLOCKER_COPY: Record<string, { label: string; why: string }> = {
  no_account: {
    label: 'No account at all',
    why: 'There is nothing to sign in to. An account has to be created before an invite can go anywhere.',
  },
  never_invited: {
    label: 'Never sent a way in',
    why: 'The account works. Nobody has ever sent them a link.',
  },
  invited_not_arrived: {
    label: 'Invited, not arrived',
    why: 'A link went out and they have not signed in. Links expire quickly, so a fresh one often does it.',
  },
};

function fmt(d: string | null): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CreatorAccessPage() {
  const [data, setData] = useState<{ total: number; signedIn: number; lockedOut: number; creators: Row[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Same source every other admin page uses. A localStorage guess here would
  // have left the page silently empty for everyone.
  const { teamMember } = useTDIAdmin();
  const adminEmail = teamMember?.email || '';

  const load = useCallback(async () => {
    if (!adminEmail) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/creators/access-status');
      const body = await res.json();
      if (!res.ok) { setError(body.error || 'Could not load access status.'); return; }
      setData(body);
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, [adminEmail]);

  useEffect(() => { load(); }, [load]);

  const lockedOut = (data?.creators || []).filter((c) => c.blocker !== null);
  const signedIn = (data?.creators || []).filter((c) => c.blocker === null);

  return (
    <div style={{ maxWidth: 940, margin: '0 auto', padding: '32px 24px 80px', fontFamily: "-apple-system, 'Segoe UI', sans-serif", color: '#1e2749' }}>
      <Link href="/tdi-admin/creators" style={{ fontSize: 13, color: '#7e88a6', textDecoration: 'none' }}>
        Back to creators
      </Link>

      <h1 style={{ fontSize: 30, fontWeight: 680, letterSpacing: '-0.02em', margin: '14px 0 8px' }}>
        Who can get in
      </h1>
      <p style={{ fontSize: 16, color: '#4d587a', margin: '0 0 26px', maxWidth: '62ch', lineHeight: 1.55 }}>
        A creator with no way in looks exactly like a creator who has lost interest. This is the
        difference between the two.
      </p>

      {!adminEmail && (
        <p style={{ fontSize: 14, color: '#a32c2c' }}>
          Could not tell who you are. Sign in to the admin portal and reload.
        </p>
      )}

      {loading && adminEmail && <p style={{ fontSize: 14, color: '#7e88a6' }}>Checking every account...</p>}
      {error && <p style={{ fontSize: 14, color: '#a32c2c' }}>{error}</p>}

      {data && (
        <>
          <div style={{ display: 'flex', gap: 1, background: '#e2e7f2', border: '1px solid #e2e7f2', borderRadius: 10, overflow: 'hidden', marginBottom: 30 }}>
            <div style={{ background: '#fff', padding: '16px 20px', flex: 1 }}>
              <div style={{ fontSize: 28, fontWeight: 660, color: lockedOut.length ? '#a32c2c' : '#1f7a5c' }}>{data.lockedOut}</div>
              <div style={{ fontSize: 12.5, color: '#7e88a6', marginTop: 4 }}>cannot get in</div>
            </div>
            <div style={{ background: '#fff', padding: '16px 20px', flex: 1 }}>
              <div style={{ fontSize: 28, fontWeight: 660 }}>{data.signedIn}</div>
              <div style={{ fontSize: 12.5, color: '#7e88a6', marginTop: 4 }}>have signed in</div>
            </div>
            <div style={{ background: '#fff', padding: '16px 20px', flex: 1 }}>
              <div style={{ fontSize: 28, fontWeight: 660 }}>{data.total}</div>
              <div style={{ fontSize: 12.5, color: '#7e88a6', marginTop: 4 }}>active creators</div>
            </div>
          </div>

          {lockedOut.length === 0 && (
            <p style={{ fontSize: 15, color: '#1f7a5c', fontWeight: 600 }}>
              Everyone on the roster can get in.
            </p>
          )}

          {lockedOut.map((c) => (
            <div key={c.id} style={{ border: '1px solid #e2e7f2', borderLeft: '3px solid #a32c2c', borderRadius: 10, padding: '16px 18px', marginBottom: 12, background: '#fff' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div style={{ minWidth: 0 }}>
                  <Link href={`/tdi-admin/creators/${c.id}`} style={{ fontSize: 16.5, fontWeight: 640, color: '#1e2749', textDecoration: 'none' }}>
                    {c.name}
                  </Link>
                  <div style={{ fontSize: 12.5, color: '#7e88a6', marginTop: 3 }}>
                    {c.email}
                    {c.contentPath ? ` · ${c.contentPath}` : ' · path not chosen'}
                    {c.paused ? ' · paused' : ''}
                    {c.accountMade ? ` · account made ${fmt(c.accountMade)}` : ''}
                  </div>
                </div>

                {c.blocker === 'no_account' ? (
                  <span style={{ fontSize: 13, color: '#a32c2c', fontWeight: 600 }}>Needs an account first</span>
                ) : (
                  <CreatorInviteButton
                    creatorId={c.id}
                    creatorName={c.name}
                    lastInviteSent={c.lastInviteSent}
                    compact
                    onSent={load}
                  />
                )}
              </div>

              <p style={{ fontSize: 13.5, color: '#4d587a', margin: '10px 0 0', lineHeight: 1.5 }}>
                <strong style={{ color: '#1e2749' }}>{BLOCKER_COPY[c.blocker!].label}.</strong>{' '}
                {BLOCKER_COPY[c.blocker!].why}
              </p>
            </div>
          ))}

          {signedIn.length > 0 && (
            <>
              <h2 style={{ fontSize: 15, fontWeight: 650, margin: '34px 0 12px', color: '#4d587a' }}>
                Can get in
              </h2>
              {signedIn.map((c) => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '10px 2px', borderBottom: '1px solid #eef1f7', fontSize: 14 }}>
                  <Link href={`/tdi-admin/creators/${c.id}`} style={{ color: '#1e2749', textDecoration: 'none', fontWeight: 560 }}>
                    {c.name}
                  </Link>
                  <span style={{ fontSize: 12.5, color: '#7e88a6', whiteSpace: 'nowrap' }}>
                    last in {fmt(c.lastSignIn)}
                  </span>
                </div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}
