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
        maxWidth: 560, width: '100%', textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        {/* Gold accent bar */}
        <div style={{
          width: 48, height: 4, borderRadius: 2, background: '#F9B91B',
          margin: '0 auto 28px',
        }} />

        {/* Checkmark */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
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
          You just made our day.
        </h1>
        <p style={{ fontSize: 16, color: '#1e2749', lineHeight: 1.7, marginBottom: 6, fontWeight: 500 }}>
          Your order is confirmed and on its way to production.
        </p>
        <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.7, marginBottom: 24 }}>
          Every piece in this shop exists because educators like you made us believe it was worth building. Wear it loud.
        </p>

        {/* Product illustration */}
        <div style={{
          width: '100%', maxWidth: 280, margin: '0 auto 28px',
          borderRadius: 12, overflow: 'hidden', background: '#F5F5F5',
        }}>
          <img
            src="/images/swag/hero-contract.png"
            alt="TDI Swag"
            style={{ width: '100%', height: 160, objectFit: 'cover', objectPosition: 'center 40%' }}
          />
        </div>

        {/* Shipping info */}
        <p style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.6, marginBottom: 24 }}>
          Expect shipping in 3 to 5 business days. You will get a confirmation email with tracking info once it ships.
        </p>

        {/* Mission note */}
        <div style={{
          background: '#F8F7F4', borderRadius: 10, padding: '16px 20px',
          marginBottom: 28, borderLeft: '3px solid #F9B91B',
          textAlign: 'left',
        }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#1e2749', margin: '0 0 4px' }}>
            What your purchase supports
          </p>
          <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>
            TDI builds free professional development, community tools, and recognition systems for educators. Every order keeps that work going, and it keeps us showing up for the people who show up for kids.
          </p>
        </div>

        {/* Social share prompt */}
        <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginBottom: 28, fontStyle: 'italic' }}>
          If you feel like sharing, tag us <span style={{ fontWeight: 700, color: '#1e2749' }}>@teachersdeserveit</span> when it arrives. We love seeing this stuff in the wild.
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
