import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { STATIC_DEFAULTS } from '@/lib/dashboard/dashboardDefaults'

export async function GET() {
  try {
    const supabase = getServiceSupabase()

    const { data, error } = await supabase
      .from('dashboard_defaults')
      .select('metric_name, example_value')

    if (error || !data) {
      return NextResponse.json({ defaults: STATIC_DEFAULTS })
    }

    const defaults = data.reduce((acc: Record<string, string>, row) => {
      acc[row.metric_name] = row.example_value
      return acc
    }, {})

    // Merge with static defaults as fallback
    const mergedDefaults = { ...STATIC_DEFAULTS, ...defaults }

    return NextResponse.json({ defaults: mergedDefaults })
  } catch (error) {
    console.error('Error fetching dashboard defaults:', error)
    return NextResponse.json({ defaults: STATIC_DEFAULTS })
  }
}
