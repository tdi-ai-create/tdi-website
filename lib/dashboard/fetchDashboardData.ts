import { getServiceSupabase } from '@/lib/supabase'
import { STATIC_DEFAULTS } from './dashboardDefaults'

export interface DashboardData {
  partnership:    any
  organization:   any
  buildings:      any[]
  timelineEvents: any[]
  actionItems:    any[]
  metrics:        any[]
  defaults:       Record<string, string>
}

export async function fetchDashboardData(slug: string): Promise<DashboardData | null> {
  const supabase = getServiceSupabase()

  // Fetch partnership by slug
  const { data: partnership, error } = await supabase
    .from('partnerships')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !partnership) return null

  // Fetch all related data in parallel
  const [
    { data: organization },
    { data: buildings },
    { data: timelineEvents },
    { data: actionItems },
    { data: metrics },
    { data: defaultsRaw },
  ] = await Promise.all([
    supabase.from('organizations').select('*').eq('partnership_id', partnership.id).single(),
    supabase.from('buildings').select('*').eq('organization_id', partnership.id).order('name'),
    supabase.from('timeline_events').select('*').eq('partnership_id', partnership.id).order('sort_order'),
    supabase.from('action_items').select('*').eq('partnership_id', partnership.id).order('sort_order'),
    supabase.from('metric_snapshots').select('*').eq('partnership_id', partnership.id).order('snapshot_date', { ascending: false }),
    supabase.from('dashboard_defaults').select('metric_name, example_value'),
  ])

  const defaults = (defaultsRaw || []).reduce((acc: Record<string, string>, row: any) => {
    acc[row.metric_name] = row.example_value
    return acc
  }, {} as Record<string, string>)

  // Merge with static defaults as fallback
  const mergedDefaults = { ...STATIC_DEFAULTS, ...defaults }

  return {
    partnership,
    organization:   organization || {},
    buildings:      buildings || [],
    timelineEvents: timelineEvents || [],
    actionItems:    actionItems || [],
    metrics:        metrics || [],
    defaults:       mergedDefaults,
  }
}

export async function fetchDashboardDataById(partnershipId: string): Promise<DashboardData | null> {
  const supabase = getServiceSupabase()

  const { data: partnership } = await supabase
    .from('partnerships')
    .select('*')
    .eq('id', partnershipId)
    .single()

  if (!partnership) return null
  return fetchDashboardData(partnership.slug)
}
