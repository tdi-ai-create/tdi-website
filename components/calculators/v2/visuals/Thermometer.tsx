'use client';

interface ThermometerProps {
  value: number;       // 1-10
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const stressColorMap: Record<number, { main: string; light: string }> = {
  1:  { main: '#80a4ed', light: '#a8c0f0' },
  2:  { main: '#80a4ed', light: '#a8c0f0' },
  3:  { main: '#80a4ed', light: '#b8d0f5' },
  4:  { main: '#ffba06', light: '#ffd54a' },
  5:  { main: '#ffba06', light: '#ffd54a' },
  6:  { main: '#ff9438', light: '#ffb46c' },
  7:  { main: '#F96767', light: '#fb9090' },
  8:  { main: '#c2410c', light: '#fbbf9c' },
  9:  { main: '#9a3209', light: '#f87171' },
  10: { main: '#7c2d12', light: '#f87171' },
};

const sizeMap = {
  small:  { wrapW: 50,  wrapH: 130, tubeW: 18, tubeH: 100, bulb: 36, markRight: -16, markTop: 6,  markBottom: 40, markW: 8 },
  medium: { wrapW: 80,  wrapH: 200, tubeW: 28, tubeH: 158, bulb: 52, markRight: -18, markTop: 10, markBottom: 58, markW: 12 },
  large:  { wrapW: 100, wrapH: 260, tubeW: 36, tubeH: 208, bulb: 68, markRight: -22, markTop: 12, markBottom: 76, markW: 14 },
};

export function Thermometer({ value, size = 'medium', className = '' }: ThermometerProps) {
  const color = stressColorMap[value] || stressColorMap[5];
  const fillPercent = Math.min(96, Math.max(8, value * 10));
  const dims = sizeMap[size];

  return (
    <div className={`thermometer-wrap ${className}`} style={{ position: 'relative', display: 'inline-block', width: dims.wrapW, height: dims.wrapH }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: dims.tubeW,
        height: dims.tubeH,
        background: 'white',
        border: '2.5px solid #1e2749',
        borderRadius: '14px 14px 0 0',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${fillPercent}%`,
          background: `linear-gradient(180deg, ${color.light}, ${color.main})`,
          transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s',
        }} />
      </div>
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: dims.bulb,
        height: dims.bulb,
        background: color.main,
        border: '2.5px solid #1e2749',
        borderRadius: '50%',
        transition: 'background 0.4s',
      }} />
      <div style={{
        position: 'absolute',
        right: dims.markRight,
        top: dims.markTop,
        bottom: dims.markBottom,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ height: 2, width: dims.markW, background: '#1e2749', opacity: 0.35 }} />
        ))}
      </div>
    </div>
  );
}
