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

function isTestAccount(email: string | null): boolean {
  if (!email) return false;
  return /test|demo|example\.com|@tdi\.internal/i.test(email);
}

interface Profile {
  id: string;
  display_name?: string;
  onboarding_data?: {
    school_name?: string;
    state?: string;
  };
  created_at: string;
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

interface Activity {
  id: string;
  user_id: string;
  action: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

interface Partnership {
  id: string;
  slug: string;
  contract_phase: string;
}

interface Organization {
  id: string;
  partnership_id: string;
  name: string;
}

interface StaffMember {
  id: string;
  partnership_id: string;
  email: string;
  first_name: string;
  last_name: string;
  hub_enrolled: boolean;
  hub_login_date: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);

    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    // Fetch base data
    const [profilesRes, enrollmentsRes, activityRes, partnershipsRes, orgsRes, staffRes] = await Promise.all([
      supabase.from('hub_profiles').select('*').limit(5000),
      supabase.from('hub_enrollments').select('*').limit(10000),
      supabase.from('hub_activity_log').select('*').order('created_at', { ascending: false }).limit(50000),
      supabase.from('partnerships').select('id, slug, contract_phase').limit(500),
      supabase.from('organizations').select('id, partnership_id, name').limit(1000),
      supabase.from('staff_members').select('*').limit(5000),
    ]);

    // Get user emails for filtering test accounts
    const { data: authUsers } = await supabase.auth.admin.listUsers({ perPage: 5000 });
    const userEmailMap = new Map<string, string>();
    authUsers?.users?.forEach(u => {
      if (u.email) userEmailMap.set(u.id, u.email);
    });

    const allProfiles = (profilesRes.data || []) as Profile[];
    const allEnrollments = (enrollmentsRes.data || []) as Enrollment[];
    const allActivity = (activityRes.data || []) as Activity[];
    const partnerships = (partnershipsRes.data || []) as Partnership[];
    const organizations = (orgsRes.data || []) as Organization[];
    const staffMembers = (staffRes.data || []) as StaffMember[];

    // Filter out test accounts
    const validUserIds = new Set(
      allProfiles
        .filter(p => !isTestAccount(userEmailMap.get(p.id) || null))
        .map(p => p.id)
    );

    const profiles = allProfiles.filter(p => validUserIds.has(p.id));
    const enrollments = allEnrollments.filter(e => validUserIds.has(e.user_id));

    // Filter activity by date range
    let activity = allActivity.filter(a => validUserIds.has(a.user_id));
    if (dateFrom) {
      activity = activity.filter(a => new Date(a.created_at) >= new Date(dateFrom));
    }
    if (dateTo) {
      activity = activity.filter(a => new Date(a.created_at) <= new Date(dateTo));
    }

    // === E. Active vs Dormant Users ===
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get last activity per user
    const userLastActivity = new Map<string, Date>();
    const userLastCourse = new Map<string, string>();

    activity.forEach(a => {
      const current = userLastActivity.get(a.user_id);
      const actDate = new Date(a.created_at);
      if (!current || actDate > current) {
        userLastActivity.set(a.user_id, actDate);
        if ((a.metadata as { course_id?: string })?.course_id) {
          userLastCourse.set(a.user_id, (a.metadata as { course_id?: string }).course_id || '');
        }
      }
    });

    // Also check enrollment updates for activity
    enrollments.forEach(e => {
      const enrollDate = new Date(e.enrolled_at || e.created_at);
      const completedDate = e.completed_at ? new Date(e.completed_at) : null;
      const lastDate = completedDate && completedDate > enrollDate ? completedDate : enrollDate;

      const current = userLastActivity.get(e.user_id);
      if (!current || lastDate > current) {
        userLastActivity.set(e.user_id, lastDate);
        userLastCourse.set(e.user_id, e.course_id);
      }
    });

    const userCategories = {
      active: [] as string[],
      slowing: [] as string[],
      atRisk: [] as string[],
      dormant: [] as string[],
    };

