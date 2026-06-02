'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import type { Recognition } from '@/lib/hub/recognitions';
import { useTranslation } from '@/lib/hub/useTranslation';

interface RecognitionCelebrationProps {
  recognition: Recognition;
  onDismiss: () => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; accent: string; glow: string }> = {
  growth: { bg: '#FFF8E7', accent: '#E8B84B', glow: 'rgba(232, 184, 75, 0.3)' },
  showing_up: { bg: '#E0F7F6', accent: '#2A9D8F', glow: 'rgba(42, 157, 143, 0.3)' },
  community: { bg: '#EDE9FE', accent: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.3)' },
};

export default function RecognitionCelebration({ recognition, onDismiss }: RecognitionCelebrationProps) {
  const { tUI } = useTranslation();
  const [visible, setVisible] = useState(false);
  const colors = CATEGORY_COLORS[recognition.category] || CATEGORY_COLORS.growth;

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: visible ? 'rgba(30, 39, 73, 0.7)' : 'rgba(30, 39, 73, 0)',
        transition: 'background 0.3s ease',
        padding: 20,
      }}
      onClick={handleDismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: 24,
          maxWidth: 420,
          width: '100%',
          overflow: 'hidden',
          boxShadow: visible ? `0 24px 80px rgba(30,39,73,0.3), 0 0 60px ${colors.glow}` : 'none',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
          opacity: visible ? 1 : 0,
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Colored header band */}
        <div
          style={{
            background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}dd)`,
            padding: '32px 28px 24px',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            style={{
              position: 'absolute', top: 12, right: 12,
              background: 'rgba(255,255,255,0.2)', border: 'none',
              borderRadius: '50%', width: 28, height: 28, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={14} style={{ color: 'white' }} />
          </button>

          {/* Star burst decoration */}
          <div style={{ marginBottom: 12 }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M24 4l4.5 13.5H42l-11 8 4.5 13.5L24 31l-11.5 8 4.5-13.5-11-8h13.5L24 4z" fill="white" fillOpacity="0.9" />
            </svg>
          </div>

          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.7)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: 6,
            }}
          >
            {tUI('Field Note Earned')}
          </p>
          <h2
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontSize: 26,
              fontWeight: 700,
              color: 'white',
              margin: 0,
            }}
          >
            {recognition.title}
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: 'rgba(255,255,255,0.8)',
              marginTop: 4,
            }}
          >
            {recognition.description}
          </p>
        </div>

        {/* Personal note */}
        <div style={{ padding: '24px 28px 20px' }}>
          <p
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontSize: 15,
              fontStyle: 'italic',
              color: '#374151',
              lineHeight: 1.6,
              margin: '0 0 6px',
            }}
          >
            &ldquo;{recognition.personalNote}&rdquo;
          </p>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              color: '#9CA3AF',
              margin: 0,
            }}
          >
            {tUI('-- The TDI Team')}
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ padding: '0 28px 24px', display: 'flex', gap: 10 }}>
          <Link
            href="/hub/certificates"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 16px',
              borderRadius: 12,
              background: colors.accent,
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              textDecoration: 'none',
            }}
            onClick={handleDismiss}
          >
            {tUI('View your Field Notes')}
          </Link>
          <button
            onClick={handleDismiss}
            style={{
              padding: '12px 16px',
              borderRadius: 12,
              background: '#F3F4F6',
              color: '#6B7280',
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif",
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {tUI('Later')}
          </button>
        </div>
      </div>
    </div>
  );
}
