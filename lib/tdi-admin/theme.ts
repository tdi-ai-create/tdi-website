/**
 * Portal Theme Configuration
 * Each TDI Admin portal section has its own accent color identity
 */

export interface PortalTheme {
  primary: string;
  light: string;
  dark: string;
  name: 'hub' | 'creators' | 'leadership' | 'team';
}

// Theme definitions - Updated accent colors per design spec
export const PORTAL_THEMES = {
  hub: {
    primary: '#0D9488',      // Teal
    light: '#F0FDFA',
    dark: '#115E59',
    name: 'hub' as const,
  },
  creators: {
    primary: '#6B5CE7',      // Purple/Lavender
    light: '#F3EDF8',
    dark: '#5145B5',
    name: 'creators' as const,
  },
  leadership: {
    primary: '#1E3A5F',      // Navy
    light: '#EEF2F6',
    dark: '#152A45',
    name: 'leadership' as const,
  },
  team: {
    primary: '#6B7280',      // Neutral grey
    light: '#F9FAFB',
    dark: '#4B5563',
    name: 'team' as const,
  },
} as const;

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
  // Default to hub theme
  return PORTAL_THEMES.hub;
}

/**
 * Hook-friendly version that works with usePathname
 */
export function usePortalTheme(pathname: string): PortalTheme {
  return getPortalTheme(pathname);
}
