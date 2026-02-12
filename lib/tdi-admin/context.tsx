'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { TeamMember, TeamPermissions, checkTeamAccess, getAccessibleSections, isOwner, canManageTeam, PortalSection } from './permissions';

interface TDIAdminContextType {
  teamMember: TeamMember | null;
  isLoading: boolean;
  hasAccess: boolean;
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

export function TDIAdminProvider({ children, userId, userEmail }: TDIAdminProviderProps) {
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadTeamMember = useCallback(async () => {
    if (!userEmail) {
      setTeamMember(null);
      setIsLoading(false);
      return;
    }

    try {
      // Race between the actual check and a 2.5s timeout
      const checkPromise = checkTeamAccess(userId, userEmail);
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));

      const member = await Promise.race([checkPromise, timeoutPromise]);
      setTeamMember(member);
    } catch (error) {
      console.error('[TDI Admin Context] Error loading team member:', error);
      setTeamMember(null);
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
