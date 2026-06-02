'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useHub } from './HubContext';
import { ArrowLeft } from 'lucide-react';

const BANNER_H = 28;

/**
 * Slim gold banner pinned above the Hub nav for admin team members.
 * Sets --admin-banner-h on <html> so the nav can offset itself.
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
        if (r.ok) {
          setIsAdmin(true);
          document.documentElement.style.setProperty('--admin-banner-h', `${BANNER_H}px`);
        }
      })
      .catch(() => {});

    return () => {
      document.documentElement.style.removeProperty('--admin-banner-h');
    };
  }, [user?.id, user?.email]);

  if (!isAdmin) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center"
      style={{
        height: BANNER_H,
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
