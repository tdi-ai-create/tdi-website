import { NextRequest, NextResponse } from 'next/server'
import { getHubServiceClient, resolvePartnershipMembers } from '@/lib/hub/partnership-members'

const supabase = getHubServiceClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: partnershipId } = await params

  try {
    // Who belongs to this partnership. One definition, in lib/hub/partnership-members.
    // This previously read an unpopulated join table through the portal client:
    // the wrong table, in the wrong database, so it always returned nothing.
    const { userIds } = await resolvePartnershipMembers(partnershipId)

    if (userIds.length === 0) {
      return NextResponse.json({ has_data: false, reflections: [] })
    }

    // Get last 8 reflections from this school
    // Note: Using .not('metadata', 'is', null) and filtering in JS since
    // PostgREST JSON path syntax can vary
    const { data: reflections } = await supabase
      .from('hub_activity_log')
      .select('user_id, metadata, created_at')
      .neq('action', 'account_provisioned')
      .in('user_id', userIds)
      .eq('action', 'quick_win_reflection')
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
