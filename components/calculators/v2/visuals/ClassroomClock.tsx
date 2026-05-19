'use client';

interface ClassroomClockProps {
  variant?: 'side-by-side' | 'tdi-only' | 'proof-strip';
  className?: string;
}

export function ClassroomClock({ variant = 'side-by-side', className = '' }: ClassroomClockProps) {
  if (variant === 'proof-strip') {
    return (
      <div className={`classroom-clock-proof-strip ${className}`} style={{
        background: '#fafaf9',
        border: '1px solid #e5e5e5',
        borderRadius: 12,
        padding: '22px 24px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 18,
        }}>
          <div>
            <div style={{
              fontSize: 10,
              color: '#737373',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontWeight: 700,
              marginBottom: 2,
            }}>
              Why those numbers
            </div>
            <div style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: 17,
              fontWeight: 600,
              color: '#1e2749',
            }}>
              Same money. Two completely different speeds.
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#737373', fontStyle: 'italic' }}>
            Across all TDI partner schools
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Traditional */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: 12,
            background: 'white',
            border: '1px solid #e5e5e5',
            borderRadius: 10,
          }}>
            <MiniTraditionalClock />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{
                fontSize: 10,
                color: '#737373',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontWeight: 700,
                marginBottom: 4,
              }}>
                Traditional PD
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{
                  fontFamily: 'Fraunces, Georgia, serif',
                  fontSize: 32,
                  fontWeight: 700,
                  color: '#1e2749',
                  lineHeight: 1,
                }}>
                  10%
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#737373', marginTop: 4 }}>over 365 days</div>
            </div>
          </div>

          {/* TDI */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: 12,
            background: 'white',
            border: '1.5px solid #0d7377',
            borderRadius: 10,
          }}>
            <MiniTdiClock />
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{
                fontSize: 10,
                color: '#0d7377',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontWeight: 700,
                marginBottom: 4,
              }}>
                With TDI
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{
                  fontFamily: 'Fraunces, Georgia, serif',
                  fontSize: 32,
                  fontWeight: 700,
                  color: '#0d7377',
                  lineHeight: 1,
                }}>
                  75%
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#0d7377', marginTop: 4 }}>in 10 days</div>
            </div>
          </div>
        </div>

        <div style={{
          marginTop: 16,
          paddingTop: 14,
          borderTop: '1px solid #e5e5e5',
          textAlign: 'center',
        }}>
          <span style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: 16,
            fontWeight: 600,
            color: '#1e2749',
          }}>
            That&apos;s <span style={{ color: '#c2410c' }}>27x faster</span> and <span style={{ color: '#0d7377' }}>7.5x more.</span>
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'tdi-only') {
    return (
      <div className={`classroom-clock-tdi-only ${className}`} style={{ textAlign: 'center' }}>
        <TdiClock />
        <div style={{
          marginTop: 16,
          padding: '12px 20px',
          background: 'rgba(13, 115, 119, 0.06)',
          border: '1px solid #0d7377',
          borderRadius: 8,
          display: 'inline-block',
        }}>
          <div style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: 36,
            fontWeight: 700,
            color: '#1e2749',
            lineHeight: 1,
          }}>
            75%
          </div>
          <div style={{
            fontSize: 11,
            color: '#1e2749',
            fontWeight: 700,
            marginTop: 6,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}>
            in 10 days
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`classroom-clock-full ${className}`} style={{
      background: 'white',
      border: '1px solid #e5e5e5',
      borderRadius: 12,
      padding: '36px 32px 28px',
      marginBottom: 24,
    }}>
      <div style={{
        fontSize: 13,
        fontWeight: 700,
        color: '#1e2749',
        textAlign: 'center',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}>
        Where does your PD budget actually go?
      </div>
      <div style={{
        fontSize: 13,
        color: '#737373',
        textAlign: 'center',
        marginBottom: 32,
      }}>
        Same money. Two completely different speeds.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 28 }}>
        {/* TRADITIONAL */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: '#1e2749',
            fontWeight: 700,
            marginBottom: 6,
          }}>
            Traditional PD
          </div>
          <div style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: 15,
            fontWeight: 500,
            color: '#1e2749',
            fontStyle: 'italic',
            marginBottom: 20,
          }}>
            &ldquo;It&rsquo;ll happen eventually&rdquo;
          </div>

          <TraditionalClock />

          <div style={{
            marginTop: 18,
            padding: '12px 18px',
            background: '#fafaf9',
            border: '1px solid #e5e5e5',
            borderRadius: 8,
            display: 'inline-block',
          }}>
            <div style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: 42,
              fontWeight: 700,
              color: '#1e2749',
              lineHeight: 1,
            }}>
              10%
            </div>
            <div style={{
              fontSize: 11,
              color: '#1e2749',
              fontWeight: 700,
              marginTop: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}>
              of teachers using it
            </div>
          </div>
        </div>

        {/* TDI */}
        <div style={{ textAlign: 'center', position: 'relative' }}>
          <div style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: '#1e2749',
            fontWeight: 700,
            marginBottom: 6,
          }}>
            With TDI
          </div>
          <div style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: 15,
            fontWeight: 500,
            color: '#1e2749',
            fontStyle: 'italic',
            marginBottom: 20,
          }}>
            &ldquo;Done before lunch on day ten&rdquo;
          </div>

          <TdiClock />

          <div style={{
            marginTop: 18,
            padding: '12px 18px',
            background: 'rgba(13, 115, 119, 0.06)',
            border: '1px solid #0d7377',
            borderRadius: 8,
            display: 'inline-block',
          }}>
            <div style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: 42,
              fontWeight: 700,
              color: '#1e2749',
              lineHeight: 1,
            }}>
              75%
            </div>
            <div style={{
              fontSize: 11,
              color: '#1e2749',
              fontWeight: 700,
              marginTop: 6,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}>
              of teachers using it
            </div>
          </div>
        </div>
      </div>

      {/* Bottom callout */}
      <div style={{
        background: '#1e2749',
        backgroundImage: 'linear-gradient(135deg, #1e2749 0%, #0a0f1e 100%)',
        color: 'white',
        padding: '24px 28px',
        borderRadius: 10,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 50,
          height: 3,
          background: '#ffba06',
        }} />
        <div style={{
          fontSize: 11,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#ffba06',
          fontWeight: 700,
          marginBottom: 12,
        }}>
          The bottom line
        </div>
        <div style={{
          fontFamily: 'Fraunces, Georgia, serif',
          fontSize: 20,
          fontWeight: 500,
          lineHeight: 1.4,
          marginBottom: 14,
        }}>
          Traditional PD spends <span style={{ color: '#ffba06', fontWeight: 700 }}>365 days</span> reaching <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>10%.</span>
          <br />
          TDI spends <span style={{ color: '#ffba06', fontWeight: 700 }}>10 days</span> reaching <span style={{ color: '#14a098', fontWeight: 700 }}>75%.</span>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 14,
          padding: '10px 22px',
          background: 'rgba(255,186,6,0.12)',
          border: '1px solid rgba(255,186,6,0.3)',
          borderRadius: 999,
          marginTop: 6,
        }}>
          <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, fontWeight: 700, color: '#ffba06' }}>
            27x faster.
          </div>
          <div style={{ width: 4, height: 4, background: '#ffba06', borderRadius: '50%', opacity: 0.6 }} />
          <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, fontWeight: 700, color: '#14a098' }}>
            7.5x more.
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Internal clock face components
// ============================================

