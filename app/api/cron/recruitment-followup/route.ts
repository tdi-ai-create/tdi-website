import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { recruitmentRevisitDue, recruitmentFollowUpDigest, type FollowUpItem } from '@/lib/creator-slack'

/**
 * Recruitment Follow-up Cron -- runs daily via Vercel cron.
 *
 * 1. Auto follow-up for outreach_sent candidates (5d, 12d thresholds)
 * 2. Auto-archive after 19 days with no response
 * 3. Resurface revisit candidates whose revisit_date has arrived
 */

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(request: NextRequest) {
  try {
    // Verify this is called from Vercel cron or authorized source
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const isVercelCron = request.headers.get('x-vercel-cron') === '1'
      if (!isVercelCron) {
        console.log('[recruitment-followup] Unauthorized request')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const supabase = db()
    const now = new Date()
    const results = {
      follow_up_1: 0,
      follow_up_2: 0,
      auto_archived: 0,
      revisits_resurfaced: 0,
    }

    // Collected so Bella gets one digest instead of silence.
    const dueNow: FollowUpItem[] = []
    const revisitItems: FollowUpItem[] = []
    const closedOut: FollowUpItem[] = []

    // ─── Follow-ups for outreach_sent candidates ───
    const { data: outreachCandidates } = await supabase
      .from('creator_recruitment_candidates')
      .select('id, name, outreach_sent_at, outreach_follow_up_1_at, outreach_follow_up_2_at')
      .eq('stage', 'outreach_sent')
      .not('outreach_sent_at', 'is', null)

    for (const candidate of (outreachCandidates || [])) {
      const sentAt = new Date(candidate.outreach_sent_at)
      const daysSinceSend = Math.floor((now.getTime() - sentAt.getTime()) / (1000 * 60 * 60 * 24))

      // 19+ days: auto-archive to no_response
      if (daysSinceSend >= 19 && candidate.outreach_follow_up_2_at) {
        const { error: archiveError } = await supabase
          .from('creator_recruitment_candidates')
          .update({ stage: 'no_response' })
          .eq('id', candidate.id)

        if (archiveError) {
          console.error('[recruitment-followup] Auto archive failed, this one will be raised again tomorrow:', archiveError.message)
          continue
        }

        const { error: archiveNoteError } = await supabase.from('creator_recruitment_notes').insert({
          candidate_id: candidate.id,
          content: `Auto-archived after ${daysSinceSend} days with no response. Two follow-ups were sent.`,
          author: 'system',
          note_type: 'stage_change',
        })

        if (archiveNoteError) {
          console.error('[recruitment-followup] Archive note not written:', archiveNoteError.message)
        }

        closedOut.push({
          name: candidate.name,
          days: daysSinceSend,
          note: `moved to no response after ${daysSinceSend} days`,
        })
        results.auto_archived++
        continue
      }

      // 12+ days: follow-up #2
      if (daysSinceSend >= 12 && !candidate.outreach_follow_up_2_at) {
        const { error: fu2Error } = await supabase
          .from('creator_recruitment_candidates')
          .update({ outreach_follow_up_2_at: now.toISOString() })
          .eq('id', candidate.id)

        if (fu2Error) {
          console.error('[recruitment-followup] Follow up not stamped, it will be raised again tomorrow:', fu2Error.message)
          continue
        }

        const { error: fu2NoteError } = await supabase.from('creator_recruitment_notes').insert({
          candidate_id: candidate.id,
          content: `Follow-up #2 due (${daysSinceSend} days since outreach). No response yet. Consider a different approach or channel.`,
          author: 'system',
          note_type: 'follow_up',
        })

        if (fu2NoteError) console.error('[recruitment-followup] Note not written:', fu2NoteError.message)

        dueNow.push({
          name: candidate.name,
          days: daysSinceSend,
          note: `second follow up, ${daysSinceSend} days and no reply, try another angle`,
        })
        results.follow_up_2++
        continue
      }

      // 5+ days: follow-up #1
      if (daysSinceSend >= 5 && !candidate.outreach_follow_up_1_at) {
        const { error: fu1Error } = await supabase
          .from('creator_recruitment_candidates')
          .update({ outreach_follow_up_1_at: now.toISOString() })
          .eq('id', candidate.id)

        if (fu1Error) {
          console.error('[recruitment-followup] Follow up not stamped, it will be raised again tomorrow:', fu1Error.message)
          continue
        }

        const { error: fu1NoteError } = await supabase.from('creator_recruitment_notes').insert({
          candidate_id: candidate.id,
          content: `Follow-up #1 due (${daysSinceSend} days since outreach). No response yet.`,
          author: 'system',
          note_type: 'follow_up',
        })

        if (fu1NoteError) console.error('[recruitment-followup] Note not written:', fu1NoteError.message)

        dueNow.push({
          name: candidate.name,
          days: daysSinceSend,
          note: `first follow up, ${daysSinceSend} days since outreach`,
        })
        results.follow_up_1++
      }
    }

    // ─── Resurface revisit candidates ───
    const todayStr = now.toISOString().split('T')[0]
    const { data: revisitCandidates } = await supabase
      .from('creator_recruitment_candidates')
      .select('id, name, revisit_date, revisit_reason')
      .eq('stage', 'revisit')
      .lte('revisit_date', todayStr)

    for (const candidate of (revisitCandidates || [])) {
      const reason = candidate.revisit_reason || 'No reason recorded'

      // Move back to suggested
      const { error: revisitError } = await supabase
        .from('creator_recruitment_candidates')
        .update({ stage: 'suggested' })
        .eq('id', candidate.id)

      if (revisitError) {
        console.error('[recruitment-followup] Revisit candidate not moved back to suggested:', revisitError.message)
        continue
      }

      const { error: revisitNoteError } = await supabase.from('creator_recruitment_notes').insert({
        candidate_id: candidate.id,
        content: `Revisit date reached. Originally said: ${reason}. Consider re-engaging.`,
        author: 'system',
        note_type: 'stage_change',
      })

      if (revisitNoteError) console.error('[recruitment-followup] Revisit note not written:', revisitNoteError.message)

      // Slack notification (non-blocking)
      try {
        recruitmentRevisitDue(candidate.name, reason).catch(() => {})
      } catch {}

      revisitItems.push({ name: candidate.name, days: 0, note: reason })
      results.revisits_resurfaced++
    }

    // One consolidated message. Nothing due means nothing sent.
    try {
      await recruitmentFollowUpDigest(dueNow, revisitItems, closedOut)
    } catch (err) {
      console.error('[recruitment-followup] Digest failed:', err)
    }

    console.log('[recruitment-followup] Results:', results)
    return NextResponse.json({ success: true, results })
  } catch (err) {
    console.error('[recruitment-followup] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
