import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'
import { logCreatorEmail } from '@/lib/creator-email-log'
import { creatorEmailTemplate } from '@/lib/creator-email-template'
import {
  PAUSE_CHECK_IN_SENDS_ENABLED,
  PAUSE_CHECK_IN_INTERVAL_DAYS,
  unpauseUrl,
} from '@/lib/reengagement-config'

// ---------------------------------------------------------------------------
// Paused creator check-in
//
// Every PAUSE_CHECK_IN_INTERVAL_DAYS, a paused creator hears from Bella so that
// pausing is a rest rather than a disappearance.
//
// This used to log a check-in and stamp last_check_in_at without sending
// anything, because the email was never written. That was worse than doing
// nothing: the stamp pushed the next attempt out another 90 days, so creators
// paused in May 2026 had received no contact at all by August. Only stamp on a
// send that actually succeeded.
// ---------------------------------------------------------------------------

const EMAIL_FROM = 'Bella from TDI Creator Studio <creatorstudio@teachersdeserveit.com>'
const REPLY_TO = 'bella@teachersdeserveit.com'

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel cron sends this header)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    const isVercelCron = request.headers.get('x-vercel-cron') === '1'
    if (!isVercelCron) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const resendApiKey = process.env.RESEND_API_KEY

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - PAUSE_CHECK_IN_INTERVAL_DAYS)

    // Find creators eligible for check-in
    const { data: eligible } = await (supabase.from('creators') as any)
      .select('id, name, email, paused_at, last_check_in_at, unpause_token, is_test_account')
      .eq('lifecycle_state', 'paused')
      .lt('paused_at', cutoff.toISOString())
      .or(`last_check_in_at.is.null,last_check_in_at.lt.${cutoff.toISOString()}`)

    const toSend = (eligible || []).filter((c: any) => !c.is_test_account)

    const sent: string[] = []
    const suppressed: string[] = []
    const errors: string[] = []

    for (const creator of toSend) {
      if (!creator.email) continue

      const firstName = creator.name?.split(' ')[0] || 'there'

      // A paused creator may have no token, or one that was consumed by an
      // earlier reactivation. Mint one so the link in this email always works.
      let token: string = creator.unpause_token
      if (!token) {
        token = randomBytes(24).toString('hex')
        const { error: tokenError } = await (supabase.from('creators') as any)
          .update({ unpause_token: token })
          .eq('id', creator.id)

        if (tokenError) {
          errors.push(`Token mint failed for ${creator.email}: ${tokenError.message}`)
          continue
        }
      }

      const subject = `Creator Studio | Still here whenever you're ready, ${firstName}`
      const html = creatorEmailTemplate({
        firstName,
        tagline: 'No rush, no pressure',
        body: `
          <p>Hey ${firstName},</p>
          <p>Your Creator Studio account has been paused for a while now, and I wanted to check in. Not to nudge you, just so you know you have not been forgotten.</p>
          <p>Everything you built is still saved exactly where you left it, and your affiliate link has been earning quietly the whole time.</p>
          <p>If you would like to pick things back up, the button below brings your account straight back. No signing in, no starting over. And if now still is not the time, that is a completely fine answer. I will check in again in a few months.</p>
          <p>Either way, I am glad you started this,<br/>Bella</p>
        `,
        ctaLabel: 'Bring My Account Back',
        ctaUrl: unpauseUrl(token),
      })

      // ---- Rehearsal path: change nothing, stamp nothing ----
      if (!PAUSE_CHECK_IN_SENDS_ENABLED || !resendApiKey) {
        suppressed.push(creator.id)
        await logCreatorEmail({
          creator_id: creator.id,
          creator_name: creator.name,
          creator_email: creator.email,
          direction: 'to_creator',
          category: 'pause_check_in',
          subject,
          sent_by: 'cron:pause-check-ins',
          dry_run: true,
        })
        continue
      }

      const delivered = await sendEmail(resendApiKey, creator.email, subject, html)

      if (!delivered) {
        // Deliberately leave last_check_in_at alone so this creator is picked
        // up again tomorrow rather than deferred for another cycle.
        errors.push(`Send failed for ${creator.email}`)
        continue
      }

      const { error: stampError } = await (supabase.from('creators') as any)
        .update({ last_check_in_at: new Date().toISOString() })
        .eq('id', creator.id)

      if (stampError) {
        errors.push(`Check-in stamp failed for ${creator.email}: ${stampError.message}`)
      }

      await (supabase.from('creator_pause_history') as any).insert({
        creator_id: creator.id,
        event_type: 'check_in_sent',
        triggered_by: 'system',
        triggered_by_type: 'system',
      })

      await logCreatorEmail({
        creator_id: creator.id,
        creator_name: creator.name,
        creator_email: creator.email,
        direction: 'to_creator',
        category: 'pause_check_in',
        subject,
        sent_by: 'cron:pause-check-ins',
      })

      sent.push(creator.id)
    }

    console.log(
      `[pause-check-ins] sends ${PAUSE_CHECK_IN_SENDS_ENABLED ? 'ON' : 'OFF'} — sent: ${sent.length}, suppressed: ${suppressed.length}, errors: ${errors.length}`
    )

    return NextResponse.json({
      sendsEnabled: PAUSE_CHECK_IN_SENDS_ENABLED,
      eligible: toSend.length,
      sent: sent.length,
      suppressed: suppressed.length,
      creator_ids: sent,
      errors,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

async function sendEmail(
  apiKey: string,
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [to],
        bcc: ['bella@teachersdeserveit.com', 'rae@teachersdeserveit.com'],
        subject,
        html,
        reply_to: REPLY_TO,
      }),
    })

    if (!res.ok) {
      console.error('[pause-check-ins] Resend error:', await res.json())
      return false
    }
    return true
  } catch (e) {
    console.error('[pause-check-ins] Email send error:', e)
    return false
  }
}
