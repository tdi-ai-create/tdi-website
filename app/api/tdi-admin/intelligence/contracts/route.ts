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

// POST - Create a new contract
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const body = await request.json()

    const {
      district_id,
      contract_name,
      start_date,
      end_date,
      total_value,
      renewal_deadline_date,
      signed_doc_url,
      status,
      payment_terms,
      payment_schedule,
      notes,
      scope_json,
    } = body

    if (!district_id || !contract_name) {
      return NextResponse.json(
        { error: 'district_id and contract_name are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('intelligence_contracts')
      .insert({
        district_id,
        contract_name: contract_name.trim(),
        start_date: start_date || null,
        end_date: end_date || null,
        total_value: total_value ? parseFloat(total_value) : null,
        renewal_deadline_date: renewal_deadline_date || null,
        signed_doc_url: signed_doc_url?.trim() || null,
        status: status || 'active',
        payment_terms: payment_terms || null,
        payment_schedule: payment_schedule || null,
        notes: notes?.trim() || null,
        scope_json: scope_json || {},
      })
      .select()
      .single()

    if (error) {
      console.error('[Contracts API] Insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[Contracts API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