function TraditionalClock() {
  return (
    <svg width="100%" viewBox="0 0 240 240" style={{ display: 'block', margin: '0 auto', maxWidth: 240 }}>
      <defs>
        <radialGradient id="tradBezel" cx="50%" cy="50%" r="50%">
          <stop offset="85%" stopColor="#fafaf9" />
          <stop offset="100%" stopColor="#d4d4d4" />
        </radialGradient>
        <radialGradient id="tradFace" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f5f4f1" />
        </radialGradient>
        <linearGradient id="tradArc" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bdbcb6" />
          <stop offset="100%" stopColor="#9a9994" />
        </linearGradient>
      </defs>

      <circle cx="120" cy="120" r="115" fill="url(#tradBezel)" stroke="#1e2749" strokeWidth="0.5" opacity="0.4" />
      <circle cx="120" cy="120" r="110" fill="none" stroke="#d4d4d4" strokeWidth="0.5" />
      <circle cx="120" cy="120" r="102" fill="url(#tradFace)" stroke="#1e2749" strokeWidth="1.5" />

      <MinuteTicks />
      <HourTicks />

      <path d="M 120 32 A 88 88 0 0 1 173 49 L 120 120 Z" fill="url(#tradArc)" opacity="0.85" />

      <text x="120" y="155" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontSize="9" fontWeight="700" fill="#1e2749" letterSpacing="3">SCHOOL YEAR</text>
      <text x="120" y="172" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontSize="22" fontWeight="700" fill="#1e2749">365 days</text>

      <path d="M 120 120 L 117 38 L 120 30 L 123 38 Z" fill="#1e2749" transform="rotate(36 120 120)" />
      <circle cx="120" cy="120" r="8" fill="#1e2749" />
      <circle cx="120" cy="120" r="3" fill="#ffba06" />
    </svg>
  );
}

