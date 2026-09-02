import { NextRequest, NextResponse } from 'next/server'
import { guardCron } from '@/lib/cron-guard'
import { createClient } from '@supabase/supabase-js'
import { notifyCreatorOfNote } from '@/lib/creator-note-notify'
import { scheduledNoteHeld, scheduledNoteEmailFailed } from '@/lib/creator-slack'

// ---------------------------------------------------------------------------
// Scheduled check-in notes
//
// Approving a note and sending it are separate events. A note approved on a
// Friday evening can be held until Monday morning. This publishes the ones
// that have come due.
//
// Runs hourly so a scheduled time is honoured to the hour rather than landing
// at whatever time a daily job happens to run.
//
// Pause state is re-checked here, not just at approval. A note can be approved
// and scheduled a week out, and the creator can pause in between.
// ---------------------------------------------------------------------------

export const dynamic = 'force-dynamic'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(request: NextRequest) {
  // guardCron rather than a hand-rolled check. The old one read
  // `if (cronSecret && ...)`, so with CRON_SECRET unset the whole check was
  // skipped and anyone could invoke it. This job publishes notes to creators,
  // so an unauthenticated caller could push scheduled drafts live early.
  // guardCron honours the same x-vercel-cron header this checked by hand.
  const guard = guardCron(request)
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status ?? 401 })
  }
  const dryRun = guard.dryRun

  const supabase = db()
  const now = new Date().toISOString()

  const { data: dueNotes, error } = await supabase
    .from('creator_notes')
    .select('id, creator_id, scheduled_send_at')
    .eq('draft_status', 'scheduled')
    .lte('scheduled_send_at', now)
    .order('scheduled_send_at', { ascending: true })

  if (error) {
    console.error('[creator-scheduled-notes] Query failed:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!dueNotes || dueNotes.length === 0) {
    return NextResponse.json({ sent: 0, held: 0, failed: 0 })
  }

  const creatorIds = [...new Set(dueNotes.map(n => n.creator_id))]
  const { data: creators } = await supabase
    .from('creators')
    .select('id, name, lifecycle_state, status, paused_at')
    .in('id', creatorIds)

  const creatorMap = new Map((creators || []).map(c => [c.id, c]))

  let sent = 0
  let held = 0
  let failed = 0

  for (const note of dueNotes) {
    const creator = creatorMap.get(note.creator_id)

    // Paused or inactive since scheduling. Put it back in the review queue
    // rather than sending it or silently dropping it, so a human decides.
    if (!creator || creator.lifecycle_state === 'paused' || creator.status !== 'active') {
      if (dryRun) { held += 1; continue }
      const { error: holdError } = await supabase
        .from('creator_notes')
        .update({
          draft_status: 'pending_approval',
          scheduled_send_at: null,
          scheduled_by: null,
        })
        .eq('id', note.id)
        .eq('draft_status', 'scheduled')

      if (holdError) {
        // Left scheduled, so the next run tries again. Counting it as held
        // would report a note as safely parked when it is still queued to go
        // to a paused creator.
        console.error('[scheduled-notes] Could not hold note', note.id, holdError.message)
        failed += 1
        continue
      }

      held += 1
      await scheduledNoteHeld(
        creator?.name || 'Unknown creator',
        creator?.lifecycle_state === 'paused' ? 'Creator is paused' : 'Creator is no longer active'
      ).catch(() => {})
      continue
    }

    // Claim the row before sending so a retry or an overlapping run cannot
    // send the same note twice.
    if (dryRun) { sent += 1; continue }

    const { data: claimed, error: claimError } = await supabase
      .from('creator_notes')
      .update({ draft_status: 'published', visible_to_creator: true })
      .eq('id', note.id)
      .eq('draft_status', 'scheduled')
      .select('id, creator_id')
      .single()

    // Two different things used to look identical. No row means another run
    // already claimed it, which is fine and is the point of the claim. An error
    // means the write failed, and skipping quietly would leave the note
    // scheduled forever while the run reported success.
    if (claimError) {
      console.error('[scheduled-notes] Claim failed for note', note.id, claimError.message)
      failed += 1
      continue
    }
    if (!claimed) continue

    const notified = await notifyCreatorOfNote(supabase, claimed.creator_id, {
      source: 'creator-scheduled-notes',
      actor: 'scheduled send',
    })

    if (notified.sent) {
      sent += 1
    } else {
      failed += 1
      console.error(
        `[creator-scheduled-notes] Published note ${claimed.id} but email failed: ${notified.reason}`
      )
      await scheduledNoteEmailFailed(creator.name, notified.reason || 'unknown error').catch(() => {})
    }
  }

  console.log(`[creator-scheduled-notes] sent=${sent} held=${held} failed=${failed}`)
  return NextResponse.json({ sent, held, failed, considered: dueNotes.length })
}
