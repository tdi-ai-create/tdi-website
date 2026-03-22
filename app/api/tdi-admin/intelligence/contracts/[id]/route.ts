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

// PATCH - Update a contract
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
      'contract_name', 'start_date', 'end_date', 'total_value',
      'renewal_deadline_date', 'signed_doc_url', 'status',
      'payment_terms', 'payment_schedule', 'notes', 'scope_json'
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'total_value' && body[field]) {
          updateData[field] = parseFloat(body[field])
        } else if (typeof body[field] === 'string') {
          updateData[field] = body[field].trim() || null
        } else {
          updateData[field] = body[field]
        }
      }
    }

    const { data, error } = await supabase
      .from('intelligence_contracts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Contracts API] Update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[Contracts API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a contract
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('intelligence_contracts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[Contracts API] Delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Contracts API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
