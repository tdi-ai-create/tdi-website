import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET() {
  const supabase = db()
  const { data } = await supabase.from('funding_notification_settings').select('*').limit(1).single()
  return NextResponse.json({ settings: data || null })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const body = await request.json()
  const supabase = db()

  const fields: Record<string, unknown> = { updated_at: new Date().toISOString() }
  const allowed = ['slack_enabled', 'slack_webhook_url', 'slack_channel', 'verbosity', 'bella_slack_handle', 'rae_slack_handle']
  for (const f of allowed) {
    if (body[f] !== undefined) fields[f] = body[f]
  }

  // Get the existing row id
  const { data: existing } = await supabase.from('funding_notification_settings').select('id').limit(1).single()
  if (!existing) return NextResponse.json({ error: 'No settings row' }, { status: 500 })

  const { error } = await supabase.from('funding_notification_settings').update(fields).eq('id', existing.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