function TdiClock() {
  return (
    <svg width="100%" viewBox="0 0 240 240" style={{ display: 'block', margin: '0 auto', maxWidth: 240 }}>
      <defs>
        <radialGradient id="tdiBezel" cx="50%" cy="50%" r="50%">
          <stop offset="85%" stopColor="#fdf9ed" />
          <stop offset="100%" stopColor="#ffba06" />
        </radialGradient>
        <radialGradient id="tdiFace" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f7f5f0" />
        </radialGradient>
        <linearGradient id="tdiArc" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14a098" />
          <stop offset="100%" stopColor="#0d7377" />
        </linearGradient>
        <linearGradient id="goldArc" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffd54a" />
          <stop offset="100%" stopColor="#ffba06" />
        </linearGradient>
      </defs>

      <circle cx="120" cy="120" r="115" fill="url(#tdiBezel)" stroke="#1e2749" strokeWidth="0.5" opacity="0.6" />
      <circle cx="120" cy="120" r="110" fill="none" stroke="#ffba06" strokeWidth="0.5" />
      <circle cx="120" cy="120" r="102" fill="url(#tdiFace)" stroke="#1e2749" strokeWidth="1.5" />

      <MinuteTicks />
      <HourTicks />

      <path d="M 120 32 A 88 88 0 1 1 32 120 L 120 120 Z" fill="url(#tdiArc)" opacity="0.92" />
      <path d="M 120 32 A 88 88 0 0 1 162.3 43.5 L 120 120 Z" fill="url(#goldArc)" opacity="0.98" />

      <text x="120" y="155" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontSize="9" fontWeight="700" fill="#1e2749" letterSpacing="3">FIRST WAVE</text>
      <text x="120" y="172" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontSize="22" fontWeight="700" fill="#1e2749">10 days</text>

      <path d="M 120 120 L 117 38 L 120 30 L 123 38 Z" fill="#1e2749" transform="rotate(270 120 120)" />
      <circle cx="120" cy="120" r="8" fill="#1e2749" />
      <circle cx="120" cy="120" r="3" fill="#ffba06" />
    </svg>
  );
}

function MiniTraditionalClock() {
  return (
    <svg width="76" height="76" viewBox="0 0 240 240" style={{ flexShrink: 0 }}>
      <defs>
        <radialGradient id="tradBezProof" cx="50%" cy="50%" r="50%">
          <stop offset="85%" stopColor="#fafaf9" />
          <stop offset="100%" stopColor="#d4d4d4" />
        </radialGradient>
        <radialGradient id="tradFaceProof" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f5f4f1" />
        </radialGradient>
      </defs>
      <circle cx="120" cy="120" r="115" fill="url(#tradBezProof)" stroke="#1e2749" strokeWidth="0.8" opacity="0.4" />
      <circle cx="120" cy="120" r="102" fill="url(#tradFaceProof)" stroke="#1e2749" strokeWidth="2" />
      <g stroke="#1e2749" strokeWidth="3" strokeLinecap="round">
        <line x1="120" y1="22" x2="120" y2="40" />
        <line x1="218" y1="120" x2="206" y2="120" />
        <line x1="120" y1="218" x2="120" y2="206" />
        <line x1="22" y1="120" x2="34" y2="120" />
      </g>
      <path d="M 120 32 A 88 88 0 0 1 173 49 L 120 120 Z" fill="#9a9994" opacity="0.85" />
      <path d="M 120 120 L 115 38 L 120 28 L 125 38 Z" fill="#1e2749" transform="rotate(36 120 120)" />
      <circle cx="120" cy="120" r="12" fill="#1e2749" />
      <circle cx="120" cy="120" r="5" fill="#ffba06" />
    </svg>
  );
}

