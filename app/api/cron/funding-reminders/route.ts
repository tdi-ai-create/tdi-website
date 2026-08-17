import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { calculateFundingAlerts } from '@/lib/tdi-admin/funding-alert-rules'
import { syncGateActionItems } from '@/lib/funding-gate-sync'
import { loadSettings } from '@/lib/funding-slack'

/**
 * Daily cron endpoint for funding reminders.
 * - Computes alerts across all pursuits
 * - Sends internal digest email to rae@teachersdeserveit.com
 * - Auto-drafts nudge emails for critical deadlines
 *
 * Call via Vercel cron or external scheduler.
 * Protected by CRON_SECRET header.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch all active data. Archived pursuits are excluded here and their
    // opportunities and action items filtered out below — otherwise the daily
    // digest reports on schools we are no longer working with.
    const [pursuitRes, oppRes, actionRes] = await Promise.all([
      supabase.from('funding_pursuits').select('*').neq('archived', true),
      supabase.from('funding_opportunities').select('*').not('status', 'in', '("awarded","denied")'),
      supabase.from('funding_action_items').select('*').not('status', 'in', '("done","skipped")'),
    ])

    const pursuits = pursuitRes.data || []
    const activeIds = new Set(pursuits.map(p => p.id))
    const opportunities = (oppRes.data || []).filter(o => activeIds.has(o.pursuit_id))
    let actionItems = (actionRes.data || []).filter(a => activeIds.has(a.pursuit_id))

    // Reconcile gate gaps into client action items before computing alerts.
    // The gate PUT does this going forward, but a pursuit whose gate was shut
    // and never touched again would otherwise never surface its blockers. That
    // is exactly how St. Peter Chanel went 23 days with nothing happening.
    let gateItemsCreated = 0
    const { data: gates } = await supabase
      .from('pursuit_gate')
      .select('*')
      .in('pursuit_id', Array.from(activeIds))

    const gateByPursuit = new Map((gates || []).map(g => [g.pursuit_id, g]))
    for (const p of pursuits) {
      const res = await syncGateActionItems(supabase, p.id, gateByPursuit.get(p.id) ?? null)
        .catch(() => ({ created: 0, resolved: 0 }))
      gateItemsCreated += res.created
    }

    // Re-read action items if the reconcile added any, so the digest sees them
    if (gateItemsCreated > 0) {
      const { data: refreshed } = await supabase
        .from('funding_action_items')
        .select('*')
        .not('status', 'in', '("done","skipped")')
      actionItems = (refreshed || []).filter(a => activeIds.has(a.pursuit_id))
    }

    const alerts = calculateFundingAlerts({ pursuits, opportunities, actionItems })

    const critical = alerts.filter(a => a.severity === 'critical')
    const warnings = alerts.filter(a => a.severity === 'warning')

    // Build digest email
    if (alerts.length > 0) {
      const digestHtml = buildDigestEmail(critical, warnings, pursuits)

      const resendKey = process.env.RESEND_API_KEY
      if (resendKey) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'TDI Funding <noreply@teachersdeserveit.com>',
            to: ['rae@teachersdeserveit.com'],
            subject: `Funding Digest: ${critical.length} critical, ${warnings.length} warnings`,
            html: digestHtml,
          }),
        })
      }
    }

    // Auto-draft nudge emails for critical deadline alerts
    let draftCount = 0
    for (const alert of critical) {
      if (alert.category !== 'deadline' || !alert.opportunity_id) continue

      // Find the pursuit to get client contact
      const pursuit = pursuits.find(p => p.id === alert.pursuit_id)
      if (!pursuit?.client_contact_email) continue

      // Check if a nudge was already drafted/sent in the last 3 days
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

      const { data: recentEmails } = await supabase
        .from('funding_email_log')
        .select('id')
        .eq('opportunity_id', alert.opportunity_id)
        .in('email_type', ['nudge', 'deadline_reminder'])
        .gte('created_at', threeDaysAgo.toISOString())
        .limit(1)

      if (recentEmails && recentEmails.length > 0) continue

      // Auto-draft a nudge
      await supabase.from('funding_email_log').insert({
        pursuit_id: alert.pursuit_id,
        opportunity_id: alert.opportunity_id,
        template_id: 'deadline_reminder',
        subject: `Heads up: ${alert.opportunity_name} deadline approaching`,
        body: `Hi ${pursuit.client_contact_name || 'there'},\n\nWanted to flag that the ${alert.opportunity_name} application window is closing soon. Everything is prepped on our end.\n\nCan we find 15 minutes to get this submitted together?\n\nRae`,
        to_email: pursuit.client_contact_email,
        to_name: pursuit.client_contact_name,
        status: 'draft',
        sent_by: 'system',
        email_type: 'deadline_reminder',
      })
      draftCount++
    }

    // ── One daily message to Bella: what is waiting for her to send ──
    //
    // The follow-up cron no longer emails schools. It writes a draft and stops,
    // which makes her queue the place work waits. Nothing told her it was there.
    //
    // That gap is not theoretical. funding_email_log held 56 rows and every one
    // was 'sent', meaning no draft had ever existed before the drafting rule
    // shipped, and the queue had never been somewhere anyone needed to look.
    // Two finished Saunemin applications also sat unapproved for a day because
    // nothing announced them.
    //
    // Deliberately one message per day rather than one per draft. The last
    // notification problem in this system was volume, and a per-draft ping on a
    // busy afternoon rebuilds it in a new place.
    //
    // This cron runs once daily on its own schedule, so no hour guard is needed
    // here, unlike the agent-overdue digest which fakes "daily" with an hour
    // equality inside an hourly job.
    let draftsWaiting = 0
    const { data: pendingDrafts } = await supabase
      .from('funding_email_log')
      .select('id, subject, to_name, to_email, pursuit_id, created_at')
      .eq('status', 'draft')
      .order('created_at', { ascending: true })

    if (pendingDrafts && pendingDrafts.length > 0) {
      draftsWaiting = pendingDrafts.length

      // Pursuit names carry internal bookkeeping: "(RENEWAL) Allenwood
      // Elementary - Grant Funded". Bella reads this message every morning, so
      // it should say the school's name and nothing else.
      const tidySchool = (raw: string | null | undefined) =>
        (raw || '')
          .replace(/^\(RENEWAL\)\s*/i, '')
          .replace(/\s*[-–]\s*Grant Fund(ing|ed)$/i, '')
          .trim() || 'unknown school'

      const nameFor = new Map(
        pursuits.map(p => [p.id, tidySchool(p.district_name || p.pursuit_name)]),
      )
      const lines = pendingDrafts.slice(0, 10).map(d => {
        const who = d.to_name || d.to_email || 'unknown recipient'
        const school = nameFor.get(d.pursuit_id) || 'unknown school'
        return `  • ${who}, ${school}: ${d.subject}`
      })
      if (pendingDrafts.length > 10) {
        lines.push(`  • and ${pendingDrafts.length - 10} more`)
      }

      const settings = await loadSettings()
      if (settings.slack_enabled && settings.slack_webhook_url) {
        const mention = settings.bella_slack_handle ? ` <@${settings.bella_slack_handle}>` : ''
        const portalUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.teachersdeserveit.com'
        const noun = draftsWaiting === 1 ? 'draft is' : 'drafts are'
        await fetch(settings.slack_webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text:
              `*${draftsWaiting} ${noun} waiting to send*${mention}\n` +
              `${lines.join('\n')}\n` +
              `<${portalUrl}/tdi-admin/funding|Open the funding portal>`,
          }),
          // Loud on failure. A swallowed error here means she is never told and
          // the drafts sit unseen, which is the failure this exists to prevent.
        }).catch(err => console.error('[funding-reminders] Draft digest post failed:', err))
      } else {
        console.log('[funding-reminders] Slack disabled — would have reported', draftsWaiting, 'waiting draft(s)')
      }
    }

    return NextResponse.json({
      success: true,
      alerts_count: alerts.length,
      critical_count: critical.length,
      warning_count: warnings.length,
      drafts_created: draftCount,
      drafts_waiting: draftsWaiting,
      digest_sent: alerts.length > 0,
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function buildDigestEmail(
  critical: any[],
  warnings: any[],
  pursuits: any[]
): string {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  let html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1B365D; color: white; padding: 20px 24px; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 18px; font-weight: 700;">Funding Daily Digest</h1>
        <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.8;">${today}</p>
      </div>
      <div style="background: white; padding: 20px 24px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px;">
  `

  if (critical.length > 0) {
    html += `<h2 style="color: #DC2626; font-size: 14px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">Critical (${critical.length})</h2>`
    critical.forEach(a => {
      html += `
        <div style="padding: 10px 14px; margin-bottom: 8px; background: #FEF2F2; border-radius: 8px; border-left: 3px solid #DC2626;">
          <p style="margin: 0; font-size: 13px; font-weight: 600; color: #1e2749;">${a.title}</p>
          <p style="margin: 2px 0 0; font-size: 11px; color: #6B7280;">${a.pursuit_name} &middot; ${a.description}</p>
          <p style="margin: 4px 0 0; font-size: 11px; color: #DC2626; font-weight: 600;">Action: ${a.action}</p>
        </div>
      `
    })
  }

  if (warnings.length > 0) {
    html += `<h2 style="color: #D97706; font-size: 14px; margin: 16px 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">Warnings (${warnings.length})</h2>`
    warnings.forEach(a => {
      html += `
        <div style="padding: 10px 14px; margin-bottom: 8px; background: #FFFBEB; border-radius: 8px; border-left: 3px solid #F59E0B;">
          <p style="margin: 0; font-size: 13px; font-weight: 600; color: #1e2749;">${a.title}</p>
          <p style="margin: 2px 0 0; font-size: 11px; color: #6B7280;">${a.pursuit_name} &middot; ${a.description}</p>
        </div>
      `
    })
  }

  html += `
        <p style="margin: 20px 0 0; font-size: 11px; color: #9CA3AF; text-align: center;">
          ${pursuits.length} active pursuits &middot; View details at /tdi-admin/funding
        </p>
      </div>
    </div>
  `

  return html
}
