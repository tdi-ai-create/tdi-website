import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * The curated KPI menu. Each option is measurable, has benchmarks,
 * and maps to TDI contract deliverables.
 */
export const KPI_MENU = [
  {
    key: 'hub_engagement',
    label: 'Staff Hub engagement rate',
    unit: '%',
    benchmarkLow: 65,
    benchmarkHigh: 85,
    benchmarkLabel: 'TDI partners average 65-85%',
    dataSource: 'Hub login data (automatic)',
    howTdiDelivers: 'Hub access for all staff, staff champion program, observation day follow-ups that drive teachers back to the Hub for tools and resources.',
    suggestedTarget: 75,
  },
  {
    key: 'tool_implementation',
    label: 'Tool implementation rate',
    unit: '%',
    benchmarkLow: 40,
    benchmarkHigh: 60,
    benchmarkLabel: 'TDI partners average 40-60% of staff using 3+ tools',
    dataSource: 'Hub activity tracking (automatic)',
    howTdiDelivers: 'Quick Wins library with 50+ ready-to-use tools, on-site observation recommendations, virtual session follow-ups with specific tool suggestions.',
    suggestedTarget: 50,
  },
  {
    key: 'course_completion',
    label: 'Course completion rate',
    unit: '%',
    benchmarkLow: 30,
    benchmarkHigh: 50,
    benchmarkLabel: 'TDI partners average 30-50% completing at least 1 course',
    dataSource: 'Hub enrollment data (automatic)',
    howTdiDelivers: 'Full PD course library, trackable certificates, PD credit hours. Courses built from your school requests within 30 days.',
    suggestedTarget: 40,
  },
  {
    key: 'team_wellness',
    label: 'Team wellness score',
    unit: '/5',
    benchmarkLow: 3.8,
    benchmarkHigh: 4.2,
    benchmarkLabel: 'TDI partners average 3.8-4.2 out of 5',
    dataSource: 'Hub Vibe Check (5 dimensions, automatic)',
    howTdiDelivers: 'Daily private wellness check-ins across 5 dimensions (energy, stress, connection, purpose, balance). Personal outreach from Rae when scores trend low. Moment Mode wellness resets.',
    suggestedTarget: 4.0,
  },
  {
    key: 'pd_hours',
    label: 'PD hours earned (team total)',
    unit: ' hours',
    benchmarkLow: 50,
    benchmarkHigh: 200,
    benchmarkLabel: 'Varies by team size. Typical: 2-5 hours per educator per year.',
    dataSource: 'Hub course completion data (automatic)',
    howTdiDelivers: 'Full course library with tracked hours. Printable PD certificates for portfolios and board presentations.',
    suggestedTarget: 100,
  },
  {
    key: 'strategy_implementation',
    label: 'Strategy implementation rate',
    unit: '%',
    benchmarkLow: 50,
    benchmarkHigh: 65,
    benchmarkLabel: '65% for TDI partners vs 10% national average',
    dataSource: 'Observation reports + staff surveys',
    howTdiDelivers: 'On-site observation days with personalized Love Notes. Coaching follow-ups. Virtual strategy sessions targeting specific implementation gaps.',
    suggestedTarget: 50,
  },
  {
    key: 'retention_intent',
    label: 'Staff retention intent',
    unit: '/10',
    benchmarkLow: 7,
    benchmarkHigh: 9,
    benchmarkLabel: 'TDI partners average 7-9/10 vs 2-4 industry average',
    dataSource: 'Baseline + mid-year staff surveys',
    howTdiDelivers: 'Wellness support, professional growth pathways, recognition system (Field Notes), community connection with 100,000+ educators.',
    suggestedTarget: 8,
  },
  {
    key: 'stress_reduction',
    label: 'Teacher stress level reduction',
    unit: '/10',
    benchmarkLow: 5,
    benchmarkHigh: 7,
    benchmarkLabel: 'TDI partners average 5-7/10 vs 8-9 industry average (lower is better)',
    dataSource: 'Baseline + mid-year staff surveys',
    howTdiDelivers: 'Wellness tools, Moment Mode, community support, admin coaching on workload. Personal wellness outreach for struggling educators.',
    suggestedTarget: 6,
  },
  {
    key: 'custom_course_mandate',
    label: 'Specific course completion mandate',
    unit: '%',
    benchmarkLow: 50,
    benchmarkHigh: 90,
    benchmarkLabel: 'Set by your district. Common: 80%+ for mandated courses.',
    dataSource: 'Hub enrollment data (automatic)',
    howTdiDelivers: 'Course built or sourced within 30 days of request. Champion follow-ups. PLC integration guidance.',
    suggestedTarget: 80,
  },
];

// GET -- fetch KPIs for a partnership + the menu of available KPIs
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('partnership_kpis')
    .select('*')
    .eq('partnership_id', id)
    .eq('status', 'active')
    .order('sort_order');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    kpis: data || [],
    menu: KPI_MENU,
  });
}

// POST -- set KPIs for a partnership (replaces existing)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const { selectedKpis } = await request.json();

  if (!Array.isArray(selectedKpis) || selectedKpis.length === 0) {
    return NextResponse.json({ error: 'Select at least 1 KPI' }, { status: 400 });
  }

  if (selectedKpis.length > 5) {
    return NextResponse.json({ error: 'Maximum 5 KPIs allowed' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Deactivate existing KPIs
  await supabase
    .from('partnership_kpis')
    .update({ status: 'paused', updated_at: new Date().toISOString() })
    .eq('partnership_id', id)
    .eq('status', 'active');

  // Insert new KPIs
  const records = selectedKpis.map((kpi: { key: string; target: number; targetDate?: string }, index: number) => {
    const menuItem = KPI_MENU.find(m => m.key === kpi.key);
    if (!menuItem) return null;

    return {
      partnership_id: id,
      kpi_key: kpi.key,
      kpi_label: menuItem.label,
      target_value: kpi.target,
      target_unit: menuItem.unit,
      target_date: kpi.targetDate || null,
      current_value: 0,
      benchmark_low: menuItem.benchmarkLow,
      benchmark_high: menuItem.benchmarkHigh,
      benchmark_label: menuItem.benchmarkLabel,
      data_source: menuItem.dataSource,
      how_tdi_delivers: menuItem.howTdiDelivers,
      sort_order: index,
      status: 'active',
    };
  }).filter((r): r is NonNullable<typeof r> => r !== null);

  const { error } = await supabase
    .from('partnership_kpis')
    .insert(records);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await supabase.from('activity_log').insert({
    partnership_id: id,
    action: 'kpis_set',
    details: { count: records.length, kpis: selectedKpis.map((k: { key: string }) => k.key) },
  });

  return NextResponse.json({
    success: true,
    kpisCreated: records.length,
  });
}

// PATCH -- update a KPI's current value or status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { kpiId, currentValue, status } = await request.json();

  if (!kpiId) {
    return NextResponse.json({ error: 'kpiId is required' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (currentValue !== undefined) updates.current_value = currentValue;
  if (status !== undefined) {
    updates.status = status;
    if (status === 'achieved') updates.achieved_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('partnership_kpis')
    .update(updates)
    .eq('id', kpiId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
