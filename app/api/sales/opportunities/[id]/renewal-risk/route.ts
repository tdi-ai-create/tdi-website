import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getServiceSupabase()

  // Get the opportunity
  const { data: opp, error } = await supabase
    .from('sales_opportunities')
    .select('id, name, type, stage, value')
    .eq('id', id)
    .single()

  if (error || !opp) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Try to find a matching partnership by name similarity
  const { data: partnerships } = await supabase
    .from('partnerships')
    .select('id, name, status, start_date, end_date')

  if (!partnerships?.length) {
    return NextResponse.json({ matched: false, reason: 'No partnerships found' })
  }

  // Fuzzy match: normalize and compare
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  const oppNorm = normalize(opp.name)
  let bestMatch: typeof partnerships[0] | null = null
  let bestScore = 0

  for (const p of partnerships) {
    const pNorm = normalize(p.name)
    // Check if one contains the other
    if (oppNorm.includes(pNorm) || pNorm.includes(oppNorm)) {
      const score = Math.min(oppNorm.length, pNorm.length) / Math.max(oppNorm.length, pNorm.length)
      if (score > bestScore) {
        bestScore = score
        bestMatch = p
      }
    }
  }

  if (!bestMatch || bestScore < 0.3) {
    return NextResponse.json({ matched: false, reason: 'No matching partnership found for Hub data' })
  }

  // Get Hub engagement data for this partnership
  const hubUrl = process.env.NEXT_PUBLIC_HUB_SUPABASE_URL
  const hubKey = process.env.HUB_SUPABASE_SERVICE_KEY
  if (!hubUrl || !hubKey) {
    return NextResponse.json({ matched: true, partnership: bestMatch.name, reason: 'Hub database not configured' })
  }

  const hubDb = createClient(hubUrl, hubKey)

  // Get members
  const { data: members } = await supabase
    .from('hub_org_members')
    .select('user_id')
    .eq('partnership_id', bestMatch.id)

  const userIds = members?.map(m => m.user_id) || []
  if (!userIds.length) {
    return NextResponse.json({
      matched: true,
      partnershipName: bestMatch.name,
      partnershipId: bestMatch.id,
      risk: 'high',
      riskScore: 85,
      factors: { memberCount: 0, reason: 'No Hub members linked to this partnership' },
    })
  }

  // Get recent activity (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()

  const [activityRes, enrollRes, loginRes] = await Promise.all([
    hubDb.from('hub_activity_log')
      .select('user_id, action, created_at')
      .in('user_id', userIds)
      .gte('created_at', thirtyDaysAgo)
      .eq('is_example', false),
    hubDb.from('hub_enrollments')
      .select('user_id, status, progress_pct')
      .in('user_id', userIds),
    hubDb.from('hub_activity_log')
      .select('user_id')
      .in('user_id', userIds)
      .gte('created_at', sevenDaysAgo)
      .eq('action', 'login')
      .eq('is_example', false),
  ])

  const recentActivity = activityRes.data || []
  const enrollments = enrollRes.data || []
  const recentLogins = loginRes.data || []

  // Compute engagement metrics
  const activeUsers30d = new Set(recentActivity.map(a => a.user_id)).size
  const activeUsers7d = new Set(recentLogins.map(a => a.user_id)).size
  const loginRate = userIds.length > 0 ? Math.round((activeUsers30d / userIds.length) * 100) : 0
  const completedEnrollments = enrollments.filter(e => e.status === 'completed').length
  const avgProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((s, e) => s + (e.progress_pct || 0), 0) / enrollments.length)
    : 0

  // Compute risk score (0 = no risk, 100 = highest risk)
  let riskScore = 50 // baseline

  // Login rate factor (most important)
  if (loginRate >= 60) riskScore -= 25
  else if (loginRate >= 30) riskScore -= 10
  else if (loginRate < 10) riskScore += 25
  else riskScore += 10

  // Recent activity factor
  if (activeUsers7d === 0) riskScore += 15
  else if (activeUsers7d / userIds.length > 0.3) riskScore -= 10

  // Course engagement factor
  if (avgProgress >= 50) riskScore -= 10
  else if (avgProgress < 10) riskScore += 10

  // Completion factor
  if (completedEnrollments > 0) riskScore -= 5

  riskScore = Math.max(0, Math.min(100, riskScore))

  const risk = riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low'

  return NextResponse.json({
    matched: true,
    partnershipName: bestMatch.name,
    partnershipId: bestMatch.id,
    risk,
    riskScore,
    factors: {
      memberCount: userIds.length,
      activeUsers30d,
      activeUsers7d,
      loginRate,
      enrollments: enrollments.length,
      completedEnrollments,
      avgProgress,
      recentActions: recentActivity.length,
    },
  })
}
