import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface MilestoneRecord {
  id: string;
  creator_id: string;
  milestone_id: string;
  status: string;
  completed_at: string | null;
  completed_by: string | null;
  created_at: string;
  updated_at: string;
  milestone: {
    id: string;
    title: string;
    name: string;
    phase_id: string;
    sort_order: number;
    requires_team_action: boolean;
  } | null;
}

interface CreatorRecord {
  id: string;
  name: string;
  email: string;
  content_path: string | null;
  current_phase: string;
  created_at: string;
  status: string | null;
  publish_status: string | null;
  published_date: string | null;
  state: string | null;
}

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, error: 'Server config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get all active creators
    const { data: creators, error: creatorsError } = await supabase
      .from('creators')
      .select('*')
      .or('status.eq.active,status.is.null')
      .order('created_at', { ascending: false });

    if (creatorsError) {
      console.error('[analytics] Creators error:', creatorsError);
      return NextResponse.json({ success: false, error: creatorsError.message }, { status: 500 });
    }

    // Get all phases
    const { data: phases } = await supabase
      .from('phases')
      .select('*')
      .order('sort_order', { ascending: true });

    // Get all milestones
    const { data: milestones } = await supabase
      .from('milestones')
      .select('*')
      .lt('sort_order', 98) // Only active milestones
      .order('phase_id')
      .order('sort_order', { ascending: true });

    // Get all creator_milestones with milestone info
    const { data: allCreatorMilestones, error: milestonesError } = await supabase
      .from('creator_milestones')
      .select(`
        *,
        milestone:milestones(*)
      `);

    if (milestonesError) {
      console.error('[analytics] Milestones error:', milestonesError);
      return NextResponse.json({ success: false, error: milestonesError.message }, { status: 500 });
    }

    const typedMilestones = (allCreatorMilestones || []) as MilestoneRecord[];
    const typedCreators = (creators || []) as CreatorRecord[];

    // ==========================================
    // SECTION 1: PIPELINE HEALTH
    // ==========================================

    // A. Creator Velocity — Average Time Per Phase
    const phaseVelocity = calculatePhaseVelocity(typedCreators, typedMilestones, phases || []);

    // B. Bottleneck Report — Where Creators Stall
    const bottleneckReport = calculateBottleneckReport(typedCreators, typedMilestones, milestones || []);

    // C. Content Path Breakdown
    const contentPathBreakdown = calculateContentPathBreakdown(typedCreators);

    // D. Content Path Trends Over Time
    const contentPathTrends = calculateContentPathTrends(typedCreators);

    // E. Creator Activity Heatmap
    const activityHeatmap = calculateActivityHeatmap(typedCreators, typedMilestones);

    // ==========================================
    // SECTION 2: CONVERSION & COMPLETION
    // ==========================================

    // F. Time from Intake to Launch (by Creator)
    const journeyTimes = calculateJourneyTimes(typedCreators, typedMilestones);

    // G. Completion Rate & Phase Drop-off Funnel
    const completionFunnel = calculateCompletionFunnel(typedCreators, typedMilestones, phases || []);

    // H. Stalled Creator Alerts
    const stalledCreators = calculateStalledCreators(typedCreators, typedMilestones);

    // ==========================================
    // SECTION 3: OUTPUT & GROWTH
    // ==========================================

    // I. Courses/Content Published Per Month
    const publishedPerMonth = calculatePublishedPerMonth(typedCreators, typedMilestones);

    // J. Geographic Distribution
    const geographicDistribution = calculateGeographicDistribution(typedCreators);

    return NextResponse.json({
      success: true,
      // Section 1
      phaseVelocity,
      bottleneckReport,
      contentPathBreakdown,
      contentPathTrends,
      activityHeatmap,
      // Section 2
      journeyTimes,
      completionFunnel,
      stalledCreators,
      // Section 3
      publishedPerMonth,
      geographicDistribution,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[analytics] Error:', error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function calculatePhaseVelocity(
  creators: CreatorRecord[],
  creatorMilestones: MilestoneRecord[],
  phases: { id: string; name: string; sort_order: number }[]
) {
  const phaseStats: Record<string, { totalDays: number; count: number }> = {};

  // Initialize phases
  phases.forEach(p => {
    phaseStats[p.id] = { totalDays: 0, count: 0 };
  });

  creators.forEach(creator => {
    const creatorMs = creatorMilestones.filter(
      m => m.creator_id === creator.id &&
      m.completed_at &&
      m.completed_by !== 'system-migration' // Exclude migration data
    );

    // Group by phase
    const phaseCompletions: Record<string, Date[]> = {};
    creatorMs.forEach(m => {
      if (m.milestone?.phase_id && m.completed_at) {
        if (!phaseCompletions[m.milestone.phase_id]) {
          phaseCompletions[m.milestone.phase_id] = [];
        }
        phaseCompletions[m.milestone.phase_id].push(new Date(m.completed_at));
      }
    });

    // Calculate time spent in each phase
    Object.entries(phaseCompletions).forEach(([phaseId, dates]) => {
      if (dates.length >= 2) {
        const sorted = dates.sort((a, b) => a.getTime() - b.getTime());
        const firstDate = sorted[0];
        const lastDate = sorted[sorted.length - 1];
        const days = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

        if (phaseStats[phaseId]) {
          phaseStats[phaseId].totalDays += days;
          phaseStats[phaseId].count += 1;
        }
      }
    });
  });

  // Calculate averages and format
  const phaseNames: Record<string, string> = {
    onboarding: 'Onboarding',
    agreement: 'Agreement',
    course_design: 'Prep & Resources',
    test_prep: 'Test & Prep',
    production: 'Production',
    launch: 'Launch',
  };

  const phaseColors: Record<string, string> = {
    onboarding: '#6366F1',
    agreement: '#8B5CF6',
    course_design: '#A78BFA',
    test_prep: '#F59E0B',
    production: '#F97316',
    launch: '#22C55E',
  };

  return phases.map(p => ({
    phase: p.id,
    name: phaseNames[p.id] || p.name,
    avgDays: phaseStats[p.id]?.count > 0
      ? Math.round(phaseStats[p.id].totalDays / phaseStats[p.id].count)
      : 0,
    sampleSize: phaseStats[p.id]?.count || 0,
    color: phaseColors[p.id] || '#6366F1',
  }));
}

function calculateBottleneckReport(
  creators: CreatorRecord[],
  creatorMilestones: MilestoneRecord[],
  milestones: { id: string; title: string; name: string; phase_id: string; sort_order: number }[]
) {
  const milestoneStats: Record<string, {
    totalDays: number;
    completedCount: number;
    currentlyStuck: number;
  }> = {};

  // Initialize
  milestones.forEach(m => {
    milestoneStats[m.id] = { totalDays: 0, completedCount: 0, currentlyStuck: 0 };
  });

  // Calculate stats per milestone
  creators.forEach(creator => {
    const creatorMs = creatorMilestones.filter(m => m.creator_id === creator.id);

    creatorMs.forEach(cm => {
      if (!milestoneStats[cm.milestone_id]) return;

      if (cm.status === 'completed' && cm.completed_at && cm.completed_by !== 'system-migration') {
        // Calculate days to complete (from created_at to completed_at)
        const startDate = new Date(cm.created_at);
        const endDate = new Date(cm.completed_at);
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        if (days >= 0) {
          milestoneStats[cm.milestone_id].totalDays += days;
          milestoneStats[cm.milestone_id].completedCount += 1;
        }
      } else if (cm.status === 'available') {
        milestoneStats[cm.milestone_id].currentlyStuck += 1;
      }
    });
  });

  const phaseNames: Record<string, string> = {
    onboarding: 'Onboarding',
    agreement: 'Agreement',
    course_design: 'Prep & Resources',
    test_prep: 'Test & Prep',
    production: 'Production',
    launch: 'Launch',
  };

  // Format and sort by currently stuck (descending)
  return milestones
    .map(m => ({
      id: m.id,
      name: m.title || m.name,
      phase: phaseNames[m.phase_id] || m.phase_id,
      phaseId: m.phase_id,
      avgDays: milestoneStats[m.id].completedCount > 0
        ? Math.round(milestoneStats[m.id].totalDays / milestoneStats[m.id].completedCount)
        : 0,
      currentlyStuck: milestoneStats[m.id].currentlyStuck,
    }))
    .filter(m => m.currentlyStuck > 0 || m.avgDays > 0)
    .sort((a, b) => b.currentlyStuck - a.currentlyStuck)
    .slice(0, 15); // Top 15
}

function calculateContentPathBreakdown(creators: CreatorRecord[]) {
  const counts = {
    blog: creators.filter(c => c.content_path === 'blog').length,
    download: creators.filter(c => c.content_path === 'download').length,
    course: creators.filter(c => c.content_path === 'course').length,
    notSet: creators.filter(c => !c.content_path).length,
  };

  const total = creators.length;

  return [
    { name: 'Blog', value: counts.blog, color: '#3B82F6', percent: total > 0 ? Math.round((counts.blog / total) * 100) : 0 },
    { name: 'Download', value: counts.download, color: '#22C55E', percent: total > 0 ? Math.round((counts.download / total) * 100) : 0 },
    { name: 'Course', value: counts.course, color: '#8B5CF6', percent: total > 0 ? Math.round((counts.course / total) * 100) : 0 },
    { name: 'Not Set', value: counts.notSet, color: '#9CA3AF', percent: total > 0 ? Math.round((counts.notSet / total) * 100) : 0 },
  ];
}

function calculateContentPathTrends(creators: CreatorRecord[]) {
  // Group by month
  const monthlyData: Record<string, { blog: number; download: number; course: number; notSet: number }> = {};

  creators.forEach(c => {
    const date = new Date(c.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { blog: 0, download: 0, course: 0, notSet: 0 };
    }

    if (c.content_path === 'blog') monthlyData[monthKey].blog++;
    else if (c.content_path === 'download') monthlyData[monthKey].download++;
    else if (c.content_path === 'course') monthlyData[monthKey].course++;
    else monthlyData[monthKey].notSet++;
  });

  // Convert to array and sort by date
  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      monthLabel: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      ...data,
      total: data.blog + data.download + data.course + data.notSet,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12); // Last 12 months
}

