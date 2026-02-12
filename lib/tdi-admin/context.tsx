'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useHub } from '@/components/hub/HubContext';
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

export function TDIAdminProvider({ children }: { children: ReactNode }) {
  const { user } = useHub();
  const [teamMember, setTeamMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadTeamMember = async () => {
    if (!user?.email) {
      setTeamMember(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const member = await checkTeamAccess(user.email);
    setTeamMember(member);
    setIsLoading(false);
  };

  useEffect(() => {
    loadTeamMember();
  }, [user?.email]);

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
