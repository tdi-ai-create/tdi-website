'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { TeamMember, TeamPermissions, checkTeamAccess, getAccessibleSections, isOwner, canManageTeam, PortalSection } from './permissions';

/**
 * What we know about this person's access, as three separate answers rather
 * than one boolean.
 *
 * `hasAccess: false` used to mean four different things: the check had not run,
 * the check timed out, the check threw, and the check said no. The layout
 * rendered the same refusal screen for all four, so on 22 September 2026 the
 * portal told Rae she had no access to her own company while her record was
 * owner and active. A failed check is not a refusal and must not be reported
 * as one.
 */
export type AdminAccessState =
  /** Still asking. Nothing has come back yet. */
  | 'checking'
  /** Asked and answered: this person is an active team member. */
  | 'allowed'
  /** Asked and answered: this person is not. */
  | 'denied'
  /** Could not ask. Timed out or threw. We do not know, and we say so. */
  | 'unavailable';

interface TDIAdminContextType {
  teamMember: TeamMember | null;
  isLoading: boolean;
  hasAccess: boolean;
  accessState: AdminAccessState;
  isOwner: boolean;
  canManageTeam: boolean;
  accessibleSections: PortalSection[];
  permissions: TeamPermissions;
  refreshTeamMember: () => Promise<void>;
}

const TDIAdminContext = createContext<TDIAdminContextType>({
  teamMember: null,
  isLoading: true,
  hasAccess: false,
  accessState: 'checking',
  isOwner: false,
  canManageTeam: false,
  accessibleSections: [],
  permissions: {},
  refreshTeamMember: async () => {},
});

export function useTDIAdmin() {
  return useContext(TDIAdminContext);
}

interface TDIAdminProviderProps {
  children: ReactNode;
  userId: string;
  userEmail: string;
}

/** Distinct from null, which is a real answer meaning "no such member". */
export const TIMED_OUT = Symbol('tdi-admin-access-check-timed-out');

/**
 * The one decision that was wrong, pulled out so it can be tested directly.
 *
 * Exhaustive on purpose. Every value the check can produce maps to exactly one
 * state, and the mapping is the whole fix: only a completed answer of "no
 * active member" is allowed to become 'denied'.
 *
 * Verified by scripts/integrity/admin-access-state-check.ts.
 */
export function accessStateFor(
  result: TeamMember | null | typeof TIMED_OUT,
): AdminAccessState {
  if (result === TIMED_OUT) return 'unavailable';
  if (result === null) return 'denied';
  return result.is_active ? 'allowed' : 'denied';
}

export function TDIAdminProvider({ children, userId, userEmail }: TDIAdminProviderProps) {
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessState, setAccessState] = useState<AdminAccessState>('checking');

  const loadTeamMember = useCallback(async () => {
    if (!userEmail) {
      setTeamMember(null);
      setAccessState('denied');
      setIsLoading(false);
      return;
    }

    setAccessState('checking');
    setIsLoading(true);

    try {
      // The timeout is still here, because a check that never returns would
      // otherwise leave the portal on its loading screen for ever. What has
      // changed is what expiry MEANS. It used to resolve to null, which is
      // also what "not a team member" looks like, so a slow connection was
      // reported to the user as a refusal.
      //
      // Eight seconds rather than 2.5. At 2.5 the expiry fired during ordinary
      // use, and an honest "we could not check" shown that often is just a
      // refusal screen with extra steps.
      const checkPromise = checkTeamAccess(userId, userEmail);
      const timeoutPromise = new Promise<typeof TIMED_OUT>((resolve) =>
        setTimeout(() => resolve(TIMED_OUT), 8000),
      );

      const result = await Promise.race([checkPromise, timeoutPromise]);

      // Deliberately not setTeamMember(null) on a timeout. We do not know
      // anything about this person, so we keep whatever we already knew and
      // report only that the check did not finish.
      if (result !== TIMED_OUT) setTeamMember(result);
      setAccessState(accessStateFor(result));
    } catch (error) {
      console.error('[TDI Admin Context] Error loading team member:', error);
      setAccessState('unavailable');
    } finally {
      setIsLoading(false);
    }
  }, [userId, userEmail]);

  useEffect(() => {
    loadTeamMember();
  }, [loadTeamMember]);

  const hasAccess = teamMember !== null && teamMember.is_active;
  const permissions = teamMember?.permissions || {};
  const accessibleSections = hasAccess ? getAccessibleSections(permissions) : [];

  return (
    <TDIAdminContext.Provider
      value={{
        teamMember,
        isLoading,
        hasAccess,
        accessState,
        isOwner: isOwner(teamMember),
        canManageTeam: canManageTeam(teamMember),
        accessibleSections,
        permissions,
        refreshTeamMember: loadTeamMember,
      }}
    >
      {children}
    </TDIAdminContext.Provider>
  );
}
