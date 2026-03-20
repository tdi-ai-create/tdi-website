/**
 * TDI Admin Portal Theme System v1.0
 * Approved color system for portal section identities
 */

export type PortalSection = 'hub' | 'creators' | 'leadership' | 'team' | 'intelligence';

export interface PortalTheme {
  accent:      string;  // primary color used for highlights, buttons, etc.
  accentLight: string;  // lighter shade for backgrounds, hover states
  accentDark:  string;  // darker shade for borders, pressed states
  label:       string;  // Display label for the section
  name:        string;  // Full name of the section
  section:     PortalSection;
}

export const PORTAL_THEMES: Record<PortalSection, PortalTheme> = {
  hub: {
    accent:      '#00B5AD',
    accentLight: '#E0F7F6',
    accentDark:  '#007A75',
    label:       'HUB',
    name:        'Learning Hub',
    section:     'hub',
  },
  creators: {
    accent:      '#8B5CF6',
    accentLight: '#EDE9FE',
    accentDark:  '#5B21B6',
    label:       'CREATORS',
    name:        'Creator Studio',
    section:     'creators',
  },
  leadership: {
    accent:      '#16A34A',
    accentLight: '#DCFCE7',
    accentDark:  '#166534',
    label:       'LEADERSHIP',
    name:        'Leadership Corner',
    section:     'leadership',
  },
  team: {
    accent:      '#F59E0B',
    accentLight: '#FEF3C7',
    accentDark:  '#B45309',
    label:       'TEAM',
    name:        'Team Resources',
    section:     'team',
  },
  intelligence: {
    accent:      '#F59E0B',
    accentLight: '#FEF3C7',
    accentDark:  '#B45309',
    label:       'INTEL',
    name:        'Intelligence Hub',
    section:     'intelligence',
  },
};

/**
 * Get the portal theme based on the current route
 */
export function getPortalTheme(pathname: string): PortalTheme {
  if (pathname.includes('/tdi-admin/hub') || pathname === '/tdi-admin') {
    return PORTAL_THEMES.hub;
  }
  if (pathname.includes('/tdi-admin/creators')) {
    return PORTAL_THEMES.creators;
  }
  if (pathname.includes('/tdi-admin/leadership')) {
    return PORTAL_THEMES.leadership;
  }
  if (pathname.includes('/tdi-admin/team')) {
    return PORTAL_THEMES.team;
  }
  if (pathname.includes('/tdi-admin/intelligence')) {
    return PORTAL_THEMES.intelligence;
  }
  // Default to hub theme
  return PORTAL_THEMES.hub;
}

/**
 * Hook-friendly version that works with usePathname
 */
export function usePortalTheme(pathname: string): PortalTheme {
  return getPortalTheme(pathname);
}
