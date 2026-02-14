import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

let cachedSupabase: ReturnType<typeof createClient> | null = null;

function getSupabaseAdmin() {
  if (cachedSupabase) return cachedSupabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase credentials');
  }

  cachedSupabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  return cachedSupabase;
}

// GET - Fetch analytics data for charts
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    // Fetch all data in parallel
    const [
      enrollmentsRes,
      profilesRes,
      coursesRes,
      certificatesRes,
      activityRes,
    ] = await Promise.all([
      supabase.from('hub_enrollments').select('id, course_id, status, progress_pct, created_at, enrolled_at, completed_at').limit(2000),
      supabase.from('hub_profiles').select('id, onboarding_data, created_at').limit(1000),
      supabase.from('hub_courses').select('id, title').eq('is_published', true),
      supabase.from('hub_certificates').select('id, pd_hours, issued_at').limit(1000),
      supabase.from('hub_activity_log').select('id, action, metadata, created_at').eq('action', 'stress_checkin').limit(1000),
    ]);

    const enrollments = (enrollmentsRes.data || []) as {
      id: string;
      course_id: string;
      status: string;
      progress_pct: number;
      created_at: string;
      enrolled_at: string;
      completed_at: string | null;
    }[];
    const profiles = (profilesRes.data || []) as {
      id: string;
      onboarding_data: { goals?: string[] } | null;
      created_at: string;
    }[];
    const courses = (coursesRes.data || []) as { id: string; title: string }[];
    const certificates = (certificatesRes.data || []) as { id: string; pd_hours: number; issued_at: string }[];
    const stressCheckins = (activityRes.data || []) as {
      id: string;
      action: string;
      metadata: { score?: number };
      created_at: string;
    }[];

    // Build course title map
    const courseMap = new Map(courses.map(c => [c.id, c.title]));

    // 1. Enrollments Over Time (by month)
    const enrollmentsByMonth: Record<string, number> = {};
    enrollments.forEach(e => {
      const date = new Date(e.enrolled_at || e.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      enrollmentsByMonth[key] = (enrollmentsByMonth[key] || 0) + 1;
    });

    // 2. Completions Over Time (by month)
    const completionsByMonth: Record<string, number> = {};
    enrollments.filter(e => e.status === 'completed' && e.completed_at).forEach(e => {
      const date = new Date(e.completed_at as string);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      completionsByMonth[key] = (completionsByMonth[key] || 0) + 1;
    });

    // 3. Top Courses by Enrollment
    const courseEnrollments: Record<string, number> = {};
    enrollments.forEach(e => {
      courseEnrollments[e.course_id] = (courseEnrollments[e.course_id] || 0) + 1;
    });
    const topCourses = Object.entries(courseEnrollments)
      .map(([courseId, count]) => ({
        courseId,
        title: courseMap.get(courseId) || 'Unknown Course',
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // 4. Stress Trends (average by month)
    const stressByMonth: Record<string, { total: number; count: number }> = {};
    stressCheckins.forEach(s => {
      const score = (s.metadata as { score?: number })?.score;
      if (score !== undefined) {
        const date = new Date(s.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!stressByMonth[key]) stressByMonth[key] = { total: 0, count: 0 };
        stressByMonth[key].total += score;
        stressByMonth[key].count += 1;
      }
    });
    const stressTrends = Object.entries(stressByMonth)
      .map(([month, data]) => ({
        month,
        avgScore: Math.round((data.total / data.count) * 10) / 10,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // 5. Goal Alignment (from profiles onboarding_data.goals)
    const goalCounts: Record<string, number> = {};
    profiles.forEach(p => {
      const goals = (p.onboarding_data as { goals?: string[] })?.goals || [];
      goals.forEach(goal => {
        goalCounts[goal] = (goalCounts[goal] || 0) + 1;
      });
    });
    const goalAlignment = Object.entries(goalCounts)
      .map(([goal, count]) => ({ goal: formatGoalName(goal), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // 6. AI Insights data
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

    const enrollmentsThisMonth = enrollmentsByMonth[thisMonth] || 0;
    const enrollmentsLastMonth = enrollmentsByMonth[lastMonthKey] || 0;
    const enrollmentChange = enrollmentsLastMonth > 0
      ? Math.round(((enrollmentsThisMonth - enrollmentsLastMonth) / enrollmentsLastMonth) * 100)
      : 0;

    const completionsThisMonth = completionsByMonth[thisMonth] || 0;
    const totalCompletions = enrollments.filter(e => e.status === 'completed').length;
    const totalEnrollments = enrollments.length;
    const completionRate = totalEnrollments > 0 ? Math.round((totalCompletions / totalEnrollments) * 100) : 0;

    // Course with lowest completion rate (drop-off)
    const courseStats: Record<string, { enrolled: number; completed: number }> = {};
    enrollments.forEach(e => {
      if (!courseStats[e.course_id]) courseStats[e.course_id] = { enrolled: 0, completed: 0 };
      courseStats[e.course_id].enrolled += 1;
      if (e.status === 'completed') courseStats[e.course_id].completed += 1;
    });

    let lowestCompletionCourse = { title: 'N/A', rate: 100 };
    Object.entries(courseStats).forEach(([courseId, stats]) => {
      if (stats.enrolled >= 10) { // Only consider courses with 10+ enrollments
        const rate = Math.round((stats.completed / stats.enrolled) * 100);
        if (rate < lowestCompletionCourse.rate) {
          lowestCompletionCourse = { title: courseMap.get(courseId) || 'Unknown', rate };
        }
      }
    });

    // Format time series data for charts
    const months = getMonthRange('2025-08', '2026-02');
    const enrollmentsTimeSeries = months.map(m => ({
      month: formatMonthLabel(m),
      value: enrollmentsByMonth[m] || 0,
    }));
    const completionsTimeSeries = months.map(m => ({
      month: formatMonthLabel(m),
      value: completionsByMonth[m] || 0,
    }));

    return NextResponse.json({
      enrollmentsTimeSeries,
      completionsTimeSeries,
      topCourses,
      stressTrends: stressTrends.map(s => ({ month: formatMonthLabel(s.month), avgScore: s.avgScore })),
      goalAlignment,
      insights: {
        enrollmentsThisMonth,
        enrollmentsLastMonth,
        enrollmentChange,
        completionsThisMonth,
        totalCompletions,
        completionRate,
        lowestCompletionCourse,
        totalUsers: profiles.length,
        totalPdHours: certificates.reduce((sum, c) => sum + (c.pd_hours || 0), 0),
      },
    });
  } catch (error) {
    console.error('[Analytics API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function formatGoalName(goal: string): string {
  return goal
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getMonthRange(start: string, end: string): string[] {
  const months: string[] = [];
  const [startYear, startMonth] = start.split('-').map(Number);
  const [endYear, endMonth] = end.split('-').map(Number);

  let year = startYear;
  let month = startMonth;

  while (year < endYear || (year === endYear && month <= endMonth)) {
    months.push(`${year}-${String(month).padStart(2, '0')}`);
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }

  return months;
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}
