'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MovementBanner() {
  const [count, setCount] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('movement-banner-dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    fetch('/api/petition/count')
      .then(r => r.json())
      .then(data => setCount(data.count));
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('movement-banner-dismissed', 'true');
  };

  if (dismissed) return null;

  return (
    <div style={{
      backgroundColor: '#1D9E75',
      color: 'white',
      padding: '10px 16px',
      textAlign: 'center',
      position: 'relative',
      fontSize: '14px',
      fontFamily: 'sans-serif',
    }}>
      <Link href="/movement" style={{
        color: 'white',
        textDecoration: 'none',
        fontWeight: '500',
      }}>
        {count !== null && count > 0
          ? `${count.toLocaleString()} educators have signed the Teachers Deserve Voice and Choice petition. Add your name.`
          : 'Join the Teachers Deserve Voice and Choice petition. Sign today.'
        }
        <span style={{ marginLeft: '6px', fontWeight: '700' }}>&rarr;</span>
      </Link>
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer',
          fontSize: '18px',
          padding: '4px 8px',
          lineHeight: '1',
        }}
        aria-label="Dismiss banner"
      >
        &times;
      </button>
    </div>
  );
}
