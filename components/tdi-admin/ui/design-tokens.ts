// Admin Design System Tokens
// Portal-wide design consistency system v1.0

export const ADMIN_COLORS = {
  // Section accent colors — synced with sidebar PORTAL_COLORS in AdminLayoutClient.tsx
  cmo: {
    accent: '#2A9D8F',       // Teal
    accentLight: '#E0F7F6',
    accentDark: '#1F7A6F',
    bg15: 'rgba(42, 157, 143, 0.15)',
    border30: 'rgba(42, 157, 143, 0.3)',
  },
  sales: {
    accent: '#10B981',       // Green
    accentLight: '#D1FAE5',
    accentDark: '#059669',
    bg15: 'rgba(16, 185, 129, 0.15)',
    border30: 'rgba(16, 185, 129, 0.3)',
  },
  intelligence: {
    accent: '#F97316',       // Orange (Operations)
    accentLight: '#FFF7ED',
    accentDark: '#C2410C',
    bg15: 'rgba(249, 115, 22, 0.15)',
    border30: 'rgba(249, 115, 22, 0.3)',
  },
  hub: {
    accent: '#EAB308',       // Gold / Yellow
    accentLight: '#FEF9C3',
    accentDark: '#A16207',
    bg15: 'rgba(234, 179, 8, 0.15)',
    border30: 'rgba(234, 179, 8, 0.3)',
  },
  creators: {
    accent: '#EC4899',       // Pink
    accentLight: '#FCE7F3',
    accentDark: '#BE185D',
    bg15: 'rgba(236, 72, 153, 0.15)',
    border30: 'rgba(236, 72, 153, 0.3)',
  },
  leadership: {
    accent: '#2563EB',       // Blue
    accentLight: '#DBEAFE',
    accentDark: '#1D4ED8',
    bg15: 'rgba(37, 99, 235, 0.15)',
    border30: 'rgba(37, 99, 235, 0.3)',
  },
  funding: {
    accent: '#8B5CF6',       // Violet
    accentLight: '#EDE9FE',
    accentDark: '#6D28D9',
    bg15: 'rgba(139, 92, 246, 0.15)',
    border30: 'rgba(139, 92, 246, 0.3)',
  },
  team: {
    accent: '#6B7280',       // Gray
    accentLight: '#F3F4F6',
    accentDark: '#374151',
    bg15: 'rgba(107, 114, 128, 0.15)',
    border30: 'rgba(107, 114, 128, 0.3)',
  },
} as const;

// Global portal design tokens - Use these everywhere
export const PORTAL_TOKENS = {
  // Card surface - ALL cards must be white
  cardBg: '#FFFFFF',
  cardBorder: '#F3F4F6',        // gray-100
  cardBorderHover: '#E5E7EB',   // gray-200
  cardShadow: '0 1px 4px rgba(0,0,0,0.04)',
  cardShadowHover: '0 8px 24px rgba(0,0,0,0.08)',
  cardRadius: '12px',           // rounded-xl

  // Row surface (inside cards)
  rowBg: '#FFFFFF',
  rowBgHover: '#F9FAFB',        // gray-50
  rowBorder: '#F9FAFB',

  // Typography
  textPrimary: '#111827',       // gray-900
  textSecondary: '#6B7280',     // gray-500
  textTertiary: '#9CA3AF',      // gray-400

  // Page background
  pageBg: '#F4F4F2',

  // Section header (top of each portal page)
  sectionHeaderBg: '#1B2A4A',   // navy - same everywhere
} as const;

export const ADMIN_TYPOGRAPHY = {
  fontFamily: {
    heading: "'Source Serif 4', Georgia, serif",
    body: "'DM Sans', sans-serif",
  },
  fontSize: {
    pageTitle: '28px',
    sectionHeader: '18px',
    cardTitle: '16px',
    statValue: '28px',
    body: '14px',
    small: '12px',
  },
  colors: {
    heading: '#2B3A67',
    body: '#374151',
    secondary: '#6B7280',
    muted: '#9CA3AF',
  },
} as const;

export const ADMIN_SPACING = {
  page: {
    padding: 'px-4 md:px-6 py-6',
    maxWidth: 'max-w-[1400px]',
  },
  card: {
    padding: 'p-5',
    gap: 'gap-4',
  },
  grid: {
    statCards: 'grid grid-cols-2 md:grid-cols-4 gap-4',
    threeCol: 'grid grid-cols-1 lg:grid-cols-3 gap-5',
    twoCol: 'grid md:grid-cols-2 gap-6',
  },
} as const;

export const ADMIN_SHADOWS = {
  card: '0 1px 4px rgba(0,0,0,0.04)',
  cardHover: '0 8px 24px rgba(0,0,0,0.08)',
  statActive: (accentColor: string) => `0 4px 12px ${accentColor}25, 0 1px 3px rgba(0,0,0,0.08)`,
} as const;

export const ADMIN_BORDERS = {
  card: 'border border-gray-100',
  cardRadius: 'rounded-xl',
  statLeft: (color: string) => `3px solid ${color}`,
  input: 'border border-gray-200 rounded-lg',
} as const;

export const ADMIN_TRANSITIONS = {
  default: 'transition-all duration-200',
  fast: 'transition-all duration-150',
} as const;

// Helper function to get section theme
export function getSectionTheme(section: 'hub' | 'creators' | 'leadership' | 'team') {
  return ADMIN_COLORS[section];
}

// Status color mappings
export const STATUS_COLORS = {
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  error: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  neutral: 'bg-gray-100 text-gray-600 border-gray-200',
} as const;

// Priority color mappings
export const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-gray-100 text-gray-600',
} as const;