function calculateActivityHeatmap(creators: CreatorRecord[], creatorMilestones: MilestoneRecord[]) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const activityData = creators.map(creator => {
    const creatorMs = creatorMilestones.filter(m => m.creator_id === creator.id && m.completed_at);

    // Find most recent activity
    const completedDates = creatorMs.map(m => new Date(m.completed_at!));
    const lastActivity = completedDates.length > 0
      ? new Date(Math.max(...completedDates.map(d => d.getTime())))
      : new Date(creator.created_at);

    let activityLevel: 'green' | 'yellow' | 'orange' | 'red';
    let daysSinceActivity: number;

    if (lastActivity >= sevenDaysAgo) {
      activityLevel = 'green';
      daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    } else if (lastActivity >= fourteenDaysAgo) {
      activityLevel = 'yellow';
      daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    } else if (lastActivity >= thirtyDaysAgo) {
      activityLevel = 'orange';
      daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    } else {
      activityLevel = 'red';
      daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    }

    return {
      id: creator.id,
      name: creator.name,
      initials: creator.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      contentPath: creator.content_path,
      activityLevel,
      daysSinceActivity,
      lastActivity: lastActivity.toISOString(),
    };
  });

  // Sort by most dormant first (red at top)
  const levelOrder: Record<string, number> = { red: 0, orange: 1, yellow: 2, green: 3 };
  return activityData.sort((a, b) => levelOrder[a.activityLevel] - levelOrder[b.activityLevel]);
}

