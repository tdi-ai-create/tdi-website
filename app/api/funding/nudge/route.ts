import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { FUNDING_EMAIL_TEMPLATES, renderTemplate } from '@/lib/funding-email-templates'

/**
 * One-click nudge: auto-drafts and sends a nudge email for a client action item.
 * Looks up the pursuit's client contact, renders the nudge template, sends via Resend.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth()
    if (auth instanceof NextResponse) return auth

    const body = await request.json()
    const { actionId, sendImmediately = true } = body

    if (!actionId) return NextResponse.json({ error: 'actionId required' }, { status: 400 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get the action item with pursuit and opportunity
    const { data: action } = await supabase
      .from('funding_action_items')
      .select('*, pursuit:funding_pursuits!pursuit_id(*), opportunity:funding_opportunities!opportunity_id(name, amount, application_closes)')
      .eq('id', actionId)
      .single()

    if (!action) return NextResponse.json({ error: 'Action not found' }, { status: 404 })

    const pursuit = action.pursuit
    if (!pursuit?.client_contact_email) {
      return NextResponse.json({ error: 'No client contact email on this pursuit' }, { status: 400 })
    }

    // Build template variables
    const variables = {
      school_name: pursuit.pursuit_name || pursuit.district_name || '',
      contact_name: pursuit.client_contact_name || 'there',
      contact_role: pursuit.client_contact_role || '',
      funding_source: action.opportunity?.name || action.title || '',
      amount: action.opportunity?.amount ? `$${Number(action.opportunity.amount).toLocaleString()}` : '',
      deadline: action.opportunity?.application_closes
        ? new Date(action.opportunity.application_closes + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : '',
      days_until_deadline: action.opportunity?.application_closes
        ? String(Math.ceil((new Date(action.opportunity.application_closes + 'T00:00:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : '',
      submission_steps: action.prepared_materials || action.description || '',
      tdi_contact_name: 'Rae',
    }

    // Pick template -- use deadline_reminder for overdue items, nudge for others
    const isOverdue = action.due_date && new Date(action.due_date + 'T00:00:00') < new Date()
    const templateKey = isOverdue ? 'deadline_reminder' : 'nudge'

    const template = FUNDING_EMAIL_TEMPLATES[templateKey as keyof typeof FUNDING_EMAIL_TEMPLATES]
    const rendered = renderTemplate(template, variables)

    // Save to email log
    const { data: emailRecord, error: insertErr } = await supabase
      .from('funding_email_log')
      .insert({
        pursuit_id: pursuit.id,
        opportunity_id: action.opportunity_id,
        template_id: templateKey,
        subject: rendered.subject,
        body: rendered.body,
        to_email: pursuit.client_contact_email,
        to_name: pursuit.client_contact_name,
        status: sendImmediately ? 'draft' : 'draft', // will be updated after send
        sent_by: auth.member?.email || auth.user?.email,
        email_type: 'nudge',
      })
      .select()
      .single()

    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

    // Send if requested
    if (sendImmediately) {
      const resendKey = process.env.RESEND_API_KEY
      if (!resendKey) return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'Rae Hughart <rae@teachersdeserveit.com>',
          to: [pursuit.client_contact_email],
          subject: rendered.subject,
          text: rendered.body,
        }),
      })

      const result = await res.json()

      if (res.ok) {
        // Update email log
        await supabase.from('funding_email_log').update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          resend_id: result.id || null,
        }).eq('id', emailRecord.id)

        // Update nudge tracking on action item
        await supabase.from('funding_action_items').update({
          nudge_count: (action.nudge_count || 0) + 1,
          last_nudge_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('id', actionId)

        // Update opportunity activity
        if (action.opportunity_id) {
          await supabase.from('funding_opportunities').update({
            last_activity_at: new Date().toISOString(),
          }).eq('id', action.opportunity_id)
        }

        // Timeline event
        await supabase.from('funding_pursuit_timeline').insert({
          pursuit_id: pursuit.id,
          event_date: new Date().toISOString().split('T')[0],
          event_title: `Nudge sent: ${action.title}`,
          event_detail: `Email sent to ${pursuit.client_contact_name || pursuit.client_contact_email}`,
          status: 'complete',
        })

        return NextResponse.json({ success: true, sent: true, emailId: emailRecord.id })
      } else {
        await supabase.from('funding_email_log').update({ status: 'failed' }).eq('id', emailRecord.id)
        return NextResponse.json({ error: result.message || 'Send failed', emailId: emailRecord.id }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, sent: false, emailId: emailRecord.id })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
