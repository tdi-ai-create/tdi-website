/**
 * TDI Admin Portal Theme System v2.0
 * Synced with sidebar PORTAL_COLORS in AdminLayoutClient.tsx
 */

export type PortalSection = 'cmo' | 'sales' | 'intelligence' | 'hub' | 'creators' | 'funding' | 'leadership' | 'team';

export interface PortalTheme {
  accent:      string;
  accentLight: string;
  accentDark:  string;
  label:       string;
  name:        string;
  section:     PortalSection;
}

export const PORTAL_THEMES: Record<PortalSection, PortalTheme> = {
  cmo: {
    accent:      '#2A9D8F',
    accentLight: '#E0F7F6',
    accentDark:  '#1F7A6F',
    label:       'CMO',
    name:        'CMO Dashboard',
    section:     'cmo',
  },
  sales: {
    accent:      '#10B981',
    accentLight: '#D1FAE5',
    accentDark:  '#059669',
    label:       'SALES',
    name:        'Sales',
    section:     'sales',
  },
  intelligence: {
    accent:      '#F97316',
    accentLight: '#FFF7ED',
    accentDark:  '#C2410C',
    label:       'OPS',
    name:        'Operations',
    section:     'intelligence',
  },
  hub: {
    accent:      '#EAB308',
    accentLight: '#FEF9C3',
    accentDark:  '#A16207',
    label:       'HUB',
    name:        'Learning Hub',
    section:     'hub',
  },
  creators: {
    accent:      '#EC4899',
    accentLight: '#FCE7F3',
    accentDark:  '#BE185D',
    label:       'CREATORS',
    name:        'Creator Studio',
    section:     'creators',
  },
  funding: {
    accent:      '#8B5CF6',
    accentLight: '#EDE9FE',
    accentDark:  '#6D28D9',
    label:       'FUNDING',
    name:        'Funding',
    section:     'funding',
  },
  leadership: {
    accent:      '#2563EB',
    accentLight: '#DBEAFE',
    accentDark:  '#1D4ED8',
    label:       'LEAD',
    name:        'Lead Dashboard',
    section:     'leadership',
  },
  team: {
    accent:      '#6B7280',
    accentLight: '#F3F4F6',
    accentDark:  '#374151',
    label:       'TEAM',
    name:        'Team & Settings',
    section:     'team',
  },
};

export function getPortalTheme(pathname: string): PortalTheme {
  if (pathname.includes('/tdi-admin/cmo')) return PORTAL_THEMES.cmo;
  if (pathname.includes('/tdi-admin/sales')) return PORTAL_THEMES.sales;
  if (pathname.includes('/tdi-admin/intelligence')) return PORTAL_THEMES.intelligence;
  if (pathname.includes('/tdi-admin/hub') || pathname === '/tdi-admin') return PORTAL_THEMES.hub;
  if (pathname.includes('/tdi-admin/creators')) return PORTAL_THEMES.creators;
  if (pathname.includes('/tdi-admin/funding')) return PORTAL_THEMES.funding;
  if (pathname.includes('/tdi-admin/leadership')) return PORTAL_THEMES.leadership;
  if (pathname.includes('/tdi-admin/team')) return PORTAL_THEMES.team;
  return PORTAL_THEMES.hub;
}

export function usePortalTheme(pathname: string): PortalTheme {
  return getPortalTheme(pathname);
}
