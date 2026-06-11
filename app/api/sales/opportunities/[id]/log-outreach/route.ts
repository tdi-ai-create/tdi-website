import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

/**
 * Log Outreach API -- Agents call this after sending an email or completing outreach
 * Creates a note on the opportunity and updates last_activity_at.
 * This closes the loop: agent outreach shows up in the pipeline.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getServiceSupabase()

  const body = await req.json()
  const {
    type = 'email',        // 'email' | 'call' | 'meeting' | 'outreach'
    subject = '',          // Email subject or meeting title
    summary = '',          // Brief summary of what was sent/discussed
    sent_to = '',          // Recipient email
    sent_by = 'hello@teachersdeserveit.com',
    agent_name = 'system', // Which Paperclip agent performed this
  } = body

  if (!summary) {
    return NextResponse.json({ error: 'summary is required' }, { status: 400 })
  }

  // Verify opportunity exists
  const { data: opp, error: fetchErr } = await supabase
    .from('sales_opportunities')
    .select('id, name')
    .eq('id', id)
    .single()

  if (fetchErr || !opp) {
    return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
  }

  // Create the note
  const noteBody = [
    subject ? `Subject: ${subject}` : null,
    summary,
    sent_to ? `Sent to: ${sent_to}` : null,
    `Via: ${sent_by} (${agent_name})`,
  ].filter(Boolean).join('\n')

  const { error: noteErr } = await supabase
    .from('sales_opportunity_notes')
    .insert({
      opportunity_id: id,
      body: noteBody,
      created_at: new Date().toISOString(),
    })

  if (noteErr) {
    // Try the other notes table if this one doesn't exist
    await supabase
      .from('opportunity_notes')
      .insert({
        opportunity_id: id,
        author_email: sent_by,
        note_text: noteBody,
        note_type: type,
        created_at: new Date().toISOString(),
      })
  }

  // Update last_activity_at on the opportunity
  await supabase
    .from('sales_opportunities')
    .update({
      last_activity_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  return NextResponse.json({
    success: true,
    message: `Outreach logged on "${opp.name}"`,
    opportunity_id: id,
    note_type: type,
  })
}
