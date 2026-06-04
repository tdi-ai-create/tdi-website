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
      <span style={{ color: '#ffba06', marginRight: 8, fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' as const, background: 'rgba(255,186,6,0.15)', padding: '2px 8px', borderRadius: 4 }}>NEW</span>
      The TDI Learning Hub is live. Free PD tools for every educator.
      <Link href="/hub" style={{ color: '#ffba06', fontWeight: 600, marginLeft: 8, textDecoration: 'none' }}>
        Get started →
      </Link>
    </div>
  )
}
