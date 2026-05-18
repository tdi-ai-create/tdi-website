'use client';

interface FunnelProps {
  budget: number;
  variant?: 'side-by-side' | 'tdi-only';
  className?: string;
}

export function Funnel({ budget, variant = 'side-by-side', className = '' }: FunnelProps) {
  const fmt = (n: number) => '$' + Math.round(n / 1000) + 'K';
  const traditionalKeep = Math.round(budget * 0.10);
  const tdiKeep = Math.round(budget * 0.65);

  if (variant === 'tdi-only') {
    return (
      <div className={`funnel-tdi-only ${className}`} style={{ textAlign: 'center' }}>
        <svg style={{ width: '100%', maxWidth: 160, display: 'block', margin: '0 auto' }} viewBox="0 0 160 180">
          <defs>
            <linearGradient id="tdiGradOnly" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#14a098"/>
              <stop offset="100%" stopColor="#0d7377"/>
            </linearGradient>
          </defs>
          <text x="80" y="14" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontSize="11" fontWeight="700" fill="#1e2749">{fmt(budget)} IN</text>
          <path d="M 20 22 L 140 22 L 100 90 L 60 90 Z" fill="url(#tdiGradOnly)" fillOpacity="0.25" stroke="#0d7377" strokeWidth="2"/>
          <circle cx="42" cy="75" r="3" fill="#0d7377" opacity="0.4"/>
          <circle cx="118" cy="75" r="3" fill="#0d7377" opacity="0.4"/>
          <rect x="68" y="90" width="24" height="40" fill="#0d7377"/>
          <rect x="40" y="130" width="80" height="36" fill="#0d7377" stroke="#0d7377" strokeWidth="2" rx="3"/>
          <text x="80" y="148" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontSize="8" fontWeight="700" fill="white">CLASSROOM</text>
          <circle cx="65" cy="158" r="4" fill="white"/>
          <circle cx="80" cy="158" r="4" fill="white"/>
          <circle cx="95" cy="158" r="4" fill="white"/>
        </svg>
        <div style={{ marginTop: 14 }}>
          <div style={{ fontFamily: 'serif', fontSize: 28, fontWeight: 700, color: '#0d7377', lineHeight: 1, marginBottom: 4 }}>
            {fmt(tdiKeep)}
          </div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#737373', fontWeight: 600 }}>
            reaches the classroom
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`funnel-block ${className}`} style={{
      background: 'white',
      border: '1px solid #e5e5e5',
      borderRadius: 10,
      padding: '28px 24px',
      marginBottom: 24,
    }}>
      <div style={{
        fontSize: 13,
        fontWeight: 700,
        color: '#1e2749',
        textAlign: 'center',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        Where the money goes
      </div>
      <div style={{ fontSize: 12, color: '#737373', textAlign: 'center', marginBottom: 22 }}>
        {fmt(budget)} in PD spend. Where does it land?
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        {/* Traditional side */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: '#737373', marginBottom: 12 }}>
            Traditional PD
          </div>
          <svg style={{ width: '100%', maxWidth: 160, display: 'block', margin: '0 auto' }} viewBox="0 0 160 180">
            <defs>
              <linearGradient id="tradGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a3a3a3"/>
                <stop offset="100%" stopColor="#737373"/>
              </linearGradient>
            </defs>
            <text x="80" y="14" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontSize="11" fontWeight="700" fill="#1e2749">{fmt(budget)} IN</text>
            <path d="M 20 22 L 140 22 L 100 90 L 60 90 Z" fill="url(#tradGrad)" fillOpacity="0.15" stroke="#737373" strokeWidth="2"/>
            <circle cx="35" cy="62" r="4" fill="#a3a3a3"/>
            <circle cx="125" cy="62" r="4" fill="#a3a3a3"/>
            <circle cx="48" cy="78" r="3" fill="#a3a3a3"/>
            <circle cx="112" cy="78" r="3" fill="#a3a3a3"/>
            <circle cx="30" cy="100" r="3" fill="#a3a3a3" opacity="0.7"/>
            <circle cx="130" cy="100" r="3" fill="#a3a3a3" opacity="0.7"/>
            <circle cx="40" cy="115" r="3" fill="#a3a3a3" opacity="0.5"/>
            <circle cx="120" cy="115" r="3" fill="#a3a3a3" opacity="0.5"/>
            <rect x="74" y="90" width="12" height="40" fill="#737373"/>
            <rect x="50" y="130" width="60" height="36" fill="white" stroke="#737373" strokeWidth="2" rx="3"/>
            <text x="80" y="148" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontSize="8" fontWeight="700" fill="#737373">CLASSROOM</text>
            <circle cx="80" cy="155" r="4" fill="#737373"/>
          </svg>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontFamily: 'serif', fontSize: 28, fontWeight: 700, color: '#737373', lineHeight: 1, marginBottom: 4 }}>
              {fmt(traditionalKeep)}
            </div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#737373', fontWeight: 600 }}>
              reaches the classroom
            </div>
          </div>
        </div>

        {/* TDI side */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: '#737373', marginBottom: 12 }}>
            With TDI
          </div>
          <svg style={{ width: '100%', maxWidth: 160, display: 'block', margin: '0 auto' }} viewBox="0 0 160 180">
            <defs>
              <linearGradient id="tdiGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#14a098"/>
                <stop offset="100%" stopColor="#0d7377"/>
              </linearGradient>
            </defs>
            <text x="80" y="14" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontSize="11" fontWeight="700" fill="#1e2749">{fmt(budget)} IN</text>
            <path d="M 20 22 L 140 22 L 100 90 L 60 90 Z" fill="url(#tdiGrad)" fillOpacity="0.25" stroke="#0d7377" strokeWidth="2"/>
            <circle cx="42" cy="75" r="3" fill="#0d7377" opacity="0.4"/>
            <circle cx="118" cy="75" r="3" fill="#0d7377" opacity="0.4"/>
            <rect x="68" y="90" width="24" height="40" fill="#0d7377"/>
            <rect x="40" y="130" width="80" height="36" fill="#0d7377" stroke="#0d7377" strokeWidth="2" rx="3"/>
            <text x="80" y="148" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontSize="8" fontWeight="700" fill="white">CLASSROOM</text>
            <circle cx="65" cy="158" r="4" fill="white"/>
            <circle cx="80" cy="158" r="4" fill="white"/>
            <circle cx="95" cy="158" r="4" fill="white"/>
          </svg>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontFamily: 'serif', fontSize: 28, fontWeight: 700, color: '#0d7377', lineHeight: 1, marginBottom: 4 }}>
              {fmt(tdiKeep)}
            </div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#737373', fontWeight: 600 }}>
              reaches the classroom
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
