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

// Type definitions
interface Profile {
  id: string;
  role: string;
  onboarding_data: {
    grade_level?: string;
    years_experience?: number;
    goals?: string[];
    initial_stress_level?: number;
    current_stress_level?: number;
    school_name?: string;
    state?: string;
    gender?: string;
  } | null;
  preferences: { preferred_language?: string } | null;
  created_at: string;
  is_example?: boolean;
}

interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  progress_pct: number;
  created_at: string;
  enrolled_at: string;
  completed_at: string | null;
}

interface Certificate {
  id: string;
  user_id: string;
  pd_hours: number;
  issued_at: string;
}

interface Activity {
  id: string;
  user_id: string;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface Course {
  id: string;
  title: string;
  category?: string;
}

// Utility functions
function getMonthKey(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function getMonthRange(months: number): string[] {
  const result: string[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return result;
}

function formatGoalName(goal: string): string {
  return goal.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// GET - Comprehensive analytics endpoint
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);

    // Parse filters
    const filters = {
      state: searchParams.get('state'),
      org: searchParams.get('org'),
      role: searchParams.get('role'),
      gradeLevel: searchParams.get('grade_level'),
      yearsExp: searchParams.get('years_experience'),
      gender: searchParams.get('gender'),
      language: searchParams.get('language'),
      dateFrom: searchParams.get('date_from'),
      dateTo: searchParams.get('date_to'),
    };

    // Fetch all base data
    const [profilesRes, enrollmentsRes, coursesRes, certificatesRes, activityRes] = await Promise.all([
      supabase.from('hub_profiles').select('*').limit(2000),
      supabase.from('hub_enrollments').select('*').limit(5000),
      supabase.from('hub_courses').select('id, title, category').eq('is_published', true),
      supabase.from('hub_certificates').select('*').limit(2000),
      supabase.from('hub_activity_log').select('*').limit(5000),
    ]);

    const allProfiles = (profilesRes.data || []) as Profile[];
    const allEnrollments = (enrollmentsRes.data || []) as Enrollment[];
    const courses = (coursesRes.data || []) as Course[];
    const allCertificates = (certificatesRes.data || []) as Certificate[];
    const allActivity = (activityRes.data || []) as Activity[];

    const courseMap = new Map(courses.map(c => [c.id, c.title]));

    // Apply filters to profiles
    let profiles = allProfiles;
    if (filters.state) {
      profiles = profiles.filter(p => p.onboarding_data?.state === filters.state);
    }
    if (filters.org) {
      profiles = profiles.filter(p => p.onboarding_data?.school_name === filters.org);
    }
    if (filters.role && filters.role !== 'all') {
      profiles = profiles.filter(p => p.role === filters.role);
    }
    if (filters.gradeLevel && filters.gradeLevel !== 'all') {
      profiles = profiles.filter(p => p.onboarding_data?.grade_level === filters.gradeLevel);
    }
    if (filters.gender && filters.gender !== 'all') {
      profiles = profiles.filter(p => p.onboarding_data?.gender === filters.gender);
    }
    if (filters.language && filters.language !== 'all') {
      profiles = profiles.filter(p => (p.preferences?.preferred_language || 'english') === filters.language);
    }

    const filteredUserIds = new Set(profiles.map(p => p.id));

    // Filter enrollments by user and date
    let enrollments = allEnrollments.filter(e => filteredUserIds.has(e.user_id));
    if (filters.dateFrom) {
      enrollments = enrollments.filter(e => new Date(e.enrolled_at || e.created_at) >= new Date(filters.dateFrom!));
    }
    if (filters.dateTo) {
      enrollments = enrollments.filter(e => new Date(e.enrolled_at || e.created_at) <= new Date(filters.dateTo!));
    }

    // Filter certificates
    let certificates = allCertificates.filter(c => filteredUserIds.has(c.user_id));

    // Filter activity
    let activity = allActivity.filter(a => filteredUserIds.has(a.user_id));

    // === STATS ===
    const totalUsers = profiles.length;
    const totalEnrollments = enrollments.length;
    const completions = enrollments.filter(e => e.status === 'completed');
    const totalCompletions = completions.length;
    const completionRate = totalEnrollments > 0 ? Math.round((totalCompletions / totalEnrollments) * 100) : 0;
    const totalPdHours = certificates.reduce((sum, c) => sum + (c.pd_hours || 0), 0);

    // Stress calculation
    const stressData = profiles.filter(p => p.onboarding_data?.current_stress_level);
    const avgStressCurrent = stressData.length > 0
      ? stressData.reduce((sum, p) => sum + (p.onboarding_data?.current_stress_level || 0), 0) / stressData.length
      : null;
    const avgStressInitial = stressData.length > 0
      ? stressData.reduce((sum, p) => sum + (p.onboarding_data?.initial_stress_level || 0), 0) / stressData.length
      : null;
    const stressImproved = avgStressCurrent !== null && avgStressInitial !== null && avgStressCurrent < avgStressInitial;

    // === TIME SERIES ===
    const months = getMonthRange(12);

    // Enrollments over time
    const enrollmentsByMonth: Record<string, number> = {};
    enrollments.forEach(e => {
      const key = getMonthKey(e.enrolled_at || e.created_at);
      enrollmentsByMonth[key] = (enrollmentsByMonth[key] || 0) + 1;
    });
    const enrollmentsTimeSeries = months.map(m => ({
      month: formatMonthLabel(m),
      monthKey: m,
      value: enrollmentsByMonth[m] || 0,
    }));

    // Completions over time
    const completionsByMonth: Record<string, number> = {};
    completions.forEach(e => {
      if (e.completed_at) {
        const key = getMonthKey(e.completed_at);
        completionsByMonth[key] = (completionsByMonth[key] || 0) + 1;
      }
    });
    const completionsTimeSeries = months.map(m => ({
      month: formatMonthLabel(m),
      monthKey: m,
      value: completionsByMonth[m] || 0,
    }));

    // PD Hours over time
    const pdByMonth: Record<string, number> = {};
    certificates.forEach(c => {
      const key = getMonthKey(c.issued_at);
      pdByMonth[key] = (pdByMonth[key] || 0) + (c.pd_hours || 0);
    });
    const pdTimeSeries = months.map(m => ({
      month: formatMonthLabel(m),
      monthKey: m,
      value: pdByMonth[m] || 0,
    }));

    // === COURSE PERFORMANCE ===
    const courseEnrollments: Record<string, { enrolled: number; completed: number }> = {};
    enrollments.forEach(e => {
      if (!courseEnrollments[e.course_id]) {
        courseEnrollments[e.course_id] = { enrolled: 0, completed: 0 };
      }
      courseEnrollments[e.course_id].enrolled += 1;
      if (e.status === 'completed') {
        courseEnrollments[e.course_id].completed += 1;
      }
    });

    const topCourses = Object.entries(courseEnrollments)
      .map(([courseId, stats]) => ({
        courseId,
        title: courseMap.get(courseId) || 'Unknown Course',
        enrollments: stats.enrolled,
        completions: stats.completed,
        completionRate: stats.enrolled > 0 ? Math.round((stats.completed / stats.enrolled) * 100) : 0,
      }))
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 10);

    const courseCompletionRates = Object.entries(courseEnrollments)
      .map(([courseId, stats]) => ({
        courseId,
        title: courseMap.get(courseId) || 'Unknown Course',
        completionRate: stats.enrolled > 0 ? Math.round((stats.completed / stats.enrolled) * 100) : 0,
        enrollments: stats.enrolled,
      }))
      .filter(c => c.enrollments >= 5)
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 10);

