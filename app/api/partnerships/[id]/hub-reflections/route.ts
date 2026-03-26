import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: partnershipId } = await params

  try {
    // Get Hub users for this partnership
    const { data: members } = await supabase
      .from('hub_org_members')
      .select('user_id')
      .eq('partnership_id', partnershipId)

    if (!members || members.length === 0) {
      return NextResponse.json({ has_data: false, reflections: [] })
    }

    const userIds = members.map(m => m.user_id)

    // Get last 8 reflections from this school
    // Note: Using .not('metadata', 'is', null) and filtering in JS since
    // PostgREST JSON path syntax can vary
    const { data: reflections } = await supabase
      .from('hub_activity_log')
      .select('user_id, metadata, created_at')
      .in('user_id', userIds)
      .eq('action', 'quick_win_reflection')
      .eq('is_example', false)
      .not('metadata', 'is', null)
      .order('created_at', { ascending: false })
      .limit(8)

    if (!reflections || reflections.length === 0) {
      return NextResponse.json({ has_data: false, reflections: [] })
    }

    // Shape the response - anonymize user_id, extract reflection text
    const shaped = reflections
      .filter(r => r.metadata?.reflection && String(r.metadata.reflection).trim().length > 0)
      .map(r => ({
        text: r.metadata?.reflection as string,
        quick_win_title: (r.metadata?.quick_win_title as string) || 'Quick Win',
        created_at: r.created_at,
      }))

    return NextResponse.json({
      has_data: shaped.length > 0,
      reflections: shaped,
    })

  } catch (error) {
    console.error('Hub reflections API error:', error)
    return NextResponse.json({ has_data: false, reflections: [] })
  }
}
