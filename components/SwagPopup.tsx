'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const C = {
  navy: '#1E2A4A', yellow: '#F9B91B', muted: '#6B7280',
  gray: '#F5F5F5', white: '#FFFFFF', border: '#E5E7EB',
};

const EXCLUDED_PATHS = ['/swag', '/tdi-admin', '/hub', '/creator-portal', '/partners', '/admin', '/invoice', '/for-schools', '/love-notes', '/join'];

function getPopupImages(pathname: string | null): { src: string; alt: string }[] {
  // Hub / educator pages
  if (pathname?.startsWith('/join') || pathname?.startsWith('/pd-diagnostic')) {
    return [
      { src: '/images/swag/hard-parts-tote-new-1.webp', alt: 'The Hard Parts tote' },
      { src: '/images/swag/intermission-knit.webp', alt: 'The Needed Intermission tee' },
    ];
  }
  // Schools / partnership pages
  if (pathname?.startsWith('/for-schools')) {
    return [
      { src: '/images/swag/staff-tee-green-front.webp', alt: 'The Staff tee' },
      { src: '/images/swag/hard-parts-tote-new-2.webp', alt: 'The Hard Parts tote' },
    ];
  }
  // Default: main site / marketing pages
  return [
    { src: '/images/swag/ask-me-black-front.webp', alt: 'Ask Me tee' },
    { src: '/images/swag/good-pens-tumbler-new-1.webp', alt: 'The Good Pens tumbler' },
  ];
}
const STORAGE_KEY = 'tdi-swag-popup-dismissed';
const DELAY_MS = 45000; // 45 seconds before showing

export function SwagPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  const isExcluded = EXCLUDED_PATHS.some(path => pathname?.startsWith(path));

  useEffect(() => {
    if (isExcluded) return;

    // Don't show if already dismissed this session
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {}

    const timer = setTimeout(() => {
      // Don't show if another popup is already visible
      const otherPopup = document.querySelector('[data-popup-active="true"]');
      if (otherPopup) return;
      setIsVisible(true);
    }, DELAY_MS);
    return () => clearTimeout(timer);
  }, [isExcluded]);

  const dismiss = () => {
    setIsVisible(false);
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch {}
  };

  if (!isVisible) return null;

  return (
    <div data-popup-active="true" onClick={dismiss} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.white, borderRadius: 12, overflow: 'hidden',
        maxWidth: 480, width: '100%', position: 'relative',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        {/* Close button */}
        <button onClick={dismiss} style={{
          position: 'absolute', top: 12, right: 12, zIndex: 10,
          width: 32, height: 32, borderRadius: '50%',
          background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer',
          fontSize: 16, color: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }}>x</button>

        {/* Two product images - contextual based on page section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, height: 220, overflow: 'hidden' }}>
          {getPopupImages(pathname).map((img, i) => (
            <img key={i} src={img.src} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: 24, textAlign: 'center' }}>
          <div style={{
            display: 'inline-block', background: C.yellow, color: C.navy,
            fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase',
            padding: '4px 12px', borderRadius: 20, marginBottom: 12,
          }}>TDI Swag Drop</div>

          <h2 style={{
            fontFamily: "'Source Serif 4', serif", fontSize: 22, fontWeight: 700,
            color: C.navy, margin: '0 0 6px',
          }}>The TDI Swag Shop is Open</h2>

          <p style={{ fontSize: 14, color: C.muted, margin: '0 0 16px', lineHeight: 1.4 }}>
            Tees, hoodies, tumblers, and totes that actually get what you do. Use code for 20% off.
          </p>

          <div style={{
            display: 'inline-block', background: C.gray, color: C.navy,
            fontFamily: 'monospace', fontSize: 16, fontWeight: 700,
            padding: '8px 20px', borderRadius: 6, marginBottom: 16,
            letterSpacing: 2,
          }}>TEAMTDI</div>

          <a href="/swag" style={{
            display: 'block', width: '100%', background: C.navy, color: C.white,
            padding: 14, border: 'none', borderRadius: 8, fontSize: 15,
            fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            textDecoration: 'none', textAlign: 'center',
          }}>Shop the Collection</a>

          <button onClick={dismiss} style={{
            display: 'block', margin: '10px auto 0', fontSize: 12, color: '#9CA3AF',
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}>I'll explore later</button>
        </div>
      </div>
    </div>
  );
}