    profiles.forEach(p => {
      const lastActive = userLastActivity.get(p.id);
      if (!lastActive) {
        userCategories.dormant.push(p.id);
      } else if (lastActive >= sevenDaysAgo) {
        userCategories.active.push(p.id);
      } else if (lastActive >= fourteenDaysAgo) {
        userCategories.slowing.push(p.id);
      } else if (lastActive >= thirtyDaysAgo) {
        userCategories.atRisk.push(p.id);
      } else {
        userCategories.dormant.push(p.id);
      }
    });

    const totalUsers = profiles.length;
    const activeVsDormant = {
      active: { count: userCategories.active.length, percentage: totalUsers > 0 ? Math.round((userCategories.active.length / totalUsers) * 100) : 0 },
      slowing: { count: userCategories.slowing.length, percentage: totalUsers > 0 ? Math.round((userCategories.slowing.length / totalUsers) * 100) : 0 },
      atRisk: { count: userCategories.atRisk.length, percentage: totalUsers > 0 ? Math.round((userCategories.atRisk.length / totalUsers) * 100) : 0 },
      dormant: { count: userCategories.dormant.length, percentage: totalUsers > 0 ? Math.round((userCategories.dormant.length / totalUsers) * 100) : 0 },
    };

    // Get dormant user details
    const profileMap = new Map(profiles.map(p => [p.id, p]));
    const dormantUsersList = userCategories.dormant
      .map(userId => {
        const profile = profileMap.get(userId);
        const lastActive = userLastActivity.get(userId);
        const lastCourse = userLastCourse.get(userId);
        return {
          userId,
          name: profile?.display_name || 'Unknown',
          school: profile?.onboarding_data?.school_name || 'Unknown',
          lastActive: lastActive?.toISOString() || null,
          lastCourse,
          email: userEmailMap.get(userId) || null,
        };
      })
      .sort((a, b) => {
        if (!a.lastActive) return 1;
        if (!b.lastActive) return -1;
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
      })
      .slice(0, 100);

    // === F. Peak Usage Times (Heatmap) ===
    const heatmapData: Record<number, Record<number, number>> = {};
    for (let day = 0; day < 7; day++) {
      heatmapData[day] = {};
      for (let hour = 6; hour <= 22; hour++) {
        heatmapData[day][hour] = 0;
      }
    }

    // Filter to last 30 days for heatmap
    const thirtyDaysActivity = activity.filter(a => new Date(a.created_at) >= thirtyDaysAgo);

    thirtyDaysActivity.forEach(a => {
      const date = new Date(a.created_at);
      const day = date.getDay();
      const hour = date.getHours();
      if (hour >= 6 && hour <= 22 && heatmapData[day]?.[hour] !== undefined) {
        heatmapData[day][hour]++;
      }
    });

