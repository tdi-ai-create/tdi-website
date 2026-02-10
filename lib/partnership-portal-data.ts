import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Types
export interface Partnership {
  id: string;
  partnership_type: 'district' | 'school';
  slug: string | null;
  contact_name: string;
  contact_email: string;
  contract_phase: 'IGNITE' | 'ACCELERATE' | 'SUSTAIN';
  contract_start: string | null;
  contract_end: string | null;
  building_count: number;
  observation_days_total: number;
  virtual_sessions_total: number;
  executive_sessions_total: number;
  invite_token: string;
  invite_sent_at: string | null;
  invite_accepted_at: string | null;
  status: 'invited' | 'setup_in_progress' | 'active' | 'paused' | 'completed';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  partnership_id: string;
  name: string;
  org_type: 'district' | 'school';
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  website: string | null;
  superintendent_name: string | null;
  superintendent_email: string | null;
  principal_name: string | null;
  principal_email: string | null;
  school_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface Building {
  id: string;
  organization_id: string;
  name: string;
  building_type: string | null;
  lead_name: string | null;
  lead_email: string | null;
  estimated_staff_count: number | null;
  created_at: string;
}

export interface StaffMember {
  id: string;
  partnership_id: string;
  building_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  role_title: string | null;
  hub_enrolled: boolean;
  hub_login_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActionItem {
  id: string;
  partnership_id: string;
  title: string;
  description: string | null;
  category: 'onboarding' | 'data' | 'scheduling' | 'documentation' | 'engagement';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'paused';
  sort_order: number;
  due_date: string | null;
  paused_at: string | null;
  paused_reason: string | null;
  completed_at: string | null;
  evidence_url: string | null;
  evidence_file_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface PartnershipUser {
  id: string;
  partnership_id: string;
  user_id: string;
  role: 'admin' | 'viewer' | 'champion';
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  created_at: string;
}

export interface ActivityLogEntry {
  id: string;
  partnership_id: string;
  user_id: string | null;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
}

// Service Supabase client (bypasses RLS)
export function getServiceSupabase(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ============================================================================
// PARTNERSHIP FUNCTIONS
// ============================================================================

export async function getPartnershipByToken(token: string): Promise<Partnership | null> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('partnerships')
    .select('*')
    .eq('invite_token', token)
    .is('invite_accepted_at', null)
    .maybeSingle();

  if (error) {
    console.error('Error fetching partnership by token:', error);
    return null;
  }

  return data;
}

export async function getPartnershipById(id: string): Promise<Partnership | null> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('partnerships')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching partnership:', error);
    return null;
  }

  return data;
}

export async function getPartnershipBySlug(slug: string): Promise<Partnership | null> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('partnerships')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching partnership by slug:', error);
    return null;
  }

  return data;
}

export async function getAllPartnerships(): Promise<Partnership[]> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('partnerships')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching partnerships:', error);
    return [];
  }

  return data || [];
}

export async function createPartnership(
  partnershipData: Omit<Partnership, 'id' | 'invite_token' | 'created_at' | 'updated_at'>
): Promise<Partnership | null> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('partnerships')
    .insert(partnershipData)
    .select()
    .single();

  if (error) {
    console.error('Error creating partnership:', error);
    return null;
  }

  return data;
}

export async function updatePartnership(
  id: string,
  updates: Partial<Partnership>
): Promise<Partnership | null> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('partnerships')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating partnership:', error);
    return null;
  }

  return data;
}

// ============================================================================
// ORGANIZATION FUNCTIONS
// ============================================================================

export async function getOrganization(partnershipId: string): Promise<Organization | null> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('partnership_id', partnershipId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching organization:', error);
    return null;
  }

  return data;
}

export async function createOrganization(
  orgData: Omit<Organization, 'id' | 'created_at' | 'updated_at'>
): Promise<Organization | null> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('organizations')
    .insert(orgData)
    .select()
    .single();

  if (error) {
    console.error('Error creating organization:', error);
    return null;
  }

  return data;
}

export async function updateOrganization(
  id: string,
  updates: Partial<Organization>
): Promise<Organization | null> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('organizations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating organization:', error);
    return null;
  }

  return data;
}

// ============================================================================
// BUILDING FUNCTIONS
// ============================================================================

