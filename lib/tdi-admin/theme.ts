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

// Theme definitions
export const PORTAL_THEMES = {
  hub: {
    primary: '#5BBEC4',
    light: '#E8F6F7',
    dark: '#1a6b69',
    name: 'hub' as const,
  },
  creators: {
    primary: '#9B7CB8',
    light: '#F3EDF8',
    dark: '#6B4E9B',
    name: 'creators' as const,
  },
  leadership: {
    primary: '#E8927C',
    light: '#FDF0ED',
    dark: '#C4624A',
    name: 'leadership' as const,
  },
  team: {
    primary: '#E8B84B',
    light: '#FFF8E7',
    dark: '#B8860B',
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
