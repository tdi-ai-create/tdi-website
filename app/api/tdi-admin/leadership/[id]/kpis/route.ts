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
  // === IMPLEMENTATION KPIs (strongest signals -- proof of practice change) ===
  {
    key: 'strategy_implementation',
    label: 'Strategy implementation in classrooms',
    unit: '%',
    benchmarkLow: 50,
    benchmarkHigh: 65,
    benchmarkLabel: '65% for TDI partners vs 10% national average',
    dataSource: 'On-site observation reports + follow-up surveys',
    howTdiDelivers: 'On-site observation days where TDI coaches observe and document strategy use. Personalized Love Notes after each visit. Virtual strategy sessions targeting specific implementation gaps. Follow-up classroom visits to verify sustained use.',
    suggestedTarget: 50,
    category: 'implementation',
  },
  {
    key: 'classroom_application',
    label: 'Staff reporting classroom application of PD',
    unit: '%',
    benchmarkLow: 55,
    benchmarkHigh: 75,
    benchmarkLabel: 'TDI partners: 55-75% report applying what they learned within 2 weeks',
    dataSource: 'Quick Win reflection responses + post-course surveys (automatic)',
    howTdiDelivers: 'Every Quick Win asks "How did this work in your classroom?" Teachers submit real implementation stories. Courses include classroom application checkpoints. This is proof of transfer, not just consumption.',
    suggestedTarget: 65,
    category: 'implementation',
  },
  {
    key: 'course_completion',
    label: 'Course completion rate',
    unit: '%',
    benchmarkLow: 30,
    benchmarkHigh: 50,
    benchmarkLabel: 'TDI partners average 30-50% completing at least 1 full course',
    dataSource: 'Hub enrollment data (automatic)',
    howTdiDelivers: 'Courses built from your school requests within 30 days. PD credit certificates on completion. Champion-led accountability. PLC integration so courses connect to real work.',
    suggestedTarget: 40,
    category: 'implementation',
  },
  {
    key: 'field_notes_earned',
    label: 'Field Notes earned (proof of showing up)',
    unit: ' total',
    benchmarkLow: 50,
    benchmarkHigh: 200,
    benchmarkLabel: 'Varies by team size. Typical: 2-5 per educator over a year.',
    dataSource: 'Hub recognition system (automatic)',
    howTdiDelivers: 'Field Notes are earned by doing the work: completing courses, submitting reflections, engaging in community, consistent Hub use. They are proof of sustained effort, not just a login.',
    suggestedTarget: 100,
    category: 'implementation',
  },
  {
    key: 'pd_hours_completed',
    label: 'PD hours completed (team total)',
    unit: ' hours',
    benchmarkLow: 50,
    benchmarkHigh: 200,
    benchmarkLabel: 'Varies by team size. Typical: 2-5 hours per educator per year.',
    dataSource: 'Hub course completion data (automatic)',
    howTdiDelivers: 'Full course library with tracked hours. Printable PD certificates. Courses count toward state PD requirements. Board-ready reporting.',
    suggestedTarget: 100,
    category: 'implementation',
  },
  // === WELLNESS KPIs (team health signals) ===
  {
    key: 'team_wellness',
    label: 'Team wellness score (5 dimensions)',
    unit: '/5',
    benchmarkLow: 3.8,
    benchmarkHigh: 4.2,
    benchmarkLabel: 'TDI partners average 3.8-4.2 out of 5',
    dataSource: 'Hub Vibe Check across 5 dimensions: energy, stress, connection, purpose, balance (automatic, private)',
    howTdiDelivers: 'Daily private wellness check-ins. Personal outreach from Rae when individual scores trend low (names never shared). Moment Mode wellness resets. Community support from 100,000+ educators.',
    suggestedTarget: 4.0,
    category: 'wellness',
  },
  {
    key: 'stress_reduction',
    label: 'Teacher stress level improvement',
    unit: '/10',
    benchmarkLow: 5,
    benchmarkHigh: 7,
    benchmarkLabel: 'TDI partners average 5-7/10 vs 8-9 industry average (lower is better)',
    dataSource: 'Baseline survey + mid-year survey + Vibe Check trends',
    howTdiDelivers: 'Wellness tools and Moment Mode. Community support. Admin coaching on workload management. Personal wellness outreach for struggling educators.',
    suggestedTarget: 6,
    category: 'wellness',
  },
  {
    key: 'retention_intent',
    label: 'Staff retention intent',
    unit: '/10',
    benchmarkLow: 7,
    benchmarkHigh: 9,
    benchmarkLabel: 'TDI partners average 7-9/10 vs 2-4 industry average',
    dataSource: 'Baseline + mid-year staff surveys',
    howTdiDelivers: 'Wellness support, professional growth pathways, recognition system (Field Notes), community connection. When teachers feel supported, they stay.',
    suggestedTarget: 8,
    category: 'wellness',
  },
  // === BASELINE KPIs (hygiene metrics -- necessary but not the headline) ===
  {
    key: 'hub_engagement',
    label: 'Staff Hub login rate',
    unit: '%',
    benchmarkLow: 65,
    benchmarkHigh: 85,
    benchmarkLabel: 'TDI partners average 65-85%',
    dataSource: 'Hub login data (automatic)',
    howTdiDelivers: 'Hub access for all staff, staff champion program, observation day follow-ups. This is a baseline health metric, not the goal itself. Logging in is step one. Implementation is the goal.',
    suggestedTarget: 75,
    category: 'baseline',
  },
  {
    key: 'custom_course_mandate',
    label: 'District-mandated course completion',
    unit: '%',
    benchmarkLow: 60,
    benchmarkHigh: 90,
    benchmarkLabel: 'Set by your district. Common target: 80%+',
    dataSource: 'Hub enrollment data (automatic)',
    howTdiDelivers: 'Course built or sourced within 30 days of your request. Champion-led follow-ups. PLC integration guidance. Progress visible on your dashboard in real time.',
    suggestedTarget: 80,
    category: 'implementation',
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
