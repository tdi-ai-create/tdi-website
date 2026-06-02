'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useHub } from './HubContext';
import { ArrowLeft } from 'lucide-react';

/**
 * Shows a slim banner at the top of the Hub for admin team members
 * with a link back to the TDI Admin Portal.
 */
export default function AdminBanner() {
  const { user } = useHub();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user?.id || !user?.email) return;

    // Check if this user is a team member
    fetch('/api/tdi-admin/check-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, email: user.email }),
    })
      .then((r) => {
        if (r.ok) setIsAdmin(true);
      })
      .catch(() => {});
  }, [user?.id, user?.email]);

  if (!isAdmin) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-1.5 px-4"
      style={{
        background: '#1B2A4A',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <Link
        href="/tdi-admin/hub"
        className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-80"
        style={{ color: 'rgba(255,255,255,0.9)' }}
      >
        <ArrowLeft size={12} />
        Return to TDI Admin Portal
      </Link>
    </div>
  );
}
