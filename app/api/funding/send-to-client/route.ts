import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { createSendFollowUps } from '@/lib/funding-followups'

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

  // contactEmail and windowCloses are accepted but unused. contactEmail became
  // unused deliberately: these follow-up items are TDI's own work and no longer
  // point at the school contact. Both are kept in the signature because callers
  // send them and removing them would be a breaking API change for no gain.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { opportunityId, pursuitId, contactName, contactEmail, windowOpens, windowCloses } = await request.json()

  if (!opportunityId || !pursuitId) {
    return NextResponse.json({ error: 'opportunityId and pursuitId required' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // 1. Mark opportunity as sent to client. If this fails silently the grant
  // was emailed and the record does not know, so nothing chases it and the
  // screen still offers to send it again.
  const { error: sentErr } = await supabase
    .from('funding_opportunities')
    .update({
      forwarding_email_status: 'sent',
      narrative_status: 'ready',
      updated_at: new Date().toISOString(),
    })
    .eq('id', opportunityId)

  if (sentErr) {
    console.error('[send-to-client] failed to record that the grant was sent:', sentErr.message)
    return NextResponse.json(
      { error: `Could not record that this was sent: ${sentErr.message}` },
      { status: 500 }
    )
  }

  // 2. Get opportunity name for action item titles
  const { data: opp } = await supabase
    .from('funding_opportunities')
    .select('name')
    .eq('id', opportunityId)
    .single()
  const grantName = opp?.name || 'grant'

  // 3. Schedule the chases we owe ourselves.
  //
  // This logic used to live inline here, and the approval queue sent the very
  // same email without any of it, so grants approved from Amara's drafts were
  // never chased. One definition now, in lib/funding-followups.ts, called by
  // both send paths.
  const followUps = await createSendFollowUps(supabase, {
    pursuitId,
    opportunityId,
    grantName,
    contactName,
    windowOpens,
  })

  if (followUps.error) {
    // The grant is with the school. If this failed, nothing will ever ask
    // whether they submitted it, which is precisely how Title II-A was lost.
    console.error('[send-to-client] SENT but follow-ups failed to create:', followUps.error)
  }

  return NextResponse.json({
    success: true,
    milestonesCreated: followUps.created,
    alreadyHadFollowUps: followUps.skipped,
    followUpError: followUps.error ?? null,
  })
}
