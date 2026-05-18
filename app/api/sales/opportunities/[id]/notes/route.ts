import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

const VALID_TYPES = new Set(['call', 'email', 'meeting', 'demo', 'update', 'system'])

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = getServiceSupabase()
  const body = await req.json()
  const {
    note_text,
    note_type = 'update',
    author_email = 'system@teachersdeserveit.com',
  } = body

  if (!note_text?.trim()) {
    return NextResponse.json({ error: 'note_text is required' }, { status: 400 })
  }

  const safeType = VALID_TYPES.has(note_type) ? note_type : 'update'

  const { data, error } = await supabase
    .from('opportunity_notes')
    .insert({
      opportunity_id: id,
      author_email,
      note_text: note_text.trim(),
      note_type: safeType,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update last_activity_at on the opportunity
  await supabase
    .from('sales_opportunities')
    .update({ last_activity_at: new Date().toISOString() })
    .eq('id', id)
    .then(() => {})

  // Log activity
  await supabase.from('opportunity_activity').insert({
    opportunity_id: id,
    actor_email: author_email,
    activity_type: 'note_added',
    description: `Note added (${safeType})`,
  }).then(() => {})

  return NextResponse.json(data, { status: 201 })
}
