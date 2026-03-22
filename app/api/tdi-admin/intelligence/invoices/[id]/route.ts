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

// GET - Get a single invoice with all related data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('intelligence_invoices')
      .select(`
        *,
        districts (id, name, state, district_contacts (*)),
        intelligence_contracts (id, contract_name, scope_json, payment_terms),
        collections_workflow (*),
        payment_events (*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('[Invoices API] Fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[Invoices API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update an invoice
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
      'contract_id', 'invoice_number', 'invoice_date', 'due_date',
      'amount', 'service_start_date', 'service_end_date', 'status',
      'notes', 'ap_requirements_json'
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'amount' && body[field]) {
          updateData[field] = parseFloat(body[field])
        } else if (typeof body[field] === 'string') {
          updateData[field] = body[field].trim() || null
        } else {
          updateData[field] = body[field]
        }
      }
    }

    const { data, error } = await supabase
      .from('intelligence_invoices')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Invoices API] Update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[Invoices API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
