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

interface SurveyResponse {
  id: string;
  partnership_id: string;
  staff_member_id: string | null;
  survey_type: string;
  stress_level: number | null;
  planning_hours: number | null;
  implementation_confidence: number | null;
  retention_intent: number | null;
  feeling_valued: number | null;
  submitted_at: string;
}

interface MetricSnapshot {
  id: string;
  partnership_id: string;
  building_id: string | null;
  metric_name: string;
  metric_value: number;
  snapshot_date: string;
}

interface Partnership {
  id: string;
  slug: string;
  contract_phase: string;
  contract_start: string;
}

interface Organization {
  id: string;
  partnership_id: string;
  name: string;
}

interface Profile {
  id: string;
  onboarding_data?: {
    school_name?: string;
    initial_stress_level?: number;
    current_stress_level?: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);

    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    // Fetch base data
    const [surveysRes, snapshotsRes, partnershipsRes, orgsRes, profilesRes] = await Promise.all([
      supabase.from('survey_responses').select('*').order('submitted_at', { ascending: false }).limit(10000),
      supabase.from('metric_snapshots').select('*').order('snapshot_date', { ascending: false }).limit(10000),
      supabase.from('partnerships').select('id, slug, contract_phase, contract_start').limit(500),
      supabase.from('organizations').select('id, partnership_id, name').limit(1000),
      supabase.from('hub_profiles').select('id, onboarding_data').limit(5000),
    ]);

    // Get user emails for filtering test accounts
    const { data: authUsers } = await supabase.auth.admin.listUsers({ perPage: 5000 });
    const userEmailMap = new Map<string, string>();
    authUsers?.users?.forEach(u => {
      if (u.email) userEmailMap.set(u.id, u.email);
    });

    const allSurveys = (surveysRes.data || []) as SurveyResponse[];
    const allSnapshots = (snapshotsRes.data || []) as MetricSnapshot[];
    const partnerships = (partnershipsRes.data || []) as Partnership[];
    const organizations = (orgsRes.data || []) as Organization[];
    const allProfiles = (profilesRes.data || []) as Profile[];

    // Filter out test accounts from profiles
    const validUserIds = new Set(
      allProfiles
        .filter(p => !isTestAccount(userEmailMap.get(p.id) || null))
        .map(p => p.id)
    );

    const profiles = allProfiles.filter(p => validUserIds.has(p.id));

    // Filter data by date
    let surveys = allSurveys;
    let snapshots = allSnapshots;

    if (dateFrom) {
      surveys = surveys.filter(s => new Date(s.submitted_at) >= new Date(dateFrom));
      snapshots = snapshots.filter(s => new Date(s.snapshot_date) >= new Date(dateFrom));
    }
    if (dateTo) {
      surveys = surveys.filter(s => new Date(s.submitted_at) <= new Date(dateTo));
      snapshots = snapshots.filter(s => new Date(s.snapshot_date) <= new Date(dateTo));
    }

    const partnershipMap = new Map(partnerships.map(p => [p.id, p]));
    const orgMap = new Map<string, Organization>();
    organizations.forEach(o => orgMap.set(o.partnership_id, o));

    // === I. Stress Level Changes Over Time ===
    const stressDataByMonth: Record<string, number[]> = {};
    const stressDataBySchool: Record<string, Record<string, number[]>> = {};

    // From surveys
    surveys.forEach(s => {
      if (s.stress_level !== null) {
        const monthKey = s.submitted_at.substring(0, 7);
        if (!stressDataByMonth[monthKey]) stressDataByMonth[monthKey] = [];
        stressDataByMonth[monthKey].push(s.stress_level);

        // By school
        const org = orgMap.get(s.partnership_id);
        const schoolName = org?.name || 'Unknown';
        if (!stressDataBySchool[schoolName]) stressDataBySchool[schoolName] = {};
        if (!stressDataBySchool[schoolName][monthKey]) stressDataBySchool[schoolName][monthKey] = [];
        stressDataBySchool[schoolName][monthKey].push(s.stress_level);
      }
    });

