// Types for TDI Team Members
export interface TeamMember {
  id: string;
  user_id: string | null;
  email: string;
  display_name: string;
  role: 'owner' | 'admin' | 'member';
  permissions: TeamPermissions;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamPermissions {
  learning_hub?: {
    view_enrollments?: boolean;
    export_reports?: boolean;
    manage_courses?: boolean;
    manage_tips?: boolean;
    manage_quick_wins?: boolean;
    view_financial?: boolean;
    manage_certificates?: boolean;
    bulk_operations?: boolean;
    view_analytics?: boolean;
    manage_content?: boolean;
    email_management?: boolean;
  };
  creator_studio?: {
    view_creators?: boolean;
    manage_creators?: boolean;
    content_pipeline?: boolean;
    financial_payouts?: boolean;
    approve_content?: boolean;
  };
  leadership?: {
    view_partnerships?: boolean;
    manage_schools?: boolean;
    view_diagnostics?: boolean;
    financial_data?: boolean;
    export_reports?: boolean;
  };
  team_access?: boolean;
}

export type PortalSection = 'learning_hub' | 'creator_studio' | 'leadership';

// Permission definitions for UI
export const LEARNING_HUB_PERMISSIONS = [
  { key: 'view_enrollments', label: 'View enrollments' },
  { key: 'export_reports', label: 'View/export reports' },
  { key: 'manage_courses', label: 'Manage courses (publish/unpublish)' },
  { key: 'manage_tips', label: 'Manage TDI Tips' },
  { key: 'manage_quick_wins', label: 'Manage Quick Wins' },
  { key: 'view_financial', label: 'View financial data' },
  { key: 'manage_certificates', label: 'Manage certificates' },
  { key: 'bulk_operations', label: 'Bulk operations' },
  { key: 'view_analytics', label: 'View analytics' },
  { key: 'manage_content', label: 'Manage content (upload courses, videos, downloads)' },
  { key: 'email_management', label: 'Email management' },
];

export const CREATOR_STUDIO_PERMISSIONS = [
  { key: 'view_creators', label: 'View creators' },
  { key: 'manage_creators', label: 'Manage creator accounts' },
  { key: 'content_pipeline', label: 'Content pipeline' },
  { key: 'financial_payouts', label: 'Financial/payouts' },
  { key: 'approve_content', label: 'Approve content' },
];

export const LEADERSHIP_PERMISSIONS = [
  { key: 'view_partnerships', label: 'View partnerships' },
  { key: 'manage_schools', label: 'Manage school accounts' },
  { key: 'view_diagnostics', label: 'View diagnostics data' },
  { key: 'financial_data', label: 'Financial data' },
  { key: 'export_reports', label: 'Export reports' },
];

/**
 * Check if a user has team access by userId or email
 * Returns the team member record or null if not found/inactive
 * Uses an API route to bypass RLS issues with the anon client
 */
export async function checkTeamAccess(userId: string, email: string): Promise<TeamMember | null> {
  try {
    // AbortController for fetch timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch('/api/tdi-admin/check-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.member as TeamMember || null;
  } catch (error) {
    // Timeout or network error - return null
    return null;
  }
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  permissions: TeamPermissions,
  section: PortalSection,
  action: string
): boolean {
  const sectionPermissions = permissions[section];
  if (!sectionPermissions) return false;
  return (sectionPermissions as Record<string, boolean>)[action] === true;
}

/**
 * Check if user has any permission in a section
 */
export function hasAnySectionPermission(
  permissions: TeamPermissions,
  section: PortalSection
): boolean {
  const sectionPermissions = permissions[section];
  if (!sectionPermissions) return false;
  return Object.values(sectionPermissions).some(v => v === true);
}

/**
 * Get which portal sections a user can access
 */
export function getAccessibleSections(permissions: TeamPermissions): PortalSection[] {
  const sections: PortalSection[] = [];

  if (hasAnySectionPermission(permissions, 'learning_hub')) {
    sections.push('learning_hub');
  }
  if (hasAnySectionPermission(permissions, 'creator_studio')) {
    sections.push('creator_studio');
  }
  if (hasAnySectionPermission(permissions, 'leadership')) {
    sections.push('leadership');
  }

  return sections;
}

/**
 * Check if user is the owner
 */
export function isOwner(member: TeamMember | null): boolean {
  return member?.role === 'owner';
}

/**
 * Check if user can manage team (must be owner)
 */
export function canManageTeam(member: TeamMember | null): boolean {
  return isOwner(member) || member?.permissions.team_access === true;
}

/**
 * Get default permissions for a new member
 */
export function getDefaultPermissions(): TeamPermissions {
  return {
    learning_hub: {
      view_enrollments: true,
      export_reports: false,
      manage_courses: false,
      manage_tips: false,
      manage_quick_wins: false,
      view_financial: false,
      manage_certificates: false,
      bulk_operations: false,
      view_analytics: true,
      manage_content: false,
      email_management: false,
    },
    creator_studio: {
      view_creators: false,
      manage_creators: false,
      content_pipeline: false,
      financial_payouts: false,
      approve_content: false,
    },
    leadership: {
      view_partnerships: false,
      manage_schools: false,
      view_diagnostics: false,
      financial_data: false,
      export_reports: false,
    },
    team_access: false,
  };
}

/**
 * Get all team members via API (bypasses RLS)
 */
export async function getAllTeamMembers(): Promise<TeamMember[]> {
  try {
    const response = await fetch('/api/tdi-admin/team-members', {
      method: 'GET',
    });

    if (!response.ok) {
      return [];
    }

    const result = await response.json();
    return result.members as TeamMember[] || [];
  } catch (error) {
    console.error('[TDI Admin] Error fetching team members:', error);
    return [];
  }
}

/**
 * Add a new team member via API
 */
export async function addTeamMember(
  email: string,
  displayName: string,
  role: 'admin' | 'member',
  permissions: TeamPermissions
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/tdi-admin/team-members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, displayName, role, permissions }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to add team member' };
    }

    return { success: true };
  } catch (error) {
    console.error('[TDI Admin] Error adding team member:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Update team member permissions via API
 */
export async function updateTeamMemberPermissions(
  memberId: string,
  permissions: TeamPermissions
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/tdi-admin/team-members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: memberId, permissions }),
    });

    if (!response.ok) {
      const result = await response.json();
      return { success: false, error: result.error || 'Failed to update permissions' };
    }

    return { success: true };
  } catch (error) {
    console.error('[TDI Admin] Error updating permissions:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Deactivate a team member via API
 */
export async function deactivateTeamMember(
  memberId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/tdi-admin/team-members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: memberId, is_active: false }),
    });

    if (!response.ok) {
      const result = await response.json();
      return { success: false, error: result.error || 'Failed to deactivate member' };
    }

    return { success: true };
  } catch (error) {
    console.error('[TDI Admin] Error deactivating member:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Reactivate a team member via API
 */
export async function reactivateTeamMember(
  memberId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/tdi-admin/team-members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: memberId, is_active: true }),
    });

    if (!response.ok) {
      const result = await response.json();
      return { success: false, error: result.error || 'Failed to reactivate member' };
    }

    return { success: true };
  } catch (error) {
    console.error('[TDI Admin] Error reactivating member:', error);
    return { success: false, error: 'Network error' };
  }
}