export async function getBuildings(organizationId: string): Promise<Building[]> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('buildings')
    .select('*')
    .eq('organization_id', organizationId)
    .order('name');

  if (error) {
    console.error('Error fetching buildings:', error);
    return [];
  }

  return data || [];
}

export async function createBuilding(
  buildingData: Omit<Building, 'id' | 'created_at'>
): Promise<Building | null> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('buildings')
    .insert(buildingData)
    .select()
    .single();

  if (error) {
    console.error('Error creating building:', error);
    return null;
  }

  return data;
}

export async function deleteBuilding(id: string): Promise<boolean> {
  const supabase = getServiceSupabase();

  const { error } = await supabase
    .from('buildings')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting building:', error);
    return false;
  }

  return true;
}

// ============================================================================
// STAFF FUNCTIONS
// ============================================================================

export async function getStaffMembers(partnershipId: string): Promise<StaffMember[]> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('staff_members')
    .select('*')
    .eq('partnership_id', partnershipId)
    .order('last_name');

  if (error) {
    console.error('Error fetching staff:', error);
    return [];
  }

  return data || [];
}

export async function createStaffMember(
  staffData: Omit<StaffMember, 'id' | 'created_at' | 'updated_at'>
): Promise<StaffMember | null> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('staff_members')
    .insert(staffData)
    .select()
    .single();

  if (error) {
    console.error('Error creating staff member:', error);
    return null;
  }

  return data;
}

export async function createStaffMembers(
  staffData: Omit<StaffMember, 'id' | 'created_at' | 'updated_at'>[]
): Promise<StaffMember[]> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('staff_members')
    .insert(staffData)
    .select();

  if (error) {
    console.error('Error creating staff members:', error);
    return [];
  }

  return data || [];
}

export async function getStaffCount(partnershipId: string): Promise<number> {
  const supabase = getServiceSupabase();

  const { count, error } = await supabase
    .from('staff_members')
    .select('*', { count: 'exact', head: true })
    .eq('partnership_id', partnershipId);

  if (error) {
    console.error('Error counting staff:', error);
    return 0;
  }

  return count || 0;
}

// ============================================================================
// ACTION ITEMS FUNCTIONS
// ============================================================================

export async function getActionItems(partnershipId: string): Promise<ActionItem[]> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('action_items')
    .select('*')
    .eq('partnership_id', partnershipId)
    .order('sort_order');

  if (error) {
    console.error('Error fetching action items:', error);
    return [];
  }

  return data || [];
}

export async function createDefaultActionItems(
  partnershipId: string,
  staffCount: number
): Promise<ActionItem[]> {
  const supabase = getServiceSupabase();

  const defaultItems = [
    {
      partnership_id: partnershipId,
      sort_order: 1,
      title: 'Complete Hub Onboarding',
      description: `Ensure all ${staffCount} staff have created Learning Hub accounts and logged in at least once.`,
      category: 'onboarding' as const,
      priority: 'high' as const,
    },
    {
      partnership_id: partnershipId,
      sort_order: 2,
      title: 'Schedule Virtual Session 1',
      description: 'Book your first virtual session with the TDI team to kick things off. Included in your contract.',
      category: 'scheduling' as const,
      priority: 'high' as const,
    },
    {
      partnership_id: partnershipId,
      sort_order: 3,
      title: 'Suggest TDI Champion(s)',
      description: 'Identify a staff member in each building who can help keep Hub momentum going during PLCs and meetings.',
      category: 'engagement' as const,
      priority: 'medium' as const,
    },
    {
      partnership_id: partnershipId,
      sort_order: 4,
      title: 'Add Hub Time to PLCs',
      description: 'Districts that build in 15-30 minutes of protected Hub time see 3x higher implementation rates.',
      category: 'engagement' as const,
      priority: 'medium' as const,
    },
    {
      partnership_id: partnershipId,
      sort_order: 5,
      title: 'Share Baseline Staff Survey',
      description: 'Upload or schedule a pre-partnership wellness survey so we can measure growth together.',
      category: 'data' as const,
      priority: 'medium' as const,
    },
    {
      partnership_id: partnershipId,
      sort_order: 6,
      title: 'Share School Improvement Plan',
      description: 'Upload your current SIP so we can align PD strategies to your existing goals.',
      category: 'documentation' as const,
      priority: 'low' as const,
    },
    {
      partnership_id: partnershipId,
      sort_order: 7,
      title: 'Share Current PD Calendar',
      description: 'Upload your PD calendar so we can find natural integration points for TDI content.',
      category: 'documentation' as const,
      priority: 'low' as const,
    },
    {
      partnership_id: partnershipId,
      sort_order: 8,
      title: 'Provide Previous PD Spend Data',
      description: 'Optional: Share what you\'ve invested in PD previously so we can help demonstrate ROI.',
      category: 'data' as const,
      priority: 'low' as const,
    },
    {
      partnership_id: partnershipId,
      sort_order: 9,
      title: 'Confirm Observation Day Dates',
      description: 'Work with your TDI partner to lock in dates for classroom walk-throughs.',
      category: 'scheduling' as const,
      priority: 'low' as const,
    },
    {
      partnership_id: partnershipId,
      sort_order: 10,
      title: 'Schedule Executive Impact Session',
      description: 'Plan a session with leadership to review partnership progress and impact data.',
      category: 'scheduling' as const,
      priority: 'low' as const,
    },
  ];

  const { data, error } = await supabase
    .from('action_items')
    .insert(defaultItems)
    .select();

  if (error) {
    console.error('Error creating default action items:', error);
    return [];
  }

  return data || [];
}

