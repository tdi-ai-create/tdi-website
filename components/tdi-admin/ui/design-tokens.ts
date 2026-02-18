// Admin Design System Tokens
// Extracted from Creator Studio for consistent styling across all admin sections

export const ADMIN_COLORS = {
  // Section accent colors
  hub: {
    primary: '#0D9488',      // Teal (updated per spec)
    light: '#F0FDFA',
    dark: '#115E59',
    bg15: 'rgba(13, 148, 136, 0.15)',
    border30: 'rgba(13, 148, 136, 0.3)',
  },
  creators: {
    primary: '#6B5CE7',      // Purple (per spec)
    light: '#F3EDF8',
    dark: '#5145B5',
    bg15: 'rgba(107, 92, 231, 0.15)',
    border30: 'rgba(107, 92, 231, 0.3)',
  },
  leadership: {
    primary: '#1E3A5F',      // Navy (per spec)
    light: '#EEF2F6',
    dark: '#152A45',
    bg15: 'rgba(30, 58, 95, 0.15)',
    border30: 'rgba(30, 58, 95, 0.3)',
  },
  team: {
    primary: '#6B7280',      // Neutral grey
    light: '#F9FAFB',
    dark: '#4B5563',
    bg15: 'rgba(107, 114, 128, 0.15)',
    border30: 'rgba(107, 114, 128, 0.3)',
  },
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
  card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  cardHover: '0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)',
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
