import { getSupabase } from '@/lib/supabase';

export interface TrackerEligibility {
  isEligible: boolean;
  completedCourses: number;
  totalAssessments: number;
  requiredCourses: number;
  requiredAssessments: number;
}

export interface StressDataPoint {
  date: string;
  score: number;
  formattedDate: string;
}

export interface LearningStats {
  completedCourses: number;
  totalPdHours: number;
  currentStreak: number;
}

export interface GoalProgress {
  goalName: string;
  coursesCompleted: number;
  totalCoursesInCategory: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  requirement: string;
  icon: string;
  isUnlocked: boolean;
}

/**
 * Check if user is eligible to view the transformation tracker
 */
export async function checkTrackerEligibility(userId: string): Promise<TrackerEligibility> {
  const supabase = getSupabase();

  // Count completed courses
  const { count: completedCourses } = await supabase
    .from('hub_enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed');

  // Count total assessments
  const { count: totalAssessments } = await supabase
    .from('hub_assessments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const coursesCount = completedCourses || 0;
  const assessmentsCount = totalAssessments || 0;

  return {
    isEligible: coursesCount >= 1 && assessmentsCount >= 2,
    completedCourses: coursesCount,
    totalAssessments: assessmentsCount,
    requiredCourses: 1,
    requiredAssessments: 2,
  };
}

/**
 * Get stress check-in data over time
 */
export async function getStressOverTime(userId: string): Promise<StressDataPoint[]> {
  const supabase = getSupabase();

  const { data } = await supabase
    .from('hub_assessments')
    .select('score, created_at')
    .eq('user_id', userId)
    .eq('type', 'daily_check_in')
    .order('created_at', { ascending: true });

  if (!data) return [];

  return data.map((item) => {
    const date = new Date(item.created_at);
    return {
      date: item.created_at,
      score: item.score,
      formattedDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  });
}

/**
 * Get learning progress stats
 */
export async function getLearningStats(userId: string): Promise<LearningStats> {
  const supabase = getSupabase();

  // Count completed courses
  const { count: completedCourses } = await supabase
    .from('hub_enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed');

  // Sum PD hours from certificates
  const { data: certificates } = await supabase
    .from('hub_certificates')
    .select('pd_hours')
    .eq('user_id', userId);

  const totalPdHours = certificates?.reduce((sum, cert) => sum + (cert.pd_hours || 0), 0) || 0;

  // Calculate streak - check consecutive days with activity
  const streak = await calculateStreak(userId);

  return {
    completedCourses: completedCourses || 0,
    totalPdHours,
    currentStreak: streak,
  };
}

/**
 * Calculate consecutive days streak with any activity
 */
async function calculateStreak(userId: string): Promise<number> {
  const supabase = getSupabase();

  // Get all activity dates (check-ins, lesson progress, enrollments)
  const [checkIns, lessonProgress, enrollments] = await Promise.all([
    supabase
      .from('hub_assessments')
      .select('created_at')
      .eq('user_id', userId)
      .eq('type', 'daily_check_in'),
    supabase
      .from('hub_lesson_progress')
      .select('updated_at')
      .eq('user_id', userId),
    supabase
      .from('hub_enrollments')
      .select('created_at')
      .eq('user_id', userId),
  ]);

  // Collect all unique dates
  const allDates = new Set<string>();
  
  checkIns.data?.forEach((item) => {
    allDates.add(new Date(item.created_at).toISOString().split('T')[0]);
  });
  
  lessonProgress.data?.forEach((item) => {
    allDates.add(new Date(item.updated_at).toISOString().split('T')[0]);
  });
  
  enrollments.data?.forEach((item) => {
    allDates.add(new Date(item.created_at).toISOString().split('T')[0]);
  });

  // Sort dates descending
  const sortedDates = Array.from(allDates).sort().reverse();
  
  if (sortedDates.length === 0) return 0;

  // Check if today or yesterday has activity
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0; // Streak is broken
  }

  // Count consecutive days
  let streak = 1;
  let currentDate = new Date(sortedDates[0]);

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(currentDate.getTime() - 86400000);
    const prevDateStr = prevDate.toISOString().split('T')[0];
    
    if (sortedDates[i] === prevDateStr) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get user goals with progress
 */
export async function getGoalsProgress(userId: string): Promise<GoalProgress[]> {
  const supabase = getSupabase();

  // Get user's goals
  const { data: goals } = await supabase
    .from('hub_user_goals')
    .select('goal_name')
    .eq('user_id', userId);

  if (!goals || goals.length === 0) return [];

  // Map goals to course categories
  const goalToCategoryMap: Record<string, string> = {
    'Reduce Stress': 'Stress & Wellness',
    'Work-Life Balance': 'Stress & Wellness',
    'Classroom Management': 'Classroom Management',
    'Save Time': 'Time Savers',
    'Leadership Skills': 'Leadership',
    'Better Communication': 'Communication',
    'New Teacher Support': 'New Teacher',
  };

  const progressPromises = goals.map(async (goal) => {
    const category = goalToCategoryMap[goal.goal_name] || goal.goal_name;

    // Get completed courses in this category
    const { data: completedEnrollments } = await supabase
      .from('hub_enrollments')
      .select(`
        id,
        course:hub_courses!inner(category)
      `)
      .eq('user_id', userId)
      .eq('status', 'completed');

    const coursesCompleted = completedEnrollments?.filter((e) => {
      const course = Array.isArray(e.course) ? e.course[0] : e.course;
      return course?.category === category;
    }).length || 0;

    // Get total courses in this category
    const { count: totalCourses } = await supabase
      .from('hub_courses')
      .select('*', { count: 'exact', head: true })
      .eq('category', category)
      .eq('is_published', true);

    return {
      goalName: goal.goal_name,
      coursesCompleted,
      totalCoursesInCategory: totalCourses || 0,
    };
  });

  return Promise.all(progressPromises);
}

/**
 * Get milestone achievements
 */
export async function getMilestones(userId: string): Promise<Milestone[]> {
  const supabase = getSupabase();

  // Gather all needed data
  const [
    { count: completedCourses },
    { data: certificates },
    { data: checkIns },
    { count: momentModeCount },
  ] = await Promise.all([
    supabase
      .from('hub_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed'),
    supabase
      .from('hub_certificates')
      .select('pd_hours')
      .eq('user_id', userId),
    supabase
      .from('hub_assessments')
      .select('created_at')
      .eq('user_id', userId)
      .eq('type', 'daily_check_in')
      .order('created_at', { ascending: true }),
    supabase
      .from('hub_assessments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('type', 'moment_mode'),
  ]);

  const totalPdHours = certificates?.reduce((sum, cert) => sum + (cert.pd_hours || 0), 0) || 0;
  
  // Calculate check-in streak
  const checkInStreak = calculateCheckInStreak(checkIns?.map((c) => c.created_at) || []);

  const milestones: Milestone[] = [
    {
      id: 'first_step',
      title: 'First Step',
      description: 'Completed your first course',
      requirement: 'Complete 1 course',
      icon: 'footprints',
      isUnlocked: (completedCourses || 0) >= 1,
    },
    {
      id: 'consistent',
      title: 'Consistent',
      description: 'Checked in for 7 days straight',
      requirement: '7-day check-in streak',
      icon: 'calendar-check',
      isUnlocked: checkInStreak >= 7,
    },
    {
      id: 'growth_mindset',
      title: 'Growth Mindset',
      description: 'Completed 3 courses',
      requirement: 'Complete 3 courses',
      icon: 'brain',
      isUnlocked: (completedCourses || 0) >= 3,
    },
    {
      id: 'pd_champion',
      title: 'PD Champion',
      description: 'Earned 10+ PD hours',
      requirement: 'Earn 10 PD hours',
      icon: 'trophy',
      isUnlocked: totalPdHours >= 10,
    },
    {
      id: 'self_care_pro',
      title: 'Self-Care Pro',
      description: 'Used Moment Mode 5 times',
      requirement: 'Use Moment Mode 5 times',
      icon: 'heart',
      isUnlocked: (momentModeCount || 0) >= 5,
    },
  ];

  return milestones;
}

/**
 * Calculate consecutive check-in days
 */
function calculateCheckInStreak(dates: string[]): number {
  if (dates.length === 0) return 0;

  const uniqueDates = [...new Set(dates.map((d) => new Date(d).toISOString().split('T')[0]))].sort().reverse();
  
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  let currentDate = new Date(uniqueDates[0]);

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(currentDate.getTime() - 86400000);
    const prevDateStr = prevDate.toISOString().split('T')[0];
    
    if (uniqueDates[i] === prevDateStr) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
}
