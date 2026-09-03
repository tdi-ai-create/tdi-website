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
}

interface Finding {
  blocker: string;
  what: string;
  why: string;
  remedy: { action: string; label: string; effect: string };
}

interface LookupResult {
  email: string;
  foundAnywhere: boolean;
  accountFindings: Finding[];
  account: { lastSignInAt: string | null; malformed: boolean } | null;
  creator: { name: string | null; status: string; contentPath: string | null; agreementSigned: boolean } | null;
  hub: { displayName: string | null } | null;
  hubReadable: boolean;
  surfaces: Array<{ surface: 'creator_studio' | 'hub'; present: boolean; findings: Finding[] }>;
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

  // Look one person up and fix them, without asking anybody.
  const [query, setQuery] = useState('');
  const [lookup, setLookup] = useState<LookupResult | null>(null);
  const [looking, setLooking] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<{ did: string; signInUrl?: string } | null>(null);

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

  const runLookup = async (email: string) => {
    if (!email.trim()) return;
    setLooking(true); setLookupError(null); setLookup(null); setOutcome(null);
    try {
      const res = await fetch(`/api/admin/access/lookup?email=${encodeURIComponent(email.trim())}`);
      const body = await res.json();
      if (!res.ok) { setLookupError(body.error || 'Could not look that up.'); return; }
      setLookup(body);
    } catch {
      setLookupError('Could not reach the server.');
    } finally {
      setLooking(false);
    }
  };