    // From metric snapshots
    const stressSnapshots = snapshots.filter(s => s.metric_name === 'stress_level' || s.metric_name === 'avg_stress');
    stressSnapshots.forEach(s => {
      const monthKey = s.snapshot_date.substring(0, 7);
      if (!stressDataByMonth[monthKey]) stressDataByMonth[monthKey] = [];
      stressDataByMonth[monthKey].push(s.metric_value);
    });

    // From profile onboarding data (for initial baseline)
    let initialStressTotal = 0;
    let initialStressCount = 0;
    profiles.forEach(p => {
      if (p.onboarding_data?.initial_stress_level) {
        initialStressTotal += p.onboarding_data.initial_stress_level;
        initialStressCount++;
      }
    });
    const avgInitialStress = initialStressCount > 0 ? Math.round((initialStressTotal / initialStressCount) * 10) / 10 : null;

    const stressTrends = Object.entries(stressDataByMonth)
      .map(([month, values]) => ({
        month,
        avgStress: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10,
        sampleSize: values.length,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const stressTrendsBySchool = Object.entries(stressDataBySchool)
      .map(([school, monthData]) => ({
        school,
        data: Object.entries(monthData)
          .map(([month, values]) => ({
            month,
            avgStress: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10,
          }))
          .sort((a, b) => a.month.localeCompare(b.month)),
      }))
      .filter(s => s.data.length > 0);

    // === J. Planning Time Improvements ===
    const planningDataBySchool: Record<string, { baseline: number[]; current: number[] }> = {};

    surveys.forEach(s => {
      if (s.planning_hours !== null) {
        const org = orgMap.get(s.partnership_id);
        const schoolName = org?.name || 'Unknown';
        if (!planningDataBySchool[schoolName]) {
          planningDataBySchool[schoolName] = { baseline: [], current: [] };
        }

        if (s.survey_type === 'baseline') {
          planningDataBySchool[schoolName].baseline.push(s.planning_hours);
        } else {
          planningDataBySchool[schoolName].current.push(s.planning_hours);
        }
      }
    });

    // Also check metric snapshots for planning data
    const planningSnapshots = snapshots.filter(s =>
      s.metric_name === 'planning_hours' || s.metric_name === 'avg_planning_hours'
    );

    planningSnapshots.forEach(s => {
      const partnership = partnershipMap.get(s.partnership_id);
      const org = orgMap.get(s.partnership_id);
      const schoolName = org?.name || partnership?.slug || 'Unknown';

      if (!planningDataBySchool[schoolName]) {
        planningDataBySchool[schoolName] = { baseline: [], current: [] };
      }
      // Assume recent snapshots are current
      planningDataBySchool[schoolName].current.push(s.metric_value);
    });

    const planningTimeImprovements = Object.entries(planningDataBySchool)
      .filter(([, data]) => data.baseline.length > 0 || data.current.length > 0)
      .map(([school, data]) => {
        const avgBefore = data.baseline.length > 0
          ? Math.round((data.baseline.reduce((a, b) => a + b, 0) / data.baseline.length) * 10) / 10
          : null;
        const avgAfter = data.current.length > 0
          ? Math.round((data.current.reduce((a, b) => a + b, 0) / data.current.length) * 10) / 10
          : null;

        return {
          school,
          avgBefore,
          avgAfter,
          improvement: avgBefore && avgAfter ? Math.round((avgBefore - avgAfter) * 10) / 10 : null,
          sampleSizeBefore: data.baseline.length,
          sampleSizeAfter: data.current.length,
        };
      })
      .sort((a, b) => (b.improvement || 0) - (a.improvement || 0));

    // Overall averages
    const allBaseline = Object.values(planningDataBySchool).flatMap(d => d.baseline);
    const allCurrent = Object.values(planningDataBySchool).flatMap(d => d.current);
    const overallPlanningBefore = allBaseline.length > 0
      ? Math.round((allBaseline.reduce((a, b) => a + b, 0) / allBaseline.length) * 10) / 10
      : null;
    const overallPlanningAfter = allCurrent.length > 0
      ? Math.round((allCurrent.reduce((a, b) => a + b, 0) / allCurrent.length) * 10) / 10
      : null;

    // === K. Strategy Implementation Tracking ===
    const implementationData: { school: string; rate: number; sampleSize: number }[] = [];

    const implSnapshots = snapshots.filter(s =>
      s.metric_name === 'implementation_rate' ||
      s.metric_name === 'strategy_implementation' ||
      s.metric_name === 'implementation_confidence'
    );

    // Group by partnership
    const implByPartnership: Record<string, number[]> = {};
    implSnapshots.forEach(s => {
      if (!implByPartnership[s.partnership_id]) implByPartnership[s.partnership_id] = [];
      implByPartnership[s.partnership_id].push(s.metric_value);
    });

    // Also from surveys
    surveys.forEach(s => {
      if (s.implementation_confidence !== null) {
        if (!implByPartnership[s.partnership_id]) implByPartnership[s.partnership_id] = [];
        // Convert confidence (likely 1-10 scale) to percentage
        implByPartnership[s.partnership_id].push(s.implementation_confidence * 10);
      }
    });

    Object.entries(implByPartnership).forEach(([partnershipId, values]) => {
      const org = orgMap.get(partnershipId);
      const schoolName = org?.name || partnershipMap.get(partnershipId)?.slug || 'Unknown';
      const avgRate = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

      implementationData.push({
        school: schoolName,
        rate: avgRate,
        sampleSize: values.length,
      });
    });

    const allImplRates = implementationData.flatMap(d => new Array(d.sampleSize).fill(d.rate));
    const overallImplementationRate = allImplRates.length > 0
      ? Math.round(allImplRates.reduce((a, b) => a + b, 0) / allImplRates.length)
      : null;

    // === L. Before/After Comparisons Per School ===
    const schoolImpactCards = partnerships.map(p => {
      const org = orgMap.get(p.id);
      const schoolName = org?.name || p.slug;

      // Get surveys for this partnership
      const schoolSurveys = surveys.filter(s => s.partnership_id === p.id);
      const baselineSurveys = schoolSurveys.filter(s => s.survey_type === 'baseline');
      const currentSurveys = schoolSurveys.filter(s => s.survey_type !== 'baseline');

      // Calculate metrics
      const calcAvg = (arr: (number | null)[]): number | null => {
        const valid = arr.filter((n): n is number => n !== null);
        return valid.length > 0 ? Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10 : null;
      };

      const preStress = calcAvg(baselineSurveys.map(s => s.stress_level));
      const postStress = calcAvg(currentSurveys.map(s => s.stress_level));

      const prePlanning = calcAvg(baselineSurveys.map(s => s.planning_hours));
      const postPlanning = calcAvg(currentSurveys.map(s => s.planning_hours));

      const preImpl = calcAvg(baselineSurveys.map(s => s.implementation_confidence ? s.implementation_confidence * 10 : null));
      const postImpl = calcAvg(currentSurveys.map(s => s.implementation_confidence ? s.implementation_confidence * 10 : null));

      return {
        partnershipId: p.id,
        school: schoolName,
        phase: p.contract_phase,
        startDate: p.contract_start,
        metrics: {
          stress: { before: preStress, after: postStress },
          planningHours: { before: prePlanning, after: postPlanning },
          implementationRate: { before: preImpl, after: postImpl },
        },
        hasSurveyData: schoolSurveys.length > 0,
        surveyCount: schoolSurveys.length,
      };
    }).filter(card => card.hasSurveyData || card.phase);

    return NextResponse.json({
      stressLevelTrends: {
        overall: stressTrends,
        bySchool: stressTrendsBySchool,
        avgInitialStress,
        targetRange: { min: 5, max: 7 },
      },
      planningTimeImprovements: {
        bySchool: planningTimeImprovements,
        overall: {
          before: overallPlanningBefore,
          after: overallPlanningAfter,
          target: { min: 6, max: 8 },
        },
      },
      strategyImplementation: {
        bySchool: implementationData,
        overallRate: overallImplementationRate,
        targetRate: 65,
        industryAverage: 10,
      },
      schoolImpactCards,
      dataStatus: {
        hasSurveyData: surveys.length > 0,
        hasMetricSnapshots: snapshots.length > 0,
        surveyCount: surveys.length,
        snapshotCount: snapshots.length,
      },
    });
  } catch (error) {
    console.error('[TDI Effect API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