    // === DEMOGRAPHICS ===
    // By role
    const byRole: Record<string, number> = {};
    profiles.forEach(p => {
      const role = p.role || 'teacher';
      byRole[role] = (byRole[role] || 0) + 1;
    });
    const roleDistribution = Object.entries(byRole)
      .map(([role, count]) => ({ role: formatGoalName(role.replace('_', '-')), count }))
      .sort((a, b) => b.count - a.count);

    // By grade level
    const byGrade: Record<string, number> = {};
    profiles.forEach(p => {
      const grade = p.onboarding_data?.grade_level || 'Unknown';
      byGrade[grade] = (byGrade[grade] || 0) + 1;
    });
    const gradeOrder = ['Pre-K', 'K-2', '3-5', '6-8', '9-12', 'Higher Ed', 'Unknown'];
    const gradeDistribution = gradeOrder
      .filter(g => byGrade[g])
      .map(grade => ({ grade, count: byGrade[grade] || 0 }));

    // By years experience
    const byExperience: Record<string, number> = { '0-2': 0, '3-5': 0, '6-10': 0, '11-20': 0, '20+': 0 };
    profiles.forEach(p => {
      const years = p.onboarding_data?.years_experience || 0;
      if (years <= 2) byExperience['0-2']++;
      else if (years <= 5) byExperience['3-5']++;
      else if (years <= 10) byExperience['6-10']++;
      else if (years <= 20) byExperience['11-20']++;
      else byExperience['20+']++;
    });
    const experienceDistribution = Object.entries(byExperience)
      .map(([range, count]) => ({ range, count }));

