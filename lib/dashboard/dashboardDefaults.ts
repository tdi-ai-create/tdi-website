import { getServiceSupabase } from '@/lib/supabase'

export interface DashboardDefault {
  metric_name:   string
  example_value: string
  example_label: string
  data_source:   string
}

export async function getDashboardDefaults(): Promise<Record<string, string>> {
  const supabase = getServiceSupabase()
  const { data } = await supabase
    .from('dashboard_defaults')
    .select('metric_name, example_value')

  if (!data) return STATIC_DEFAULTS

  return data.reduce((acc, row) => {
    acc[row.metric_name] = row.example_value
    return acc
  }, {} as Record<string, string>)
}

// Static fallback if DB call fails
export const STATIC_DEFAULTS: Record<string, string> = {
  hub_login_pct:              '87',
  staff_enrolled:             '42',
  love_notes_count:           '127',
  high_engagement_pct:        '65',
  cost_per_educator:          '892',
  teacher_stress:             '6.0',
  strategy_implementation:    '65',
  retention_intent:           '7.2',
  momentum_status:            'Building',
  momentum_detail:            'Your partnership is getting started. These details will update as we work together.',
  deliverables_pct:           '73',
  per_educator_value_note:    'per educator - obs days, coaching, Hub + weekly subgroups',
}
