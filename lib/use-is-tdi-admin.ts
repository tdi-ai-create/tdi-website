'use client';

import { useEffect, useState } from 'react';

/**
 * Client-side admin check for the current session.
 *
 * Replaces inline `email.endsWith('@teachersdeserveit.com')` tests, which hid
 * admin controls from team members on other domains. Resolves against
 * tdi_team_members via /api/admin/whoami.
 *
 * Returns false until the check resolves, so controls appear rather than
 * flicker away.
 */
export function useIsTDIAdmin(enabled: boolean = true): boolean {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsAdmin(false);
      return;
    }

    let cancelled = false;

    fetch('/api/admin/whoami')
      .then(res => (res.ok ? res.json() : { isAdmin: false }))
      .then(data => {
        if (!cancelled) setIsAdmin(data.isAdmin === true);
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return isAdmin;
}
