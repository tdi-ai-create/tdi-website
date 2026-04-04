'use client';
import { useState } from 'react';

interface PricingButtonProps {
  tier: 'essentials' | 'professional' | 'all_access';
  label: string;
  className?: string;
}

export function PricingButton({ tier, label, className }: PricingButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const resp = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      const { url, error } = await resp.json();
      if (url) {
        window.location.href = url;
      } else {
        console.error('Checkout error:', error);
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={className ?? 'px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50'}
    >
      {loading ? 'Loading...' : label}
    </button>
  );
}
