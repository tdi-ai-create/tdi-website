'use client'

import Link from 'next/link'

export function AnnouncementBanner() {
  return (
    <div style={{
      backgroundColor: '#1e2749',
      padding: '10px 24px',
      textAlign: 'center',
      fontSize: 13,
      color: 'white',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    }}>
      <span style={{ color: '#ffba06', marginRight: 8 }}>★</span>
      Take a peek at our new Learning Hub — launching June 2026
      <Link href="/learning" style={{ color: '#ffba06', fontWeight: 600, marginLeft: 8, textDecoration: 'none' }}>
        Explore →
      </Link>
    </div>
  )
}
