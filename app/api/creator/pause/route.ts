import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'
import { CREATOR_STUDIO_RECIPIENTS } from '@/lib/creator-notification-recipients'

export async function POST(request: NextRequest) {
  try {
    const { creatorId, email, reason } = await request.json()
    if (!creatorId || !email) {
      return NextResponse.json({ error: 'Missing creatorId or email' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Check if creator has in-progress milestones
    const { data: milestones } = await (supabase
      .from('creator_milestones') as any)
      .select('status')
      .eq('creator_id', creatorId)
      .not('status', 'in', '("completed","locked")')

    const pauseType = (milestones && milestones.length > 0) ? 'pause_mid_project' : 'pause_between_projects'
    const unpauseToken = randomBytes(24).toString('hex')

    // Update creator
    const { error: updateError } = await (supabase.from('creators') as any)
      .update({
        lifecycle_state: 'paused',
        paused_at: new Date().toISOString(),
        paused_by: `creator:${email}`,
        pause_reason: reason || null,
        pause_type: pauseType,
        unpause_token: unpauseToken,
        updated_at: new Date().toISOString(),
      })
      .eq('id', creatorId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log to history
    await (supabase.from('creator_pause_history') as any).insert({
      creator_id: creatorId,
      event_type: 'paused',
      triggered_by: `creator:${email}`,
      triggered_by_type: 'creator',
      reason: reason || null,
    })

    // Get creator name for emails
    const { data: creator } = await (supabase.from('creators') as any)
      .select('name')
      .eq('id', creatorId)
      .single()
    const firstName = creator?.name?.split(' ')[0] || 'there'

    // Send confirmation email to creator
    const resendApiKey = process.env.RESEND_API_KEY
    if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
            to: [email],
            subject: `Your Creator Studio account is paused`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1e2749;">Hey ${firstName},</h2>
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                  We've paused your Creator Studio account. No worries at all -- here's what you should know:
                </p>
                <ul style="color: #374151; font-size: 16px; line-height: 1.8;">
                  <li>Your work is saved exactly where you left it</li>
                  <li>Your affiliate link keeps earning passively</li>
                  <li>No emails or reminders while you're paused</li>
                  <li>You can come back anytime</li>
                </ul>
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                  When you're ready to jump back in, just sign into your <a href="https://www.teachersdeserveit.com/creator-portal/dashboard" style="color: #2563EB;">Creator Dashboard</a>.
                </p>
                <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
                  Take all the time you need. We'll be here when you're ready.
                </p>
                <p style="color: #6b7280; font-size: 14px;">-- The TDI Team</p>
              </div>
            `,
          }),
        })
      } catch (emailErr) {
        console.error('[pause] Email error:', emailErr)
      }

      // Notify the team
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
            to: CREATOR_STUDIO_RECIPIENTS,
            subject: `${creator?.name || email} paused their Creator Studio account`,
            text: `Creator: ${creator?.name || 'Unknown'} (${email})\nPause type: ${pauseType}\nReason: ${reason || 'No reason given'}\n\nView in admin: https://www.teachersdeserveit.com/tdi-admin/creators/${creatorId}`,
          }),
        })
      } catch (emailErr) {
        console.error('[pause] Team notification error:', emailErr)
      }
    }

    return NextResponse.json({ success: true, pauseType, unpauseToken })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
