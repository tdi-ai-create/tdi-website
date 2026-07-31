import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const RESEND_API_KEY = process.env.RESEND_API_KEY

/**
 * GET /api/cron/wellness-outreach
 *
 * Runs daily. Checks for educators with 2+ consecutive low vibe
 * check-ins (score 1 or 2) in the last 7 days. Sends a warm,
 * non-intrusive outreach email offering support options.
 *
 * This is not therapy. It is a team saying "we noticed, we care,
 * here is how we can help."
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const isVercelCron = request.headers.get('x-vercel-cron') === '1'
      if (!isVercelCron) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!RESEND_API_KEY) return NextResponse.json({ error: 'Resend not configured' }, { status: 500 })

    const hubUrl = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
    const hubKey = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY
    if (!hubUrl || !hubKey) return NextResponse.json({ error: 'Hub not configured' }, { status: 500 })

    const hub = createClient(hubUrl, hubKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    // Find users with 2+ low scores (1 or 2) in the last 7 days
    const { data: lowScores } = await hub
      .from('hub_assessments')
      .select('user_id, stress_score, created_at')
      .eq('type', 'daily_check_in')
      .gte('created_at', sevenDaysAgo)
      .in('stress_score', [1, 2])
      .order('created_at', { ascending: false })

    if (!lowScores || lowScores.length === 0) {
      return NextResponse.json({ success: true, outreach_sent: 0, message: 'No educators flagged.' })
    }

    // Group by user
    const userCounts: Record<string, number> = {}
    for (const entry of lowScores) {
      userCounts[entry.user_id] = (userCounts[entry.user_id] || 0) + 1
    }

    // Filter to users with 2+ low scores
    const flaggedUserIds = Object.entries(userCounts)
      .filter(([, count]) => count >= 2)
      .map(([userId]) => userId)

    if (flaggedUserIds.length === 0) {
      return NextResponse.json({ success: true, outreach_sent: 0, message: 'No educators hit threshold.' })
    }

    // Check who already received outreach in the last 14 days (don't spam)
    const { data: recentOutreach } = await hub
      .from('hub_activity_log')
      .select('user_id')
      .eq('action', 'wellness_outreach_sent')
      .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .in('user_id', flaggedUserIds)

    const alreadyContacted = new Set((recentOutreach || []).map(r => r.user_id))
    const needsOutreach = flaggedUserIds.filter(id => !alreadyContacted.has(id))

    if (needsOutreach.length === 0) {
      return NextResponse.json({ success: true, outreach_sent: 0, message: 'All flagged educators already contacted recently.' })
    }

    // Get profiles for email
    const { data: profiles } = await hub
      .from('hub_profiles')
      .select('id, email, first_name, display_name')
      .in('id', needsOutreach)

    let sent = 0

    for (const profile of (profiles || [])) {
      if (!profile.email) continue

      const firstName = profile.first_name || profile.display_name?.split(' ')[0] || 'there'

      const html = `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 540px; margin: 0 auto; color: #374151; font-size: 15px; line-height: 1.7;">
          <div style="border-left: 4px solid #E8B84B; padding-left: 16px; margin-bottom: 24px;">
            <p style="font-size: 18px; font-weight: 700; color: #1e2749; margin: 0;">Checking in on you</p>
          </div>

          <p>Hi ${firstName},</p>

          <p>We noticed your recent check-ins have been on the tougher side. That is not a red flag. It is real life. And we wanted you to know that your TDI team is here if you need anything.</p>

          <p>Here are a few ways we can help right now:</p>

          <div style="background: #F9FAFB; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 12px; font-weight: 600; color: #1e2749;">Pick what feels right:</p>

            <p style="margin: 0 0 10px;">
              <strong style="color: #1e2749;">Talk it out.</strong>
              Reply to this email and we will set up a call with someone on the team. No agenda. Just a conversation.
            </p>

            <p style="margin: 0 0 10px;">
              <strong style="color: #1e2749;">Text Rae.</strong>
              Seriously. If you need to vent, share a win, or just say "today was hard," Rae reads every message. 309-258-2015.
            </p>

            <p style="margin: 0 0 10px;">
              <strong style="color: #1e2749;">Try a quick reset.</strong>
              <a href="https://www.teachersdeserveit.com/hub/practice/reset-roulette" style="color: #E8B84B; text-decoration: none; font-weight: 600;">Reset Roulette</a>
              is a 2 minute guided activity. Breathwork, movement, gratitude. It helps more than you think.
            </p>

            <p style="margin: 0 0 10px;">
              <strong style="color: #1e2749;">Request something specific.</strong>
              Need a tool for a problem you are facing? Reply with what you are dealing with and our content team will look into building something for it.
            </p>

            <p style="margin: 0;">
              <strong style="color: #1e2749;">Just know someone noticed.</strong>
              You do not have to respond to this email. We just wanted you to know that the work you do matters, and so do you.
            </p>
          </div>

          <p>We are in your corner.</p>
          <p>The TDI Team</p>

          <p style="margin-top: 24px; color: #9CA3AF; font-size: 12px;">
            This message was sent because your recent Hub check-ins indicated you might be having a tough stretch. We will not send another for at least 2 weeks. If you would prefer not to receive these, reply and let us know.
          </p>
        </div>
      `

      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Teachers Deserve It <hello@teachersdeserveit.com>',
            to: [profile.email],
            reply_to: 'Rae@TeachersDeserveIt.com',
            subject: 'Checking in on you',
            html,
          }),
        })

        // Log that we sent outreach (prevents re-sending for 14 days)
        await hub.from('hub_activity_log').insert({
          user_id: profile.id,
          action: 'wellness_outreach_sent',
          metadata: {
            low_score_count: userCounts[profile.id],
            trigger: 'cron_wellness_outreach',
          },
        })

        sent++
      } catch (err) {
        console.error('[wellness-outreach] Failed for:', profile.email, err)
      }
    }

    return NextResponse.json({
      success: true,
      flagged: flaggedUserIds.length,
      already_contacted: alreadyContacted.size,
      outreach_sent: sent,
    })
  } catch (error) {
    console.error('[wellness-outreach] Error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