// ============================================================================
// PARTNERSHIP USER FUNCTIONS
// ============================================================================

export async function createPartnershipUser(
  userData: Omit<PartnershipUser, 'id' | 'created_at'>
): Promise<PartnershipUser | null> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('partnership_users')
    .insert(userData)
    .select()
    .single();

  if (error) {
    console.error('Error creating partnership user:', error);
    return null;
  }

  return data;
}

export async function getPartnershipUser(
  userId: string,
  partnershipId: string
): Promise<PartnershipUser | null> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('partnership_users')
    .select('*')
    .eq('user_id', userId)
    .eq('partnership_id', partnershipId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching partnership user:', error);
    return null;
  }

  return data;
}

export async function getUserPartnerships(userId: string): Promise<Partnership[]> {
  const supabase = getServiceSupabase();

  const { data: partnershipUsers, error: puError } = await supabase
    .from('partnership_users')
    .select('partnership_id')
    .eq('user_id', userId);

  if (puError || !partnershipUsers) {
    console.error('Error fetching user partnerships:', puError);
    return [];
  }

  const partnershipIds = partnershipUsers.map(pu => pu.partnership_id);

  if (partnershipIds.length === 0) return [];

  const { data, error } = await supabase
    .from('partnerships')
    .select('*')
    .in('id', partnershipIds);

  if (error) {
    console.error('Error fetching partnerships:', error);
    return [];
  }

  return data || [];
}

// ============================================================================
// ACTIVITY LOG FUNCTIONS
// ============================================================================

export async function getActivityLog(
  partnershipId: string,
  limit = 10
): Promise<ActivityLogEntry[]> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('partnership_id', partnershipId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching activity log:', error);
    return [];
  }

  return data || [];
}

// ============================================================================
// STATS FUNCTIONS
// ============================================================================

export async function getPartnershipStats(): Promise<{
  activeCount: number;
  totalEducators: number;
  pendingSetup: number;
  awaitingAccept: number;
}> {
  const supabase = getServiceSupabase();

  // Get counts by status
  const { data: partnerships } = await supabase
    .from('partnerships')
    .select('status');

  const activeCount = partnerships?.filter(p => p.status === 'active').length || 0;
  const pendingSetup = partnerships?.filter(p => p.status === 'setup_in_progress').length || 0;
  const awaitingAccept = partnerships?.filter(p => p.status === 'invited').length || 0;

  // Get total educators
  const { count: totalEducators } = await supabase
    .from('staff_members')
    .select('*', { count: 'exact', head: true });

  return {
    activeCount,
    totalEducators: totalEducators || 0,
    pendingSetup,
    awaitingAccept,
  };
}

// ============================================================================
// AUTH HELPERS
// ============================================================================

export async function isTDIAdmin(email: string): Promise<boolean> {
  return email.toLowerCase().endsWith('@teachersdeserveit.com');
}
