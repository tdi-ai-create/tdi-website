'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function UnpausePage({ params }: { params: Promise<{ token: string }> }) {
  const [status, setStatus] = useState<'loading' | 'success' | 'already_active' | 'error'>('loading')

  useEffect(() => {
    async function unpause() {
      try {
        const { token } = await params
        const res = await fetch(`/api/unpause/${token}`, { method: 'POST' })
        const data = await res.json()
        if (data.success) {
          setStatus('success')
        } else if (data.already_active) {
          setStatus('already_active')
        } else {
          setStatus('error')
        }
      } catch {
        setStatus('error')
      }
    }
    unpause()
  }, [params])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F5F0', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 480, width: '100%', padding: 40, background: 'white', borderRadius: 20, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        {status === 'loading' && (
          <p style={{ color: '#6B7280', fontSize: 15 }}>Processing...</p>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>Welcome back!</div>
            <p style={{ color: '#1e2749', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>You&apos;re unpaused.</p>
            <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24 }}>Your studio is waiting for you exactly as you left it.</p>
            <Link href="/creator-portal" style={{ display: 'inline-block', padding: '12px 28px', background: '#1e2749', color: 'white', borderRadius: 12, fontWeight: 600, textDecoration: 'none' }}>
              Go to your studio
            </Link>
          </>
        )}
        {status === 'already_active' && (
          <>
            <p style={{ color: '#1e2749', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No need to unpause!</p>
            <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24 }}>You&apos;re already active. Head to your studio anytime.</p>
            <Link href="/creator-portal" style={{ display: 'inline-block', padding: '12px 28px', background: '#1e2749', color: 'white', borderRadius: 12, fontWeight: 600, textDecoration: 'none' }}>
              Go to your studio
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <p style={{ color: '#1e2749', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Something went wrong</p>
            <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24 }}>Please contact rae@teachersdeserveit.com for help.</p>
          </>
        )}
      </div>
    </div>
  )
}
