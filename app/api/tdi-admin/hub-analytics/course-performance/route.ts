import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

let cachedSupabase: ReturnType<typeof createClient> | null = null;

function getSupabaseAdmin() {
  if (cachedSupabase) return cachedSupabase;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) throw new Error('Missing Supabase credentials');
  cachedSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  return cachedSupabase;
}

// Filter out test accounts by email pattern
function isTestAccount(email: string | null): boolean {
  if (!email) return false;
  return /test|demo|example\.com|@tdi\.internal/i.test(email);
}

interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  progress_pct: number;
  enrolled_at: string;
  completed_at: string | null;
  created_at: string;
}

interface Course {
  id: string;
  title: string;
  category: string | null;
}

interface Profile {
  id: string;
  email?: string;
  onboarding_data?: {
    school_name?: string;
    state?: string;
  };
}

interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  completed_at: string | null;
}

interface Module {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  order_index: number;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);

    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const courseId = searchParams.get('course_id');

    // Fetch base data
    const [enrollmentsRes, coursesRes, profilesRes, modulesRes, lessonsRes, lessonProgressRes] = await Promise.all([
      supabase.from('hub_enrollments').select('*').limit(10000),
      supabase.from('hub_courses').select('id, title, category').eq('is_published', true),
      supabase.from('hub_profiles').select('id, onboarding_data').limit(5000),
      supabase.from('hub_modules').select('id, course_id, title, order_index').limit(1000),
      supabase.from('hub_lessons').select('id, module_id, title, order_index').limit(5000),
      supabase.from('hub_lesson_progress').select('*').limit(50000),
    ]);

    // Get user emails for filtering test accounts
    const { data: authUsers } = await supabase.auth.admin.listUsers({ perPage: 5000 });
    const userEmailMap = new Map<string, string>();
    authUsers?.users?.forEach(u => {
      if (u.email) userEmailMap.set(u.id, u.email);
    });

    const allEnrollments = (enrollmentsRes.data || []) as Enrollment[];
    const courses = (coursesRes.data || []) as Course[];
    const allProfiles = (profilesRes.data || []) as Profile[];
    const modules = (modulesRes.data || []) as Module[];
    const lessons = (lessonsRes.data || []) as Lesson[];
    const lessonProgress = (lessonProgressRes.data || []) as LessonProgress[];

    const courseMap = new Map(courses.map(c => [c.id, c]));

    // Filter out test accounts
    const validUserIds = new Set(
      allProfiles
        .filter(p => !isTestAccount(userEmailMap.get(p.id) || null))
        .map(p => p.id)
    );

    // Filter enrollments
    let enrollments = allEnrollments.filter(e => validUserIds.has(e.user_id));

    if (dateFrom) {
      enrollments = enrollments.filter(e => new Date(e.enrolled_at || e.created_at) >= new Date(dateFrom));
    }
    if (dateTo) {
      enrollments = enrollments.filter(e => new Date(e.enrolled_at || e.created_at) <= new Date(dateTo));
    }

    // Create profile map for school data
    const profileMap = new Map(allProfiles.map(p => [p.id, p]));

    // === A. Course Completion Rates by School ===
    const schoolCourseStats: Record<string, Record<string, { enrolled: number; completed: number }>> = {};

    enrollments.forEach(e => {
      const profile = profileMap.get(e.user_id);
      const school = profile?.onboarding_data?.school_name || 'Unknown School';
      const course = courseMap.get(e.course_id);
      if (!course) return;

      if (!schoolCourseStats[school]) schoolCourseStats[school] = {};
      if (!schoolCourseStats[school][e.course_id]) {
        schoolCourseStats[school][e.course_id] = { enrolled: 0, completed: 0 };
      }
      schoolCourseStats[school][e.course_id].enrolled++;
      if (e.status === 'completed') {
        schoolCourseStats[school][e.course_id].completed++;
      }
    });

    const completionBySchool = Object.entries(schoolCourseStats)
      .map(([school, courseStats]) => ({
        school,
        courses: Object.entries(courseStats).map(([cId, stats]) => ({
          courseId: cId,
          courseTitle: courseMap.get(cId)?.title || 'Unknown',
          enrolled: stats.enrolled,
          completed: stats.completed,
          completionRate: stats.enrolled > 0 ? Math.round((stats.completed / stats.enrolled) * 100) : 0,
        })),
        totalEnrolled: Object.values(courseStats).reduce((sum, s) => sum + s.enrolled, 0),
        totalCompleted: Object.values(courseStats).reduce((sum, s) => sum + s.completed, 0),
      }))
      .filter(s => s.totalEnrolled >= 3)
      .sort((a, b) => b.totalEnrolled - a.totalEnrolled)
      .slice(0, 20);

    // === B. Time to Complete Courses ===
    const courseCompletionTimes: Record<string, number[]> = {};

    enrollments.forEach(e => {
      if (e.status === 'completed' && e.completed_at && e.enrolled_at) {
        const enrollDate = new Date(e.enrolled_at);
        const completeDate = new Date(e.completed_at);
        const daysToComplete = Math.max(1, Math.round((completeDate.getTime() - enrollDate.getTime()) / (1000 * 60 * 60 * 24)));

        if (!courseCompletionTimes[e.course_id]) courseCompletionTimes[e.course_id] = [];
        courseCompletionTimes[e.course_id].push(daysToComplete);
      }
    });

    const timeToComplete = Object.entries(courseCompletionTimes)
      .map(([courseId, times]) => {
        const sorted = [...times].sort((a, b) => a - b);
        const median = sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];
        const avg = times.reduce((a, b) => a + b, 0) / times.length;

        return {
          courseId,
          courseTitle: courseMap.get(courseId)?.title || 'Unknown',
          category: courseMap.get(courseId)?.category || null,
          avgDays: Math.round(avg * 10) / 10,
          medianDays: Math.round(median * 10) / 10,
          fastestDays: Math.min(...times),
          slowestDays: Math.max(...times),
          completionCount: times.length,
        };
      })
      .filter(c => c.completionCount >= 3)
      .sort((a, b) => a.medianDays - b.medianDays);

    // === C. Most/Least Popular Courses ===
    const coursesEnrollmentStats: Record<string, {
      enrolled: number;
      active: number;
      completed: number;
      monthlyEnrollments: number[];
    }> = {};

    // Initialize with all courses
    courses.forEach(c => {
      coursesEnrollmentStats[c.id] = { enrolled: 0, active: 0, completed: 0, monthlyEnrollments: new Array(6).fill(0) };
    });

    // Get 6-month enrollment trend
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    enrollments.forEach(e => {
      if (!coursesEnrollmentStats[e.course_id]) {
        coursesEnrollmentStats[e.course_id] = { enrolled: 0, active: 0, completed: 0, monthlyEnrollments: new Array(6).fill(0) };
      }
      coursesEnrollmentStats[e.course_id].enrolled++;
      if (e.status === 'completed') {
        coursesEnrollmentStats[e.course_id].completed++;
      } else if (e.progress_pct > 0) {
        coursesEnrollmentStats[e.course_id].active++;
      }

      // Track monthly trend
      const enrollDate = new Date(e.enrolled_at || e.created_at);
      if (enrollDate >= sixMonthsAgo) {
        const monthsAgo = Math.floor((Date.now() - enrollDate.getTime()) / (30 * 24 * 60 * 60 * 1000));
        if (monthsAgo >= 0 && monthsAgo < 6) {
          coursesEnrollmentStats[e.course_id].monthlyEnrollments[5 - monthsAgo]++;
        }
      }
    });

    const coursePopularity = Object.entries(coursesEnrollmentStats)
      .map(([courseId, stats]) => ({
        courseId,
        courseTitle: courseMap.get(courseId)?.title || 'Unknown',
        category: courseMap.get(courseId)?.category || null,
        totalEnrolled: stats.enrolled,
        active: stats.active,
        completed: stats.completed,
        completionRate: stats.enrolled > 0 ? Math.round((stats.completed / stats.enrolled) * 100) : 0,
        enrollmentTrend: stats.monthlyEnrollments,
      }))
      .sort((a, b) => b.totalEnrolled - a.totalEnrolled);

    // === D. Drop-off Points (Funnel) ===
    const selectedCourseId = courseId || (courses[0]?.id);
    let dropoffFunnel: { stage: string; count: number; percentage: number; isDropoff?: boolean }[] = [];

    if (selectedCourseId) {
      const courseModules = modules
        .filter(m => m.course_id === selectedCourseId)
        .sort((a, b) => a.order_index - b.order_index);

      const courseLessons = lessons.filter(l =>
        courseModules.some(m => m.id === l.module_id)
      );

      const moduleIdToLessons = new Map<string, typeof courseLessons>();
      courseLessons.forEach(l => {
        const existing = moduleIdToLessons.get(l.module_id) || [];
        existing.push(l);
        moduleIdToLessons.set(l.module_id, existing);
      });

      // Get enrollments for this course
      const courseEnrollments = enrollments.filter(e => e.course_id === selectedCourseId);
      const enrolledUserIds = new Set(courseEnrollments.map(e => e.user_id));

      // Track progress through modules
      const userLessonProgress = lessonProgress.filter(lp =>
        enrolledUserIds.has(lp.user_id) &&
        courseLessons.some(l => l.id === lp.lesson_id) &&
        lp.completed_at
      );

      // Build funnel
      const totalEnrolled = courseEnrollments.length;

      // Count users who completed at least one lesson
      const usersStarted = new Set(userLessonProgress.map(lp => lp.user_id)).size;

      const funnel: { stage: string; count: number }[] = [
        { stage: 'Enrolled', count: totalEnrolled },
        { stage: 'Started (1+ lesson)', count: usersStarted },
      ];

      // Track completion per module
      courseModules.forEach((module, idx) => {
        const moduleLessons = moduleIdToLessons.get(module.id) || [];
        const moduleLessonIds = new Set(moduleLessons.map(l => l.id));

        // Count users who completed ALL lessons in this module
        const userCompletions = new Map<string, number>();
        userLessonProgress.forEach(lp => {
          if (moduleLessonIds.has(lp.lesson_id)) {
            userCompletions.set(lp.user_id, (userCompletions.get(lp.user_id) || 0) + 1);
          }
        });

        const usersCompletedModule = Array.from(userCompletions.entries())
          .filter(([, count]) => count >= moduleLessons.length)
          .length;

        funnel.push({
          stage: `Module ${idx + 1}: ${module.title.substring(0, 25)}${module.title.length > 25 ? '...' : ''}`,
          count: usersCompletedModule,
        });
      });

      // Add course completion
      const completedCourse = courseEnrollments.filter(e => e.status === 'completed').length;
      funnel.push({ stage: 'Course Completed', count: completedCourse });

      // Calculate percentages and find biggest drop-off
      let maxDropoff = 0;
      let maxDropoffIdx = -1;

      dropoffFunnel = funnel.map((stage, idx) => {
        const percentage = totalEnrolled > 0 ? Math.round((stage.count / totalEnrolled) * 100) : 0;

        if (idx > 0) {
          const dropoff = funnel[idx - 1].count - stage.count;
          if (dropoff > maxDropoff) {
            maxDropoff = dropoff;
            maxDropoffIdx = idx;
          }
        }

        return { ...stage, percentage };
      });

      if (maxDropoffIdx > 0) {
        dropoffFunnel[maxDropoffIdx].isDropoff = true;
      }
    }

    return NextResponse.json({
      completionBySchool,
      timeToComplete,
      coursePopularity,
      dropoffFunnel,
      courses: courses.map(c => ({ id: c.id, title: c.title })),
      selectedCourseId,
    });
  } catch (error) {
    console.error('[Course Performance API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
