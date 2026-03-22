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

// POST - Log a payment event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = getSupabaseAdmin()
    const body = await request.json()

    const {
      event_type,
      event_date,
      summary,
      artifact_url,
    } = body

    if (!event_type) {
      return NextResponse.json(
        { error: 'event_type is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('payment_events')
      .insert({
        invoice_id: id,
        event_type,
        event_date: event_date || new Date().toISOString().split('T')[0],
        summary: summary?.trim() || null,
        artifact_url: artifact_url?.trim() || null,
      })
      .select()
      .single()

    if (error) {
      console.error('[Invoices API] Event insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update last_contacted_at in collections_workflow
    await supabase
      .from('collections_workflow')
      .update({ last_contacted_at: new Date().toISOString() })
      .eq('invoice_id', id)

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[Invoices API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
