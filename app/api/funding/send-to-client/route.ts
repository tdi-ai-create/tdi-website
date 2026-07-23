import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'

/**
 * POST /api/funding/send-to-client
 *
 * Called after an application package is sent to a school contact.
 * Updates the opportunity status and creates follow-up milestones.
 *
 * Body: { opportunityId, pursuitId, contactName, contactEmail, windowOpens, windowCloses }
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const { opportunityId, pursuitId, contactName, contactEmail, windowOpens, windowCloses } = await request.json()

  if (!opportunityId || !pursuitId) {
    return NextResponse.json({ error: 'opportunityId and pursuitId required' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // 1. Mark opportunity as sent to client
  await supabase
    .from('funding_opportunities')
    .update({
      forwarding_email_status: 'sent',
      narrative_status: 'ready',
      updated_at: new Date().toISOString(),
    })
    .eq('id', opportunityId)

  // 2. Get opportunity name for action item titles
  const { data: opp } = await supabase
    .from('funding_opportunities')
    .select('name')
    .eq('id', opportunityId)
    .single()
  const grantName = opp?.name || 'grant'

  // 3. Create follow-up milestones (only if window dates exist)
  const milestones = []
  const firstName = (contactName || '').split(' ')[0] || 'the contact'

  if (windowOpens) {
    const windowDate = new Date(windowOpens + 'T00:00:00')
    const deedCheckDate = new Date(windowDate.getTime() - 3 * 86400000) // 3 days before window
    const reminderDate = new Date(windowDate.getTime()) // day window opens
    const followUpDate = new Date(windowDate.getTime() + 7 * 86400000) // 7 days after

    // Check if milestones already exist
    const { data: existing } = await supabase
      .from('funding_action_items')
      .select('id')
      .eq('opportunity_id', opportunityId)
      .eq('category', 'follow_up')
      .eq('status', 'pending')

    if (!existing || existing.length === 0) {
      milestones.push({
        pursuit_id: pursuitId,
        opportunity_id: opportunityId,
        title: `Check if ${firstName} set up their Deed account`,
        description: `Follow up to confirm Deed registration is complete before the ${grantName} window opens. If not started, offer a call to walk through it.`,
        owner_type: 'client',
        owner_name: contactName,
        owner_email: contactEmail,
        due_date: deedCheckDate.toISOString().split('T')[0],
        status: 'pending',
        category: 'follow_up',
        action_size: 'light',
      })

      milestones.push({
        pursuit_id: pursuitId,
        opportunity_id: opportunityId,
        title: `Remind ${firstName}: ${grantName} window is open. Time to submit.`,
        description: `Send a reminder that the application window is open. Resend the application package link. Offer to submit together on a call.`,
        owner_type: 'client',
        owner_name: contactName,
        owner_email: contactEmail,
        due_date: reminderDate.toISOString().split('T')[0],
        status: 'pending',
        category: 'follow_up',
        action_size: 'light',
      })

      milestones.push({
        pursuit_id: pursuitId,
        opportunity_id: opportunityId,
        title: `Check if ${firstName} submitted the ${grantName} application`,
        description: `Follow up to confirm submission. Ask them to forward the confirmation email to bella@teachersdeserveit.com. If not submitted, offer to walk through it on a call.`,
        owner_type: 'client',
        owner_name: contactName,
        owner_email: contactEmail,
        due_date: followUpDate.toISOString().split('T')[0],
        status: 'pending',
        category: 'follow_up',
        action_size: 'light',
      })
    }
  }

  if (milestones.length > 0) {
    await supabase.from('funding_action_items').insert(milestones)
  }

  return NextResponse.json({
    success: true,
    milestonesCreated: milestones.length,
  })
}