function calculateJourneyTimes(creators: CreatorRecord[], creatorMilestones: MilestoneRecord[]) {
  const journeyData: {
    id: string;
    name: string;
    contentPath: string | null;
    days: number;
    startDate: string;
    endDate: string;
  }[] = [];

  creators.forEach(creator => {
    // Only include creators who are launched/published
    if (creator.publish_status !== 'published' && creator.current_phase !== 'launch') {
      return;
    }

    const creatorMs = creatorMilestones.filter(
      m => m.creator_id === creator.id &&
      m.completed_at &&
      m.completed_by !== 'system-migration'
    );

    if (creatorMs.length < 2) return;

    const completedDates = creatorMs.map(m => new Date(m.completed_at!));
    const firstDate = new Date(Math.min(...completedDates.map(d => d.getTime())));
    const lastDate = new Date(Math.max(...completedDates.map(d => d.getTime())));
    const days = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

    if (days >= 0) {
      journeyData.push({
        id: creator.id,
        name: creator.name,
        contentPath: creator.content_path,
        days,
        startDate: firstDate.toISOString(),
        endDate: lastDate.toISOString(),
      });
    }
  });

  // Sort by shortest journey first
  return journeyData.sort((a, b) => a.days - b.days);
}

function calculateCompletionFunnel(
  creators: CreatorRecord[],
  creatorMilestones: MilestoneRecord[],
  phases: { id: string; name: string; sort_order: number }[]
) {
  const phaseOrder = ['onboarding', 'agreement', 'course_design', 'test_prep', 'production', 'launch'];
  const phaseNames: Record<string, string> = {
    onboarding: 'Started Onboarding',
    agreement: 'Completed Agreement',
    course_design: 'Completed Prep & Resources',
    test_prep: 'Completed Test & Prep',
    production: 'Completed Production',
    launch: 'Launched',
  };

  const totalCreators = creators.length;
  const funnelData: { phase: string; name: string; count: number; percent: number }[] = [];

  // First stage: all creators who started
  funnelData.push({
    phase: 'started',
    name: 'Started Onboarding',
    count: totalCreators,
    percent: 100,
  });

  // For each phase, count creators who completed all milestones in that phase
  phaseOrder.forEach((phaseId, index) => {
    if (index === 0) return; // Skip 'started' since we already added it

    let completedCount = 0;

    creators.forEach(creator => {
      const creatorMs = creatorMilestones.filter(m => m.creator_id === creator.id);

      // Check if all milestones up to and including this phase are completed
      const phasesToCheck = phaseOrder.slice(0, index + 1);
      const allCompleted = phasesToCheck.every(checkPhase => {
        const phaseMs = creatorMs.filter(m => m.milestone?.phase_id === checkPhase);
        return phaseMs.length > 0 && phaseMs.every(m => m.status === 'completed');
      });

      if (allCompleted) completedCount++;
    });

    funnelData.push({
      phase: phaseId,
      name: phaseNames[phaseId] || phaseId,
      count: completedCount,
      percent: totalCreators > 0 ? Math.round((completedCount / totalCreators) * 100) : 0,
    });
  });

  return funnelData;
}

