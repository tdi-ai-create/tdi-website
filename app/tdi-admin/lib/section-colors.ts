export const SECTION_COLORS = {
  cmo: {
    primary: '#2A9D8F',
    soft: 'rgba(42, 157, 143, 0.08)',
    border: 'rgba(42, 157, 143, 0.3)',
    text: '#1F7268',
  },
  sales: {
    primary: '#10B981',
    soft: 'rgba(16, 185, 129, 0.08)',
    border: 'rgba(16, 185, 129, 0.3)',
    text: '#047857',
  },
  operations: {
    primary: '#F97316',
    soft: 'rgba(249, 115, 22, 0.08)',
    border: 'rgba(249, 115, 22, 0.3)',
    text: '#C2410C',
  },
  leadership: {
    primary: '#2563EB',
    soft: 'rgba(37, 99, 235, 0.08)',
    border: 'rgba(37, 99, 235, 0.3)',
    text: '#1E40AF',
  },
  hub: {
    primary: '#EAB308',
    soft: 'rgba(234, 179, 8, 0.08)',
    border: 'rgba(234, 179, 8, 0.3)',
    text: '#854D0E',
  },
  creator: {
    primary: '#EC4899',
    soft: 'rgba(236, 72, 153, 0.08)',
    border: 'rgba(236, 72, 153, 0.3)',
    text: '#BE185D',
  },
  funding: {
    primary: '#8B5CF6',
    soft: 'rgba(139, 92, 246, 0.08)',
    border: 'rgba(139, 92, 246, 0.3)',
    text: '#6D28D9',
  },
} as const

export const STATUS_COLORS = {
  critical: { bg: '#FEE2E2', text: '#991B1B', border: '#DC2626', solid: '#DC2626' },
  warning: { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B', solid: '#F59E0B' },
  success: { bg: '#DCFCE7', text: '#166534', border: '#16A34A', solid: '#16A34A' },
  info: { bg: '#DBEAFE', text: '#1E40AF', border: '#3B82F6', solid: '#3B82F6' },
  neutral: { bg: '#F3F4F6', text: '#374151', border: '#9CA3AF', solid: '#6B7280' },
} as const

export type SectionKey = keyof typeof SECTION_COLORS
export type StatusKey = keyof typeof STATUS_COLORS
