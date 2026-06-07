'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area,
  CartesianGrid,
} from 'recharts';

// ═══════════════════════════════════════════════════════
// SHARED COLORS
// ═══════════════════════════════════════════════════════
const COLORS = {
  teal: '#2A9D8F',
  gold: '#EAB308',
  blue: '#2563EB',
  purple: '#8B5CF6',
  orange: '#F97316',
  red: '#EF4444',
  green: '#10B981',
  navy: '#1e2749',
  gray: '#9CA3AF',
};

const DONUT_PALETTE = ['#2A9D8F', '#EAB308', '#2563EB', '#8B5CF6', '#F97316', '#EC4899', '#10B981', '#6366F1'];

// ═══════════════════════════════════════════════════════
// HORIZONTAL BAR CHART
// ═══════════════════════════════════════════════════════
interface HBarItem {
  label: string;
  value: number;
  color?: string;
  suffix?: string;
}

export function HorizontalBarChart({
  data,
  height,
  color = COLORS.teal,
  valueFormatter,
  tooltipLabel,
}: {
  data: HBarItem[];
  height?: number;
  color?: string;
  valueFormatter?: (v: number) => string;
  tooltipLabel?: string;
}) {
  const chartData = data.map(d => ({ name: d.label, value: d.value, fill: d.color || color, suffix: d.suffix }));
  const h = height || Math.max(data.length * 36, 120);

  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20, top: 4, bottom: 4 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={140}
          tick={{ fontSize: 12, fill: '#374151' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value: number, _name: string, props: { payload?: { suffix?: string } }) => {
            const formatted = valueFormatter ? valueFormatter(value) : `${value.toLocaleString()}${props.payload?.suffix || ''}`;
            return [formatted, tooltipLabel || ''];
          }}
          contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ═══════════════════════════════════════════════════════
// DONUT CHART
// ═══════════════════════════════════════════════════════
interface DonutSlice {
  name: string;
  value: number;
  color?: string;
}

export function DonutChart({
  data,
  size = 200,
  innerRadius = 55,
  outerRadius = 80,
  centerLabel,
  centerValue,
}: {
  data: DonutSlice[];
  size?: number;
  innerRadius?: number;
  outerRadius?: number;
  centerLabel?: string;
  centerValue?: string | number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            dataKey="value"
            stroke="none"
            paddingAngle={2}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color || DONUT_PALETTE[i % DONUT_PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [`${value.toLocaleString()} (${total > 0 ? ((value / total) * 100).toFixed(0) : 0}%)`, name]}
            contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          />
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue !== undefined) && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          textAlign: 'center', pointerEvents: 'none',
        }}>
          {centerValue !== undefined && <p style={{ fontSize: 22, fontWeight: 700, color: COLORS.navy, lineHeight: 1 }}>{centerValue}</p>}
          {centerLabel && <p style={{ fontSize: 10, color: COLORS.gray, marginTop: 2 }}>{centerLabel}</p>}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// DONUT LEGEND (separate so layout is flexible)
// ═══════════════════════════════════════════════════════
export function DonutLegend({ data }: { data: DonutSlice[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: d.color || DONUT_PALETTE[i % DONUT_PALETTE.length], flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#374151' }}>{d.name}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.navy, marginLeft: 'auto' }}>{d.value}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// AREA CHART (for trends over time)
// ═══════════════════════════════════════════════════════
interface AreaPoint {
  label: string;
  value: number;
}

export function TrendAreaChart({
  data,
  height = 180,
  color = COLORS.teal,
  showGrid = false,
  valueFormatter,
  tooltipLabel = 'Value',
}: {
  data: AreaPoint[];
  height?: number;
  color?: string;
  showGrid?: boolean;
  valueFormatter?: (v: number) => string;
  tooltipLabel?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 4 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />}
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: '#9CA3AF' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis hide />
        <Tooltip
          formatter={(value: number) => [valueFormatter ? valueFormatter(value) : value.toLocaleString(), tooltipLabel]}
          contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          labelStyle={{ fontSize: 11, color: '#6B7280', fontWeight: 600 }}
        />
        <defs>
          <linearGradient id={`areaGrad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#areaGrad-${color.replace('#', '')})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ═══════════════════════════════════════════════════════
// RADIAL GAUGE (e.g. "38 of 50 states")
// ═══════════════════════════════════════════════════════
export function RadialGauge({
  value,
  max,
  label,
  sublabel,
  size = 140,
  color = COLORS.teal,
}: {
  value: number;
  max: number;
  label: string;
  sublabel?: string;
  size?: number;
  color?: string;
}) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct);

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F3F4F6" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      <div style={{ marginTop: -size / 2 - 20, position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: 24, fontWeight: 700, color: COLORS.navy }}>{value}</p>
        <p style={{ fontSize: 10, color: COLORS.gray }}>{label}</p>
      </div>
      {sublabel && <p style={{ fontSize: 10, color: COLORS.gray, marginTop: size / 2 - 24 }}>{sublabel}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PROGRESS RING (simpler, for inline use)
// ═══════════════════════════════════════════════════════
export function ProgressRing({
  value,
  max,
  size = 48,
  strokeWidth = 5,
  color = COLORS.teal,
}: {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct);

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F3F4F6" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={dashOffset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════
// RISK BAR CHART (horizontal bars with color zones)
// ═══════════════════════════════════════════════════════
export function RiskBarChart({
  data,
  height,
  tooltipLabel = 'Score',
}: {
  data: { label: string; value: number; status: 'success' | 'warning' | 'danger' }[];
  height?: number;
  tooltipLabel?: string;
}) {
  const statusColors = { success: COLORS.teal, warning: COLORS.gold, danger: COLORS.red };
  const chartData = data.map(d => ({ name: d.label, value: d.value, fill: statusColors[d.status] }));
  const h = height || Math.max(data.length * 36, 120);

  return (
    <ResponsiveContainer width="100%" height={h}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 30, top: 4, bottom: 4 }}>
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fontSize: 11, fill: '#374151' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value: number) => [`${value}%`, tooltipLabel]}
          contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        />
        {/* Background zones */}
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18} background={{ fill: '#F9FAFB', radius: 4 }}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ═══════════════════════════════════════════════════════
// SECTION HEADER with live badge
// ═══════════════════════════════════════════════════════
export function LiveSectionHeader({
  title,
  subtitle,
  dotColor = COLORS.gold,
  badgeColor = '#FEF3C7',
  badgeTextColor = '#92400E',
}: {
  title: string;
  subtitle?: string;
  dotColor?: string;
  badgeColor?: string;
  badgeTextColor?: string;
}) {
  return (
    <div style={{ marginBottom: subtitle ? 4 : 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: dotColor }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, backgroundColor: badgeColor, color: badgeTextColor }}>LIVE FROM HUB</span>
      </div>
      {subtitle && <p style={{ fontSize: 12, color: '#6B7280', marginTop: 4, marginBottom: 12 }}>{subtitle}</p>}
    </div>
  );
}

export { COLORS, DONUT_PALETTE };