function calculateStalledCreators(creators: CreatorRecord[], creatorMilestones: MilestoneRecord[]) {
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const stalledData: {
    id: string;
    name: string;
    email: string;
    contentPath: string | null;
    currentStep: string | null;
    daysSinceActivity: number;
    lastActivityDate: string;
    severity: 'yellow' | 'orange' | 'red';
  }[] = [];

  creators.forEach(creator => {
    // Skip launched creators
    if (creator.publish_status === 'published' || creator.current_phase === 'launch') {
      return;
    }

    const creatorMs = creatorMilestones.filter(m => m.creator_id === creator.id);

    // Find most recent activity
    const completedMs = creatorMs.filter(m => m.completed_at);
    const completedDates = completedMs.map(m => new Date(m.completed_at!));
    const lastActivity = completedDates.length > 0
      ? new Date(Math.max(...completedDates.map(d => d.getTime())))
      : new Date(creator.created_at);

    // Only include if stalled (14+ days)
    if (lastActivity >= fourteenDaysAgo) return;

    const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    // Find current step (first available milestone)
    const availableMs = creatorMs
      .filter(m => m.status === 'available' && m.milestone)
      .sort((a, b) => (a.milestone?.sort_order || 0) - (b.milestone?.sort_order || 0));
    const currentStep = availableMs[0]?.milestone?.title || availableMs[0]?.milestone?.name || null;

    let severity: 'yellow' | 'orange' | 'red';
    if (daysSinceActivity >= 60) {
      severity = 'red';
    } else if (daysSinceActivity >= 30) {
      severity = 'orange';
    } else {
      severity = 'yellow';
    }

    stalledData.push({
      id: creator.id,
      name: creator.name,
      email: creator.email,
      contentPath: creator.content_path,
      currentStep,
      daysSinceActivity,
      lastActivityDate: lastActivity.toISOString(),
      severity,
    });
  });

  // Sort by most stalled first
  return stalledData.sort((a, b) => b.daysSinceActivity - a.daysSinceActivity);
}

