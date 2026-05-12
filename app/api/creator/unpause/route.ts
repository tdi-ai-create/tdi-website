import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { creatorId, email, resume_or_fresh, content_path, projected_completion_date } = await request.json()
    if (!creatorId || !email) {
      return NextResponse.json({ error: 'Missing creatorId or email' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const updates: Record<string, any> = {
      lifecycle_state: 'active',
      unpaused_at: new Date().toISOString(),
      unpause_token: null,
      updated_at: new Date().toISOString(),
    }

    if (resume_or_fresh === 'fresh' && content_path) {
      updates.content_path = content_path
    }
    if (projected_completion_date) {
      updates.projected_completion_date = projected_completion_date
      updates.projected_date_set_at = new Date().toISOString()
      updates.projected_date_set_by = `creator:${email}`
    }

    const { error: updateError } = await (supabase.from('creators') as any)
      .update(updates)
      .eq('id', creatorId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    await (supabase.from('creator_pause_history') as any).insert({
      creator_id: creatorId,
      event_type: 'unpaused',
      triggered_by: `creator:${email}`,
      triggered_by_type: 'creator',
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
