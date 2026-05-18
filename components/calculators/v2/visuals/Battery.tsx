'use client';

interface BatteryProps {
  value: number;       // 1-10
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const joyColorMap: Record<number, { main: string; cls: 'lit-gold' | 'lit-teal' | 'empty'; cellsLit: number }> = {
  1:  { main: '#737373', cls: 'lit-gold', cellsLit: 1 },
  2:  { main: '#737373', cls: 'lit-gold', cellsLit: 1 },
  3:  { main: '#a16207', cls: 'lit-gold', cellsLit: 2 },
  4:  { main: '#ffba06', cls: 'lit-gold', cellsLit: 2 },
  5:  { main: '#ffba06', cls: 'lit-gold', cellsLit: 3 },
  6:  { main: '#ca8a04', cls: 'lit-gold', cellsLit: 3 },
  7:  { main: '#14a098', cls: 'lit-teal', cellsLit: 4 },
  8:  { main: '#0d7377', cls: 'lit-teal', cellsLit: 4 },
  9:  { main: '#0d7377', cls: 'lit-teal', cellsLit: 5 },
  10: { main: '#0a5d61', cls: 'lit-teal', cellsLit: 5 },
};

const batterySizeMap = {
  small:  { wrapW: 130, wrapH: 64,  bodyW: 116, padding: 5,  gap: 4, capW: 8,  capH: 28 },
  medium: { wrapW: 200, wrapH: 90,  bodyW: 184, padding: 8,  gap: 6, capW: 12, capH: 42 },
  large:  { wrapW: 240, wrapH: 110, bodyW: 220, padding: 10, gap: 7, capW: 14, capH: 50 },
};

export function Battery({ value, size = 'medium', className = '' }: BatteryProps) {
  const config = joyColorMap[value] || joyColorMap[5];
  const dims = batterySizeMap[size];
  const cellFill = config.cls === 'lit-teal'
    ? 'linear-gradient(180deg, #14a098, #0d7377)'
    : 'linear-gradient(180deg, #ffba06, #e6a505)';

  return (
    <div className={`battery-wrap ${className}`} style={{ position: 'relative', display: 'inline-block', width: dims.wrapW, height: dims.wrapH }}>
      <div style={{
        height: '100%',
        width: dims.bodyW,
        border: '3px solid #1e2749',
        borderRadius: 10,
        background: 'white',
        padding: dims.padding,
        gap: dims.gap,
        display: 'flex',
        overflow: 'hidden',
      }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            flex: 1,
            background: i < config.cellsLit ? cellFill : '#e5e5e5',
            borderRadius: 3,
            transition: 'background 0.4s ease-out',
          }} />
        ))}
      </div>
      <div style={{
        position: 'absolute',
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        width: dims.capW,
        height: dims.capH,
        background: '#1e2749',
        borderRadius: '0 4px 4px 0',
      }} />
    </div>
  );
}