    // By state
    const byState: Record<string, number> = {};
    profiles.forEach(p => {
      const state = p.onboarding_data?.state || 'Unknown';
      byState[state] = (byState[state] || 0) + 1;
    });
    const stateDistribution = Object.entries(byState)
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // By language
    const byLanguage: Record<string, number> = {};
    profiles.forEach(p => {
      const lang = p.preferences?.preferred_language || 'english';
      byLanguage[lang] = (byLanguage[lang] || 0) + 1;
    });
    const languageDistribution = Object.entries(byLanguage)
      .map(([language, count]) => ({ language: language.charAt(0).toUpperCase() + language.slice(1), count }))
      .sort((a, b) => b.count - a.count);

    // By gender
    const byGender: Record<string, number> = {};
    profiles.forEach(p => {
      const gender = p.onboarding_data?.gender || 'prefer_not_to_say';
      byGender[gender] = (byGender[gender] || 0) + 1;
    });
    const genderDistribution = Object.entries(byGender)
      .map(([gender, count]) => ({ gender: formatGoalName(gender.replace('_', ' ')), count }))
      .sort((a, b) => b.count - a.count);

    // === STRESS & WELLNESS ===
    // Stress by role
    const stressByRole: Record<string, { initial: number[]; current: number[] }> = {};
    profiles.forEach(p => {
      const role = p.role || 'teacher';
      if (!stressByRole[role]) stressByRole[role] = { initial: [], current: [] };
      if (p.onboarding_data?.initial_stress_level) stressByRole[role].initial.push(p.onboarding_data.initial_stress_level);
      if (p.onboarding_data?.current_stress_level) stressByRole[role].current.push(p.onboarding_data.current_stress_level);
    });
    const stressRoleComparison = Object.entries(stressByRole).map(([role, data]) => ({
      role: formatGoalName(role.replace('_', '-')),
      avgInitial: data.initial.length > 0 ? Math.round(data.initial.reduce((a, b) => a + b, 0) / data.initial.length * 10) / 10 : 0,
      avgCurrent: data.current.length > 0 ? Math.round(data.current.reduce((a, b) => a + b, 0) / data.current.length * 10) / 10 : 0,
    }));

    // % improved
    const improvedCount = profiles.filter(p =>
      p.onboarding_data?.initial_stress_level &&
      p.onboarding_data?.current_stress_level &&
      p.onboarding_data.current_stress_level < p.onboarding_data.initial_stress_level
    ).length;
    const improvementRate = stressData.length > 0 ? Math.round((improvedCount / stressData.length) * 100) : 0;

    // Stress over time from activity log
    const stressCheckins = activity.filter(a => a.action === 'stress_checkin');
    const stressByMonth: Record<string, number[]> = {};
    stressCheckins.forEach(a => {
      const score = (a.metadata as { score?: number })?.score;
      if (score !== undefined) {
        const key = getMonthKey(a.created_at);
        if (!stressByMonth[key]) stressByMonth[key] = [];
        stressByMonth[key].push(score);
      }
    });
    const stressTimeSeries = months.map(m => ({
      month: formatMonthLabel(m),
      monthKey: m,
      avgScore: stressByMonth[m]?.length > 0
        ? Math.round(stressByMonth[m].reduce((a, b) => a + b, 0) / stressByMonth[m].length * 10) / 10
        : null,
    })).filter(s => s.avgScore !== null);

    // === ENGAGEMENT ===
    // By day of week
    const byDayOfWeek: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    activity.forEach(a => {
      const day = new Date(a.created_at).getDay();
      byDayOfWeek[day]++;
    });
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const activityByDay = dayNames.map((name, i) => ({
      day: name,
      count: byDayOfWeek[i],
      isPeak: false,
    }));
    const maxDayCount = Math.max(...activityByDay.map(d => d.count));
    activityByDay.forEach(d => { d.isPeak = d.count === maxDayCount && maxDayCount > 0; });

    // By hour
    const byHour: Record<number, number> = {};
    for (let i = 0; i < 24; i++) byHour[i] = 0;
    activity.forEach(a => {
      const hour = new Date(a.created_at).getHours();
      byHour[hour]++;
    });
    const activityByHour = Object.entries(byHour)
      .filter(([h]) => parseInt(h) >= 6 && parseInt(h) <= 23)
      .map(([hour, count]) => ({
        hour: `${parseInt(hour) % 12 || 12}${parseInt(hour) < 12 ? 'am' : 'pm'}`,
        count,
        isPeak: false,
      }));
    const maxHourCount = Math.max(...activityByHour.map(h => h.count));
    activityByHour.forEach(h => { h.isPeak = h.count === maxHourCount && maxHourCount > 0; });