    // Find peak time
    let peakDay = 0;
    let peakHour = 6;
    let peakCount = 0;
    Object.entries(heatmapData).forEach(([day, hours]) => {
      Object.entries(hours).forEach(([hour, count]) => {
        if (count > peakCount) {
          peakCount = count;
          peakDay = parseInt(day);
          peakHour = parseInt(hour);
        }
      });
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const formatHour = (h: number) => `${h % 12 || 12}${h < 12 ? 'am' : 'pm'}`;

    const peakUsageHeatmap = {
      data: heatmapData,
      peakTime: {
        day: dayNames[peakDay],
        hour: formatHour(peakHour),
        count: peakCount,
      },
    };

    // === G. Engagement by Partnership Group ===
    const partnershipMap = new Map(partnerships.map(p => [p.id, p]));
    const orgPartnershipMap = new Map(organizations.map(o => [o.name.toLowerCase(), o.partnership_id]));

    // Group users by school/partnership
    const schoolEngagement: Record<string, {
      users: Set<string>;
      enrolled: number;
      active7d: number;
      started: number;
      completed: number;
      partnershipPhase?: string;
    }> = {};

    profiles.forEach(p => {
      const school = p.onboarding_data?.school_name || 'Unknown';
      if (!schoolEngagement[school]) {
        schoolEngagement[school] = {
          users: new Set(),
          enrolled: 0,
          active7d: 0,
          started: 0,
          completed: 0,
        };

        // Try to link to partnership
        const partnershipId = orgPartnershipMap.get(school.toLowerCase());
        if (partnershipId) {
          const partnership = partnershipMap.get(partnershipId);
          if (partnership) {
            schoolEngagement[school].partnershipPhase = partnership.contract_phase;
          }
        }
      }
      schoolEngagement[school].users.add(p.id);

      if (userCategories.active.includes(p.id)) {
        schoolEngagement[school].active7d++;
      }
    });

    enrollments.forEach(e => {
      const profile = profileMap.get(e.user_id);
      const school = profile?.onboarding_data?.school_name || 'Unknown';
      if (schoolEngagement[school]) {
        schoolEngagement[school].enrolled++;
        if (e.progress_pct > 0) {
          schoolEngagement[school].started++;
        }
        if (e.status === 'completed') {
          schoolEngagement[school].completed++;
        }
      }
    });

    const engagementByPartnership = Object.entries(schoolEngagement)
      .map(([school, stats]) => ({
        school,
        totalStaff: stats.users.size,
        enrolled: stats.enrolled,
        active7d: stats.active7d,
        coursesStarted: stats.started,
        coursesCompleted: stats.completed,
        avgCompletionRate: stats.enrolled > 0 ? Math.round((stats.completed / stats.enrolled) * 100) : 0,
        phase: stats.partnershipPhase,
      }))
      .filter(s => s.totalStaff >= 2)
      .sort((a, b) => b.avgCompletionRate - a.avgCompletionRate);

    // === H. Return Rate ===
    const weeklyData: Record<string, { returning: Set<string>; newEnrollments: number }> = {};

    // Get week key helper
    const getWeekKey = (date: Date): string => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - d.getDay());
      return d.toISOString().split('T')[0];
    };

    // Track days each user was active per week
    const userWeeklyDays: Record<string, Record<string, Set<string>>> = {};

    activity.forEach(a => {
      const weekKey = getWeekKey(new Date(a.created_at));
      const dayKey = new Date(a.created_at).toISOString().split('T')[0];

      if (!userWeeklyDays[weekKey]) userWeeklyDays[weekKey] = {};
      if (!userWeeklyDays[weekKey][a.user_id]) userWeeklyDays[weekKey][a.user_id] = new Set();
      userWeeklyDays[weekKey][a.user_id].add(dayKey);
    });

    // Count returning users (active 2+ days in a week)
    Object.entries(userWeeklyDays).forEach(([weekKey, userDays]) => {
      if (!weeklyData[weekKey]) weeklyData[weekKey] = { returning: new Set(), newEnrollments: 0 };
      Object.entries(userDays).forEach(([userId, days]) => {
        if (days.size >= 2) {
          weeklyData[weekKey].returning.add(userId);
        }
      });
    });

    // Count new enrollments per week
    enrollments.forEach(e => {
      const weekKey = getWeekKey(new Date(e.enrolled_at || e.created_at));
      if (!weeklyData[weekKey]) weeklyData[weekKey] = { returning: new Set(), newEnrollments: 0 };
      weeklyData[weekKey].newEnrollments++;
    });

    const returnRate = Object.entries(weeklyData)
      .map(([weekKey, data]) => ({
        week: weekKey,
        returningUsers: data.returning.size,
        returningPct: totalUsers > 0 ? Math.round((data.returning.size / totalUsers) * 100) : 0,
        newEnrollments: data.newEnrollments,
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-12); // Last 12 weeks

    return NextResponse.json({
      activeVsDormant,
      dormantUsersList,
      peakUsageHeatmap,
      engagementByPartnership,
      returnRate,
      totalUsers,
    });
  } catch (error) {
    console.error('[User Engagement API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
