import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { calculateAlerts, formatAlertsForEmail } from '@/lib/tdi-admin/alert-rules'

export async function GET(request: NextRequest) {
  try {
    // Verify this is called from Vercel cron or authorized source
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const isVercelCron = request.headers.get('x-vercel-cron') === '1'
      if (!isVercelCron) {
        console.log('[daily-alerts] Unauthorized request')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const resendApiKey = process.env.RESEND_API_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Server config error - missing Supabase credentials' },
        { status: 500 }
      )
    }

    if (!resendApiKey) {
      return NextResponse.json(
        { success: false, error: 'Server config error - missing Resend API key' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const resend = new Resend(resendApiKey)

    // Fetch all active districts with needed data
    const { data: districts, error: districtError } = await supabase
      .from('districts')
      .select(`
        id, name, state, status,
        intelligence_contracts(*),
        intelligence_invoices(
          id, invoice_number, amount, status,
          collections_workflow(risk_flag, current_stage, next_follow_up_at)
        ),
        intelligence_tasks(id, status, due_date),
        district_meetings(id, meeting_date)
      `)
      .in('status', ['active', 'pilot'])

    if (districtError) {
      console.error('[daily-alerts] Error fetching districts:', districtError)
      return NextResponse.json(
        { success: false, error: districtError.message },
        { status: 500 }
      )
    }

    const districtIds = (districts ?? []).map((d: any) => d.id)

    const { data: deliveryData } = await supabase
      .from('district_delivery_events')
      .select('district_id, session_type, session_date')
      .in('district_id', districtIds)

    const sessionsByDistrict: Record<string, any[]> = {}
    ;(deliveryData ?? []).forEach((s: any) => {
      if (!sessionsByDistrict[s.district_id]) sessionsByDistrict[s.district_id] = []
      sessionsByDistrict[s.district_id].push(s)
    })

    const alerts = calculateAlerts({
      districts: districts ?? [],
      sessionsByDistrict,
    })

    // Only send email if there are alerts (skip empty days)
    if (alerts.length === 0) {
      console.log('[daily-alerts] No active alerts - skipping email')
      return NextResponse.json({ sent: false, reason: 'No active alerts' })
    }

    const today = new Date()
    const htmlContent = formatAlertsForEmail(alerts, today)

    const criticalCount = alerts.filter(a => a.severity === 'critical').length
    const warningCount = alerts.filter(a => a.severity === 'warning').length

    const { error: emailError } = await resend.emails.send({
      from: 'TDI Admin <noreply@teachersdeserveit.com>',
      to: ['Rae@teachersdeserveit.com'],
      subject: `TDI Alert Digest - ${criticalCount} Critical, ${warningCount} Warnings`,
      html: htmlContent,
    })

    if (emailError) {
      console.error('[daily-alerts] Error sending email:', emailError)
      return NextResponse.json(
        { success: false, error: emailError.message },
        { status: 500 }
      )
    }

    console.log(`[daily-alerts] Sent digest with ${alerts.length} alerts`)

    return NextResponse.json({
      sent: true,
      alertCount: alerts.length,
      critical: criticalCount,
      warnings: warningCount,
    })
  } catch (error) {
    console.error('[daily-alerts] Cron error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send alert digest' },
      { status: 500 }
    )
  }
}