    // Monthly active users
    const mauByMonth: Record<string, Set<string>> = {};
    activity.forEach(a => {
      const key = getMonthKey(a.created_at);
      if (!mauByMonth[key]) mauByMonth[key] = new Set();
      mauByMonth[key].add(a.user_id);
    });
    const mauTimeSeries = months.map(m => ({
      month: formatMonthLabel(m),
      monthKey: m,
      users: mauByMonth[m]?.size || 0,
    }));

    // === GOALS ===
    const goalCounts: Record<string, number> = {};
    profiles.forEach(p => {
      const goals = p.onboarding_data?.goals || [];
      goals.forEach(goal => {
        goalCounts[goal] = (goalCounts[goal] || 0) + 1;
      });
    });
    const goalAlignment = Object.entries(goalCounts)
      .map(([goal, count]) => ({ goal: formatGoalName(goal), rawGoal: goal, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // === FILTER OPTIONS (for dropdowns) ===
    const uniqueStates = [...new Set(allProfiles.map(p => p.onboarding_data?.state).filter(Boolean))].sort();
    const uniqueOrgs = [...new Set(allProfiles.map(p => p.onboarding_data?.school_name).filter(Boolean))].sort();

    // === AI INSIGHTS ===
    const now = new Date();
    const thisMonthKey = getMonthKey(now.toISOString());
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = getMonthKey(lastMonth.toISOString());

    const enrollmentsThisMonth = enrollmentsByMonth[thisMonthKey] || 0;
    const enrollmentsLastMonth = enrollmentsByMonth[lastMonthKey] || 0;
    const enrollmentChange = enrollmentsLastMonth > 0
      ? Math.round(((enrollmentsThisMonth - enrollmentsLastMonth) / enrollmentsLastMonth) * 100)
      : 0;

    const mostPopularCourse = topCourses[0];
    const highestCompletionCourse = courseCompletionRates[0];
    const lowestCompletionCourse = courseCompletionRates.length > 0
      ? courseCompletionRates[courseCompletionRates.length - 1]
      : null;

    const peakDay = activityByDay.find(d => d.isPeak)?.day || 'N/A';
    const peakHour = activityByHour.find(h => h.isPeak)?.hour || 'N/A';

    const spanishUsers = byLanguage['spanish'] || 0;
    const spanishCourses = 0; // No courses in Spanish yet

    const mostRequestedGoal = goalAlignment[0]?.goal || 'N/A';

    const avgStressReduction = avgStressInitial && avgStressCurrent
      ? Math.round((avgStressInitial - avgStressCurrent) * 10) / 10
      : 0;

    const insights = {
      enrollmentChange,
      enrollmentsThisMonth,
      enrollmentsLastMonth,
      mostPopularCourse: mostPopularCourse?.title || 'N/A',
      mostPopularCourseEnrollments: mostPopularCourse?.enrollments || 0,
      highestCompletionCourse: highestCompletionCourse?.title || 'N/A',
      highestCompletionRate: highestCompletionCourse?.completionRate || 0,
      lowestCompletionCourse: lowestCompletionCourse?.title || 'N/A',
      lowestCompletionRate: lowestCompletionCourse?.completionRate || 0,
      peakDay,
      peakHour,
      avgStressReduction,
      improvementRate,
      spanishUsers,
      spanishCourses,
      mostRequestedGoal,
      completionRate,
    };

    return NextResponse.json({
      // Stats
      stats: {
        totalUsers,
        totalEnrollments,
        totalCompletions,
        completionRate,
        totalPdHours,
        avgStressCurrent: avgStressCurrent ? Math.round(avgStressCurrent * 10) / 10 : null,
        avgStressInitial: avgStressInitial ? Math.round(avgStressInitial * 10) / 10 : null,
        stressImproved,
        improvementRate,
      },
      // Time series
      enrollmentsTimeSeries,
      completionsTimeSeries,
      pdTimeSeries,
      stressTimeSeries,
      mauTimeSeries,
      // Course data
      topCourses,
      courseCompletionRates,
      courses: courses.map(c => ({ id: c.id, title: c.title })),
      // Demographics
      roleDistribution,
      gradeDistribution,
      experienceDistribution,
      stateDistribution,
      languageDistribution,
      genderDistribution,
      // Stress
      stressRoleComparison,
      // Engagement
      activityByDay,
      activityByHour,
      // Goals
      goalAlignment,
      // Insights
      insights,
      // Filter options
      filterOptions: {
        states: uniqueStates,
        orgs: uniqueOrgs,
      },
    });
  } catch (error) {
    console.error('[Analytics API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
