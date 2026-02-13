import { getSupabase } from '@/lib/supabase';

// Hardcoded admin emails
const ADMIN_EMAILS = [
  'rae@teachersdeserveit.com',
  'olivia@teachersdeserveit.com',
  'hughart.rae@gmail.com',
];

/**
 * Check if a user is an admin
 */
export async function isAdmin(userId: string, email?: string): Promise<boolean> {
  // Check hardcoded emails first
  if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
    return true;
  }

  // Check hub_profiles.role
  const supabase = getSupabase();
  const { data } = await supabase
    .from('hub_profiles')
    .select('role')
    .eq('id', userId)
    .single();

  return data?.role === 'admin';
}

/**
 * Get all courses with stats for admin
 */
export async function getAdminCourses() {
  const supabase = getSupabase();

  const { data: courses } = await supabase
    .from('hub_courses')
    .select('id, title, slug, category, pd_hours, is_published, created_at')
    .order('created_at', { ascending: false });

  if (!courses) return [];

  // Get lesson counts and enrollment counts for each course
  const enrichedCourses = await Promise.all(
    courses.map(async (course) => {
      const [lessonsResult, enrollmentsResult] = await Promise.all([
        supabase
          .from('hub_lessons')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id),
        supabase
          .from('hub_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id),
      ]);

      return {
        ...course,
        lessons_count: lessonsResult.count || 0,
        enrollments_count: enrollmentsResult.count || 0,
      };
    })
  );

  return enrichedCourses;
}

/**
 * Toggle course published status
 */
export async function toggleCoursePublished(courseId: string, isPublished: boolean) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('hub_courses')
    .update({ is_published: isPublished, updated_at: new Date().toISOString() })
    .eq('id', courseId);

  return !error;
}

/**
 * Get all enrollments for admin
 */
export async function getAdminEnrollments(filters?: {
  courseId?: string;
  status?: string;
  search?: string;
}) {
  const supabase = getSupabase();

  let query = supabase
    .from('hub_enrollments')
    .select(`
      id,
      course_id,
      status,
      progress_pct,
      created_at,
      user:hub_profiles!hub_enrollments_user_id_fkey(id, display_name, email),
      course:hub_courses!hub_enrollments_course_id_fkey(title)
    `)
    .order('created_at', { ascending: false });

  if (filters?.courseId) {
    query = query.eq('course_id', filters.courseId);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data } = await query;

  let enrollments = data || [];

  // Client-side search filter
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    enrollments = enrollments.filter((e) => {
      const user = Array.isArray(e.user) ? e.user[0] : e.user;
      const name = user?.display_name?.toLowerCase() || '';
      const email = user?.email?.toLowerCase() || '';
      return name.includes(searchLower) || email.includes(searchLower);
    });
  }

  return enrollments;
}

/**
 * Get all TDI tips for admin
 */
export async function getAdminTips() {
  const supabase = getSupabase();

  const { data } = await supabase
    .from('hub_tdi_tips')
    .select('*')
    .order('created_at', { ascending: false });

  return data || [];
}

/**
 * Update tip status
 */
export async function updateTipStatus(tipId: string, status: string) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('hub_tdi_tips')
    .update({ approval_status: status })
    .eq('id', tipId);

  return !error;
}

/**
 * Create a new tip
 */
export async function createTip(content: string, category: string) {
  const supabase = getSupabase();

  const { error } = await supabase.from('hub_tdi_tips').insert({
    content,
    category,
    approval_status: 'approved',
  });

  return !error;
}

/**
 * Delete a tip
 */
export async function deleteTip(tipId: string) {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('hub_tdi_tips')
    .delete()
    .eq('id', tipId);

  return !error;
}

/**
 * Get PD requests from activity log
 */
export async function getAdminRequests() {
  const supabase = getSupabase();

  const { data } = await supabase
    .from('hub_activity_log')
    .select(`
      id,
      user_id,
      action,
      metadata,
      created_at,
      user:hub_profiles!hub_activity_log_user_id_fkey(display_name, email)
    `)
    .eq('action', 'pd_request')
    .order('created_at', { ascending: false });

  return data || [];
}

/**
 * Update request status
 */
export async function updateRequestStatus(requestId: string, status: string) {
  const supabase = getSupabase();

  const { data: existing } = await supabase
    .from('hub_activity_log')
    .select('metadata')
    .eq('id', requestId)
    .single();

  const { error } = await supabase
    .from('hub_activity_log')
    .update({
      metadata: { ...(existing?.metadata || {}), status },
    })
    .eq('id', requestId);

  return !error;
}

/**
 * Get admin stats via API route (bypasses RLS)
 */
export async function getAdminStats() {
  try {
    const response = await fetch('/api/tdi-admin/stats', {
      method: 'GET',
    });

    if (!response.ok) {
      console.error('[Admin Stats] API error:', response.status);
      return {
        totalUsers: 0,
        totalEnrollments: 0,
        totalCompletions: 0,
        totalCertificates: 0,
        totalPdHours: 0,
        avgStressScore: 'N/A',
      };
    }

    return await response.json();
  } catch (error) {
    console.error('[Admin Stats] Error fetching stats:', error);
    return {
      totalUsers: 0,
      totalEnrollments: 0,
      totalCompletions: 0,
      totalCertificates: 0,
      totalPdHours: 0,
      avgStressScore: 'N/A',
    };
  }
}
