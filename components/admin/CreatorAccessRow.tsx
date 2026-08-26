'use client';

import { useCallback, useEffect, useState } from 'react';
import { CreatorInviteButton } from './CreatorInviteButton';

/**
 * Whether this creator can actually get in, shown on their own page.
 *
 * Never signed in is the single most useful thing to know about a quiet
 * creator, and until now nothing anywhere showed it. Thirteen of twenty went up
 * to three months locked out while being asked why they had gone quiet.
 *
 * Deliberately says nothing when they have signed in recently. A creator who is
 * fine should not take up space.
 */

type Access = {
  hasAccount: boolean;
  lastSignIn: string | null;
  lastInviteSent: string | null;
  blocker: 'no_account' | 'never_invited' | 'invited_not_arrived' | null;
};

export function CreatorAccessRow({
  creatorId,
  creatorName,
  adminEmail,
}: {
  creatorId: string;
  creatorName: string;
  adminEmail: string;
}) {
  const [access, setAccess] = useState<Access | null>(null);

  const fetchAccess = useCallback(async (): Promise<Access | null> => {
    if (!adminEmail) return null;
    try {
      const res = await fetch('/api/admin/creators/access-status', { headers: { 'x-user-email': adminEmail } });
      if (!res.ok) return null;
      const body = await res.json();
      return (body.creators || []).find((c: { id: string }) => c.id === creatorId) ?? null;
    } catch {
      // The header should never break the page.
      return null;
    }
  }, [adminEmail, creatorId]);

  // Guarded so a result arriving after the page has moved on is dropped rather
  // than setting state on a component that is no longer there.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const found = await fetchAccess();
      if (!cancelled && found) setAccess(found);
    })();
    return () => { cancelled = true; };
  }, [fetchAccess]);

  const refresh = useCallback(async () => {
    const found = await fetchAccess();
    if (found) setAccess(found);
  }, [fetchAccess]);

  if (!access) return null;

  if (access.blocker === null) {
    return (
      <p className="text-white/50 text-xs mt-1">
        Signed in {access.lastSignIn ? new Date(access.lastSignIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}
      </p>
    );
  }

  const line =
    access.blocker === 'no_account'
      ? 'No account exists for this creator, so there is nothing to sign in to.'
      : access.blocker === 'never_invited'
        ? 'Has never signed in, and has never been sent a way in.'
        : 'Has never signed in. A link went out but they have not arrived.';

  return (
    <div
      className="mt-3 mb-1 rounded-lg px-3 py-2.5"
      style={{ background: 'rgba(255,186,6,0.14)', border: '1px solid rgba(255,186,6,0.35)' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm" style={{ color: '#ffd97a' }}>{line}</p>
        {access.blocker !== 'no_account' && (
          <CreatorInviteButton
            creatorId={creatorId}
            creatorName={creatorName}
            adminEmail={adminEmail}
            lastInviteSent={access.lastInviteSent}
            compact
            onSent={refresh}
          />
        )}
      </div>
    </div>
  );
}
