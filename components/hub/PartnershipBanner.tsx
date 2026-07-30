'use client';

import { useEffect, useState } from 'react';
import { useHub } from './HubContext';
import { Building } from 'lucide-react';

const BANNER_H = 28;

/**
 * Slim teal banner pinned above the Hub nav for partnership educators.
 * Shows school name and link to their school dashboard.
 * Stacks below AdminBanner if both are present.
 */
export default function PartnershipBanner() {
  const { profile } = useHub();
  const [orgName, setOrgName] = useState<string | null>(null);

  const slug = profile?.partnership_slug;

  useEffect(() => {
    if (!slug) {
      document.documentElement.style.removeProperty('--partnership-banner-h');
      return;
    }

    document.documentElement.style.setProperty('--partnership-banner-h', `${BANNER_H}px`);

    // Fetch org name from partnership
    fetch(`/api/partners/info?slug=${slug}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.org_name) setOrgName(data.org_name);
      })
      .catch(() => {});

    return () => {
      document.documentElement.style.removeProperty('--partnership-banner-h');
    };
  }, [slug]);

  if (!slug) return null;

  return (
    <div
      className="fixed left-0 right-0 z-50 flex items-center justify-center gap-2"
      style={{
        height: BANNER_H,
        top: 'var(--admin-banner-h, 0px)',
        background: 'linear-gradient(90deg, #1B2A4A, #2d4a6a)',
        fontFamily: "'DM Sans', sans-serif",
        borderBottom: '1px solid rgba(78,205,196,0.3)',
      }}
    >
      <Building size={12} style={{ color: '#4ecdc4' }} />
      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
        {orgName || 'Your School'}
      </span>
      <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
      <a
        href={`/partners/${slug}`}
        className="text-xs font-semibold transition-opacity hover:opacity-80"
        style={{ color: '#4ecdc4', textDecoration: 'none' }}
      >
        View School Dashboard
      </a>
    </div>
  );
}
