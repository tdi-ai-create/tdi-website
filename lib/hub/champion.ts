import { getSupabase } from '@/lib/supabase';

/**
 * Champion/School Admin utilities
 * Champions can ONLY see enrollment status - no individual progress, scores, or private data
 */

export interface TeamMember {
  id: string;
  display_name: string | null;
  email: string;
  enrollment_count: number;
  is_enrolled: boolean;
}

export interface TeamStats {
  totalMembers: number;
  enrolled: number;
  notEnrolled: number;
  completedAtLeastOne: number;
}

/**
 * Check if user is a champion or school admin
 */
export async function isChampion(userId: string): Promise<boolean> {
  const supabase = getSupabase();

  const { data } = await supabase
    .from('hub_profiles')
    .select('role')
    .eq('id', userId)
    .single();

  return data?.role === 'champion' || data?.role === 'school_admin';
}

/**
 * Get the organization ID for a champion
 */
export async function getChampionOrganization(userId: string): Promise<string | null> {
  const supabase = getSupabase();

  const { data } = await supabase
    .from('hub_profiles')
    .select('organization_id')
    .eq('id', userId)
    .single();

  return data?.organization_id || null;
}

/**
 * Get team members for an organization
 * Only returns enrollment status - NO progress, scores, or private data
 */
export async function getTeamMembers(organizationId: string): Promise<TeamMember[]> {
  const supabase = getSupabase();

  // Get all profiles in the organization
  const { data: profiles } = await supabase
    .from('hub_profiles')
    .select('id, display_name, email')
    .eq('organization_id', organizationId)
    .order('display_name', { ascending: true });

  if (!profiles) return [];

  // Get enrollment counts for each user
  const memberData = await Promise.all(
    profiles.map(async (profile) => {
      const { count } = await supabase
        .from('hub_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id);

      return {
        id: profile.id,
        display_name: profile.display_name,
        email: profile.email,
        enrollment_count: count || 0,
        is_enrolled: (count || 0) > 0,
      };
    })
  );

  return memberData;
}

/**
 * Get team statistics
 */
export async function getTeamStats(organizationId: string): Promise<TeamStats> {
  const supabase = getSupabase();

  // Get total members
  const { count: totalMembers } = await supabase
    .from('hub_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId);

  // Get profiles with at least one enrollment
  const { data: profiles } = await supabase
    .from('hub_profiles')
    .select('id')
    .eq('organization_id', organizationId);

  if (!profiles) {
    return {
      totalMembers: totalMembers || 0,
      enrolled: 0,
      notEnrolled: totalMembers || 0,
      completedAtLeastOne: 0,
    };
  }

  // Check enrollment and completion status for each member
  let enrolled = 0;
  let completedAtLeastOne = 0;

  await Promise.all(
    profiles.map(async (profile) => {
      const { count: enrollmentCount } = await supabase
        .from('hub_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id);

      if ((enrollmentCount || 0) > 0) {
        enrolled++;

        // Check if completed at least one course
        const { count: completedCount } = await supabase
          .from('hub_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id)
          .eq('status', 'completed');

        if ((completedCount || 0) > 0) {
          completedAtLeastOne++;
        }
      }
    })
  );

  return {
    totalMembers: totalMembers || 0,
    enrolled,
    notEnrolled: (totalMembers || 0) - enrolled,
    completedAtLeastOne,
  };
}

/**
 * Get school-recommended courses for an organization
 */
export async function getSchoolRecommendedCourses(organizationId: string) {
  const supabase = getSupabase();

  const { data } = await supabase
    .from('hub_school_recommendations')
    .select(`
      course_id,
      course:hub_courses!hub_school_recommendations_course_id_fkey(id, title, slug, category, pd_hours)
    `)
    .eq('organization_id', organizationId);

  return data?.map((r) => {
    const course = Array.isArray(r.course) ? r.course[0] : r.course;
    return course;
  }).filter(Boolean) || [];
}

/**
 * Add a school-recommended course
 */
export async function addSchoolRecommendation(organizationId: string, courseId: string): Promise<boolean> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('hub_school_recommendations')
    .insert({
      organization_id: organizationId,
      course_id: courseId,
    });

  return !error;
}

/**
 * Remove a school-recommended course
 */
export async function removeSchoolRecommendation(organizationId: string, courseId: string): Promise<boolean> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('hub_school_recommendations')
    .delete()
    .eq('organization_id', organizationId)
    .eq('course_id', courseId);

  return !error;
}

/**
 * Get all published courses (for recommendation selection)
 */
export async function getPublishedCourses() {
  const supabase = getSupabase();

  const { data } = await supabase
    .from('hub_courses')
    .select('id, title, slug, category, pd_hours')
    .eq('is_published', true)
    .order('title', { ascending: true });

  return data || [];
}
