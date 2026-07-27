'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function SwagSuccessPage() {
  useEffect(() => {
    // Send order notification email
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    if (sessionId) {
      fetch('/api/swag/order-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      }).catch(() => {});
    }
  }, []);

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif", background: '#FAFAF8',
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: 'white', borderRadius: 20, padding: '60px 48px',
        maxWidth: 520, width: '100%', textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: '#D1FAE5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>

        <h1 style={{
          fontFamily: "'Source Serif 4', serif", fontSize: 32, fontWeight: 700,
          color: '#1e2749', marginBottom: 12,
        }}>
          Order confirmed!
        </h1>
        <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.6, marginBottom: 8 }}>
          Thank you for supporting the mission.
        </p>
        <p style={{ fontSize: 14, color: '#9CA3AF', lineHeight: 1.6, marginBottom: 32 }}>
          Your order is being prepared and will ship in 3-5 business days. You will receive a shipping confirmation email with tracking info.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/swag" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#1e2749', color: 'white', padding: '14px 28px',
            borderRadius: 50, fontSize: 14, fontWeight: 700, textDecoration: 'none',
          }}>
            Continue Shopping
          </Link>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'white', color: '#1e2749', padding: '14px 28px',
            borderRadius: 50, fontSize: 14, fontWeight: 700, textDecoration: 'none',
            border: '2px solid #E5E7EB',
          }}>
            Back to TDI
          </Link>
        </div>
      </div>
    </div>
  );
}
