import { getSupabase } from '@/lib/supabase';

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
 * Check if a user has team access by email
 * Returns the team member record or null if not found/inactive
 */
export async function checkTeamAccess(email: string): Promise<TeamMember | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('tdi_team_members')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('is_active', true)
    .single();

  if (error || !data) {
    console.log('[TDI Admin] Team access check failed:', { email, error });
    return null;
  }

  return data as TeamMember;
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
 * Get all team members
 */
export async function getAllTeamMembers(): Promise<TeamMember[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('tdi_team_members')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[TDI Admin] Error fetching team members:', error);
    return [];
  }

  return data as TeamMember[];
}

/**
 * Add a new team member
 */
export async function addTeamMember(
  email: string,
  displayName: string,
  role: 'admin' | 'member',
  permissions: TeamPermissions
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('tdi_team_members')
    .insert({
      email: email.toLowerCase(),
      display_name: displayName,
      role,
      permissions,
      is_active: true,
    });

  if (error) {
    console.error('[TDI Admin] Error adding team member:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Update team member permissions
 */
export async function updateTeamMemberPermissions(
  memberId: string,
  permissions: TeamPermissions
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('tdi_team_members')
    .update({ permissions })
    .eq('id', memberId);

  if (error) {
    console.error('[TDI Admin] Error updating permissions:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Deactivate a team member
 */
export async function deactivateTeamMember(
  memberId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('tdi_team_members')
    .update({ is_active: false })
    .eq('id', memberId);

  if (error) {
    console.error('[TDI Admin] Error deactivating member:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Reactivate a team member
 */
export async function reactivateTeamMember(
  memberId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('tdi_team_members')
    .update({ is_active: true })
    .eq('id', memberId);

  if (error) {
    console.error('[TDI Admin] Error reactivating member:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