function calculatePublishedPerMonth(creators: CreatorRecord[], creatorMilestones: MilestoneRecord[]) {
  // Get launched milestone completions
  const launchedMs = creatorMilestones.filter(
    m => m.milestone_id === 'launched' &&
    m.status === 'completed' &&
    m.completed_at &&
    m.completed_by !== 'system-migration'
  );

  // Also check blog_published milestones
  const blogPublishedMs = creatorMilestones.filter(
    m => m.milestone_id === 'blog_published' &&
    m.status === 'completed' &&
    m.completed_at &&
    m.completed_by !== 'system-migration'
  );

  // Group by month
  const monthlyData: Record<string, { courses: number; blogs: number }> = {};

  // Initialize last 12 months
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[monthKey] = { courses: 0, blogs: 0 };
  }

  launchedMs.forEach(m => {
    const date = new Date(m.completed_at!);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyData[monthKey]) {
      monthlyData[monthKey].courses++;
    }
  });

  blogPublishedMs.forEach(m => {
    const date = new Date(m.completed_at!);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyData[monthKey]) {
      monthlyData[monthKey].blogs++;
    }
  });

  // Calculate cumulative
  let cumulativeCourses = 0;
  let cumulativeBlogs = 0;

  return Object.entries(monthlyData)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, data]) => {
      cumulativeCourses += data.courses;
      cumulativeBlogs += data.blogs;
      return {
        month,
        monthLabel: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        courses: data.courses,
        blogs: data.blogs,
        cumulativeCourses,
        cumulativeBlogs,
        total: data.courses + data.blogs,
      };
    });
}

function calculateGeographicDistribution(creators: CreatorRecord[]) {
  const stateCounts: Record<string, number> = {};
  let creatorsWithState = 0;
  let creatorsWithoutState = 0;

  creators.forEach(c => {
    if (c.state) {
      stateCounts[c.state] = (stateCounts[c.state] || 0) + 1;
      creatorsWithState++;
    } else {
      creatorsWithoutState++;
    }
  });

  const total = creators.length;

  // Sort by count descending
  const stateData = Object.entries(stateCounts)
    .map(([state, count]) => ({
      state,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    hasData: creatorsWithState > 0,
    total: creators.length,
    withState: creatorsWithState,
    withoutState: creatorsWithoutState,
    states: stateData.slice(0, 15), // Top 15 states
  };
}
