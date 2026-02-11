import { getSupabase } from '@/lib/supabase';

export interface RecommendedCourse {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  pd_hours: number;
  estimated_minutes: number;
  thumbnail_url?: string;
  reason: string;
}

export interface RecommendationsResult {
  courses: RecommendedCourse[];
  reasons: string[];
}

/**
 * Get personalized course recommendations for a user
 * Rule-based recommendation logic (no AI needed)
 */
export async function getRecommendations(userId: string): Promise<RecommendationsResult> {
  const supabase = getSupabase();

  // Gather user data in parallel
  const [
    { data: profile },
    { data: goals },
    { data: latestCheckIn },
    { data: enrollments },
  ] = await Promise.all([
    // Get user's role
    supabase
      .from('hub_profiles')
      .select('role')
      .eq('id', userId)
      .single(),
    // Get user's goals
    supabase
      .from('hub_user_goals')
      .select('goal_name')
      .eq('user_id', userId),
    // Get latest stress score
    supabase
      .from('hub_assessments')
      .select('score')
      .eq('user_id', userId)
      .eq('type', 'daily_check_in')
      .order('created_at', { ascending: false })
      .limit(1),
    // Get user's enrolled courses (both active and completed)
    supabase
      .from('hub_enrollments')
      .select('course_id')
      .eq('user_id', userId),
  ]);

  // Get IDs of courses to exclude
  const excludedCourseIds = enrollments?.map((e) => e.course_id) || [];

  // Get all published courses
  const { data: allCourses } = await supabase
    .from('hub_courses')
    .select('id, slug, title, description, category, pd_hours, estimated_minutes, thumbnail_url')
    .eq('is_published', true);

  if (!allCourses || allCourses.length === 0) {
    return { courses: [], reasons: [] };
  }

  // Filter out already enrolled courses
  const availableCourses = allCourses.filter((c) => !excludedCourseIds.includes(c.id));

  if (availableCourses.length === 0) {
    return { courses: [], reasons: [] };
  }

  // Score and rank courses based on rules
  const scoredCourses: { course: typeof availableCourses[0]; score: number; reason: string }[] = [];

  const stressScore = latestCheckIn?.[0]?.score;
  const userRole = profile?.role;
  const userGoals = goals?.map((g) => g.goal_name) || [];

  // Map goals to categories
  const goalToCategoryMap: Record<string, string> = {
    'Reduce Stress': 'Stress & Wellness',
    'Work-Life Balance': 'Stress & Wellness',
    'Classroom Management': 'Classroom Management',
    'Save Time': 'Time Savers',
    'Leadership Skills': 'Leadership',
    'Better Communication': 'Communication',
    'New Teacher Support': 'New Teacher',
  };

  // Map roles to categories
  const roleToCategoryMap: Record<string, string> = {
    'new_teacher': 'New Teacher',
    'student_teacher': 'New Teacher',
    'admin': 'Leadership',
    'school_leader': 'Leadership',
    'instructional_coach': 'Leadership',
    'coach': 'Leadership',
  };

  for (const course of availableCourses) {
    let score = 0;
    let reason = '';

    // Rule 1: High stress - prioritize wellness (highest priority)
    if (stressScore && stressScore >= 4 && course.category === 'Stress & Wellness') {
      score += 100;
      reason = 'Based on your stress level';
    }

    // Rule 2: Match to user's goals
    for (const goal of userGoals) {
      const matchedCategory = goalToCategoryMap[goal];
      if (matchedCategory && course.category === matchedCategory) {
        score += 50;
        if (!reason) {
          reason = `Matches your goal: ${goal}`;
        }
        break; // Only count one goal match per course
      }
    }

    // Rule 3: Match to user's role
    if (userRole) {
      const matchedCategory = roleToCategoryMap[userRole];
      if (matchedCategory && course.category === matchedCategory) {
        score += 30;
        if (!reason) {
          reason = 'Recommended for your role';
        }
      }
    }

    // Default reason for courses that match nothing specific
    if (!reason && score === 0) {
      reason = 'Popular with teachers';
      score = 1; // Small base score
    }

    scoredCourses.push({ course, score, reason });
  }

  // Sort by score descending and take top 3
  scoredCourses.sort((a, b) => b.score - a.score);
  const topCourses = scoredCourses.slice(0, 3);

  return {
    courses: topCourses.map((sc) => ({
      ...sc.course,
      reason: sc.reason,
    })),
    reasons: topCourses.map((sc) => sc.reason),
  };
}

/**
 * Check if user has completed onboarding (needed to show recommendations)
 */
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  const supabase = getSupabase();

  const { data } = await supabase
    .from('hub_profiles')
    .select('onboarding_completed')
    .eq('id', userId)
    .single();

  return data?.onboarding_completed === true;
}
