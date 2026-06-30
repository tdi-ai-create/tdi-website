import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { calculateFundingAlerts } from '@/lib/tdi-admin/funding-alert-rules'

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

    // Fetch all active data
    const [pursuitRes, oppRes, actionRes] = await Promise.all([
      supabase.from('funding_pursuits').select('*'),
      supabase.from('funding_opportunities').select('*').not('status', 'in', '("awarded","denied")'),
      supabase.from('funding_action_items').select('*').not('status', 'in', '("done","skipped")'),
    ])

    const pursuits = pursuitRes.data || []
    const opportunities = oppRes.data || []
    const actionItems = actionRes.data || []

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

    return NextResponse.json({
      success: true,
      alerts_count: alerts.length,
      critical_count: critical.length,
      warning_count: warnings.length,
      drafts_created: draftCount,
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
