'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useHub } from './HubContext';
import { ArrowLeft } from 'lucide-react';

/**
 * Shows a slim banner above the Hub nav for admin team members
 * with a link back to the TDI Admin Portal.
 *
 * Uses a non-fixed div in the document flow. The parent layout
 * places this before the nav, so it naturally sits above it.
 */
export default function AdminBanner() {
  const { user } = useHub();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user?.id || !user?.email) return;

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
      className="w-full flex items-center justify-center py-1.5 px-4"
      style={{
        background: '#E8B84B',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <Link
        href="/tdi-admin/hub"
        className="flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
        style={{ color: '#1B2A4A' }}
      >
        <ArrowLeft size={12} />
        Return to TDI Admin Portal
      </Link>
    </div>
  );
}