function MiniTdiClock() {
  return (
    <svg width="76" height="76" viewBox="0 0 240 240" style={{ flexShrink: 0 }}>
      <defs>
        <radialGradient id="tdiBezProof" cx="50%" cy="50%" r="50%">
          <stop offset="85%" stopColor="#fdf9ed" />
          <stop offset="100%" stopColor="#ffba06" />
        </radialGradient>
        <radialGradient id="tdiFaceProof" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f7f5f0" />
        </radialGradient>
        <linearGradient id="tdiArcProof" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14a098" />
          <stop offset="100%" stopColor="#0d7377" />
        </linearGradient>
        <linearGradient id="goldArcProof" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffd54a" />
          <stop offset="100%" stopColor="#ffba06" />
        </linearGradient>
      </defs>
      <circle cx="120" cy="120" r="115" fill="url(#tdiBezProof)" stroke="#1e2749" strokeWidth="0.8" opacity="0.6" />
      <circle cx="120" cy="120" r="102" fill="url(#tdiFaceProof)" stroke="#1e2749" strokeWidth="2" />
      <g stroke="#1e2749" strokeWidth="3" strokeLinecap="round">
        <line x1="120" y1="22" x2="120" y2="40" />
        <line x1="218" y1="120" x2="206" y2="120" />
        <line x1="120" y1="218" x2="120" y2="206" />
        <line x1="22" y1="120" x2="34" y2="120" />
      </g>
      <path d="M 120 32 A 88 88 0 1 1 32 120 L 120 120 Z" fill="url(#tdiArcProof)" opacity="0.92" />
      <path d="M 120 32 A 88 88 0 0 1 162.3 43.5 L 120 120 Z" fill="url(#goldArcProof)" opacity="0.98" />
      <path d="M 120 120 L 115 38 L 120 28 L 125 38 Z" fill="#1e2749" transform="rotate(270 120 120)" />
      <circle cx="120" cy="120" r="12" fill="#1e2749" />
      <circle cx="120" cy="120" r="5" fill="#ffba06" />
    </svg>
  );
}

function MinuteTicks() {
  const ticks = [
    [120, 22, 120, 26], [130.2, 22.5, 129.8, 26.5], [140.3, 24, 139.4, 27.9],
    [150.2, 26.5, 148.9, 30.3], [159.7, 30, 158, 33.6], [178.9, 40.5, 176.5, 43.7],
    [187.6, 47.3, 184.8, 50.2], [195.5, 54.7, 192.5, 57.2], [202.5, 62.6, 199.2, 64.8],
    [208.8, 71, 205.3, 72.8], [218, 89.8, 214.1, 91.1], [221, 100, 217, 100.6],
    [223, 110.2, 219, 110.4], [223, 129.8, 219, 129.6], [221, 140, 217, 139.4],
    [218, 150.2, 214.1, 148.9], [208.8, 169, 205.3, 167.2], [202.5, 177.4, 199.2, 175.2],
    [195.5, 185.3, 192.5, 182.8], [187.6, 192.7, 184.8, 189.8], [178.9, 199.5, 176.5, 196.3],
    [159.7, 210, 158, 206.4], [150.2, 213.5, 148.9, 209.7], [140.3, 216, 139.4, 212.1],
    [130.2, 217.5, 129.8, 213.5], [109.8, 217.5, 110.2, 213.5], [99.7, 216, 100.6, 212.1],
    [89.8, 213.5, 91.1, 209.7], [80.3, 210, 82, 206.4], [61.1, 199.5, 63.5, 196.3],
    [52.4, 192.7, 55.2, 189.8], [44.5, 185.3, 47.5, 182.8], [37.5, 177.4, 40.8, 175.2],
    [31.2, 169, 34.7, 167.2], [22, 150.2, 25.9, 148.9], [19, 140, 23, 139.4],
    [17, 129.8, 21, 129.6], [17, 110.2, 21, 110.4], [19, 100, 23, 100.6],
    [22, 89.8, 25.9, 91.1], [31.2, 71, 34.7, 72.8], [37.5, 62.6, 40.8, 64.8],
    [44.5, 54.7, 47.5, 57.2], [52.4, 47.3, 55.2, 50.2], [61.1, 40.5, 63.5, 43.7],
    [80.3, 30, 82, 33.6], [89.8, 26.5, 91.1, 30.3], [99.7, 24, 100.6, 27.9],
    [109.8, 22.5, 110.2, 26.5],
  ];
  return (
    <g stroke="#a3a3a3" strokeWidth="0.5">
      {ticks.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
      ))}
    </g>
  );
}

function HourTicks() {
  const ticks = [
    [120, 22, 120, 34], [169, 35.1, 163, 45.5], [204.9, 71, 194.5, 77],
    [218, 120, 206, 120], [204.9, 169, 194.5, 163], [169, 204.9, 163, 194.5],
    [120, 218, 120, 206], [71, 204.9, 77, 194.5], [35.1, 169, 45.5, 163],
    [22, 120, 34, 120], [35.1, 71, 45.5, 77], [71, 35.1, 77, 45.5],
  ];
  return (
    <g stroke="#1e2749" strokeWidth="2" strokeLinecap="round">
      {ticks.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
      ))}
    </g>
  );
}