  const resolve = async (action: string, surface: string) => {
    if (!lookup) return;
    setActing(action); setLookupError(null);
    try {
      const res = await fetch('/api/admin/access/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: lookup.email, action, surface }),
      });
      const body = await res.json();
      if (!res.ok) { setLookupError(body.error || 'That did not work. Nothing was changed.'); return; }
      setOutcome({ did: body.did, signInUrl: body.signInUrl });
      await runLookup(lookup.email);
      load();
    } catch {
      setLookupError('Could not reach the server. Nothing was changed.');
    } finally {
      setActing(null);
    }
  };

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

      {/* Look one person up, across both systems, and fix them here. */}
      <div style={{ border: '1px solid #e2e7f2', borderRadius: 12, padding: 20, marginBottom: 30, background: '#fbfcfe' }}>
        <h2 style={{ fontSize: 16, fontWeight: 660, margin: '0 0 6px' }}>Someone cannot get in</h2>
        <p style={{ fontSize: 13.5, color: '#4d587a', margin: '0 0 14px', maxWidth: '62ch', lineHeight: 1.5 }}>
          Put in their email. This checks Creator Studio and the Learning Hub together, says what is
          actually stopping them, and lets you fix it here. Nothing below is destructive and a sign in
          link can be sent as many times as you need.
        </p>

        <form
          onSubmit={(e) => { e.preventDefault(); runLookup(query); }}
          style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="their@email.org"
            style={{
              flex: '1 1 260px', fontSize: 14, padding: '9px 12px', borderRadius: 8,
              border: '1px solid #d3d9e8', fontFamily: 'inherit',
            }}
          />
          <button
            type="submit"
            disabled={looking || !query.trim()}
            style={{
              fontSize: 13.5, fontWeight: 640, padding: '9px 18px', borderRadius: 8, border: 'none',
              background: looking || !query.trim() ? '#d3d9e8' : '#1e2749', color: '#fff',
              cursor: looking || !query.trim() ? 'not-allowed' : 'pointer',
            }}
          >{looking ? 'Checking...' : 'Check'}</button>
        </form>

        {lookupError && (
          <p style={{ fontSize: 13.5, color: '#a32c2c', margin: '12px 0 0' }}>{lookupError}</p>
        )}

        {outcome && (
          <div style={{ marginTop: 14, padding: '12px 14px', background: '#eefaf4', border: '1px solid #b6e3ce', borderRadius: 8 }}>
            <div style={{ fontSize: 13.5, color: '#1f7a5c', fontWeight: 600 }}>{outcome.did}</div>
            {outcome.signInUrl && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 12, color: '#4d587a', marginBottom: 5 }}>
                  Their sign in link. Send it to them however you normally would.
                </div>
                <input
                  readOnly
                  value={outcome.signInUrl}
                  onFocus={(e) => e.currentTarget.select()}
                  style={{
                    width: '100%', fontSize: 12, padding: '7px 9px', borderRadius: 6,
                    border: '1px solid #b6e3ce', background: '#fff', fontFamily: 'ui-monospace, monospace',
                  }}
                />
              </div>
            )}
          </div>
        )}

        {lookup && !lookup.foundAnywhere && (
          <p style={{ fontSize: 13.5, color: '#4d587a', margin: '14px 0 0' }}>
            Nobody with that address exists in Creator Studio, the Hub, or as a sign in account.
            Check the spelling, or they may be under a different address to the one they wrote from.
          </p>
        )}

        {lookup && lookup.foundAnywhere && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12.5, color: '#4d587a', marginBottom: 12, lineHeight: 1.6 }}>
              <strong style={{ color: '#1e2749' }}>{lookup.creator?.name || lookup.hub?.displayName || lookup.email}</strong>
              {lookup.creator && <> &middot; creator, {lookup.creator.status}</>}
              {lookup.hub && <> &middot; has a Hub profile</>}
              {lookup.account
                ? lookup.account.lastSignInAt
                  ? <> &middot; last signed in {String(lookup.account.lastSignInAt).slice(0, 10)}</>
                  : <> &middot; has never signed in</>
                : <> &middot; no sign in account</>}
              {!lookup.hubReadable && <> &middot; the Hub could not be checked from here</>}
            </div>

            {/* One account problem, reported once, however many products it stops
                them reaching. */}
            {(lookup.accountFindings || []).map(f => (
              <div key={f.blocker} style={{ padding: 14, background: '#fff', border: '1px solid #f0d7d7', borderRadius: 8, marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 620, color: '#a32c2c', marginBottom: 5 }}>{f.what}</div>
                <div style={{ fontSize: 13, color: '#4d587a', lineHeight: 1.55, marginBottom: 12 }}>{f.why}</div>
                <button
                  onClick={() => resolve(f.remedy.action, 'creator_studio')}
                  disabled={acting !== null}
                  title={f.remedy.effect}
                  style={{
                    fontSize: 13, fontWeight: 620, padding: '8px 14px', borderRadius: 7, border: 'none',
                    background: acting ? '#d3d9e8' : '#1e2749', color: '#fff',
                    cursor: acting ? 'not-allowed' : 'pointer',
                  }}
                >{acting === f.remedy.action ? 'Working...' : f.remedy.label}</button>
                <div style={{ fontSize: 12, color: '#7e88a6', marginTop: 8 }}>{f.remedy.effect}</div>
              </div>
            ))}

            {(lookup.accountFindings || []).length === 0 && lookup.surfaces.every(s => s.findings.length === 0) ? (
              <div style={{ padding: '12px 14px', background: '#eefaf4', border: '1px solid #b6e3ce', borderRadius: 8, fontSize: 13.5, color: '#1f7a5c' }}>
                Nothing is blocking them. Their account works and their record is active, so if they
                still cannot get in, it is worth asking exactly what they see and at which address.
              </div>
            ) : (
              lookup.surfaces.filter(s => s.findings.length > 0).map(surface => (
                <div key={surface.surface} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: '#7e88a6', marginBottom: 8 }}>
                    {surface.surface === 'hub' ? 'Learning Hub' : 'Creator Studio'}
                  </div>
                  {surface.findings.map(f => (
                    <div key={f.blocker} style={{ padding: 14, background: '#fff', border: '1px solid #f0d7d7', borderRadius: 8, marginBottom: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 620, color: '#a32c2c', marginBottom: 5 }}>{f.what}</div>
                      <div style={{ fontSize: 13, color: '#4d587a', lineHeight: 1.55, marginBottom: 12 }}>{f.why}</div>
                      <button
                        onClick={() => resolve(f.remedy.action, surface.surface)}
                        disabled={acting !== null}
                        title={f.remedy.effect}
                        style={{
                          fontSize: 13, fontWeight: 620, padding: '8px 14px', borderRadius: 7, border: 'none',
                          background: acting ? '#d3d9e8' : '#1e2749', color: '#fff',
                          cursor: acting ? 'not-allowed' : 'pointer',
                        }}
                      >{acting === f.remedy.action ? 'Working...' : f.remedy.label}</button>
                      <div style={{ fontSize: 12, color: '#7e88a6', marginTop: 8 }}>{f.remedy.effect}</div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        )}
      </div>

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
