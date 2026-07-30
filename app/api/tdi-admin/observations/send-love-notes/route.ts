import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { getServiceSupabase } from '@/lib/supabase'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  try {
    const { visitId, noteIds } = await request.json()

    if (!visitId) {
      return NextResponse.json({ error: 'visitId is required' }, { status: 400 })
    }

    const supabase = getServiceSupabase()
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Fetch visit for date
    const { data: visit } = await supabase
      .from('observation_visits')
      .select('visit_date')
      .eq('id', visitId)
      .single()

    if (!visit) {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 })
    }

    // Fetch notes to send
    let query = supabase
      .from('observation_notes')
      .select('*')
      .eq('visit_id', visitId)
      .is('email_sent_at', null)

    if (noteIds && noteIds.length > 0) {
      query = query.in('id', noteIds)
    }

    const { data: notes, error: notesError } = await query

    if (notesError || !notes) {
      return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
    }

    const visitDateFormatted = new Date(visit.visit_date + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })

    let sent = 0
    let failed = 0

    for (const note of notes) {
      const loveNoteText = note.love_note_final || note.love_note_draft
      const email = note.matched_email

      if (!loveNoteText || !email) {
        failed++
        continue
      }

      // Extract first name from educator_name
      const firstName = note.educator_name?.split(' ')[0] || 'there'

      // Convert line breaks to paragraphs
      const formattedNote = loveNoteText
        .split('\n')
        .filter((line: string) => line.trim())
        .map((line: string) => `<p style="margin: 0 0 12px; line-height: 1.6;">${line}</p>`)
        .join('')

      const html = `<div style="font-family: 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #374151;">
  <div style="border-left: 4px solid #E8B84B; padding-left: 16px; margin-bottom: 24px;">
    <h1 style="font-size: 22px; color: #1e2749; margin: 0 0 4px;">A note from your visit</h1>
    <p style="font-size: 14px; color: #6B7280; margin: 0;">${visitDateFormatted}</p>
  </div>

  <p style="margin: 0 0 12px; line-height: 1.6;">Hi ${firstName},</p>

  ${formattedNote}

  <p style="margin-top: 24px; color: #6B7280; font-size: 13px;">
    Rae Hughart<br/>
    Founder, Teachers Deserve It
  </p>
</div>`

      try {
        await resend.emails.send({
          from: 'Rae from Teachers Deserve It <hello@teachersdeserveit.com>',
          to: email,
          subject: 'A note from your visit',
          html,
        })

        await supabase
          .from('observation_notes')
          .update({ email_sent_at: new Date().toISOString() })
          .eq('id', note.id)

        sent++
      } catch (emailError) {
        console.error('[Observations] Email send failed for', email, emailError)
        failed++
      }
    }

    // Update visit status if all notes sent
    if (sent > 0) {
      const { data: remaining } = await supabase
        .from('observation_notes')
        .select('id')
        .eq('visit_id', visitId)
        .is('email_sent_at', null)

      if (!remaining || remaining.length === 0) {
        await supabase
          .from('observation_visits')
          .update({ status: 'sent' })
          .eq('id', visitId)
      } else {
        await supabase
          .from('observation_visits')
          .update({ status: 'reviewed' })
          .eq('id', visitId)
      }
    }

    return NextResponse.json({ success: true, sent, failed })
  } catch (error) {
    console.error('[Observations] Send error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
