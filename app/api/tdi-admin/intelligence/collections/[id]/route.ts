import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase credentials')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// PATCH - Update collections workflow
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getSupabaseAdmin()
    const body = await request.json()

    const updateData: Record<string, unknown> = {}
    const allowedFields = [
      'current_stage', 'risk_flag', 'board_meeting_date',
      'check_issue_date', 'expected_payment_date',
      'next_follow_up_at', 'escalation_owner_user_id',
      'escalation_path_json'
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (typeof body[field] === 'string' && !['current_stage', 'risk_flag'].includes(field)) {
          updateData[field] = body[field].trim() || null
        } else {
          updateData[field] = body[field]
        }
      }
    }

    // Always update last_contacted_at when workflow is updated
    updateData.last_contacted_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('collections_workflow')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Collections API] Update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[Collections API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
