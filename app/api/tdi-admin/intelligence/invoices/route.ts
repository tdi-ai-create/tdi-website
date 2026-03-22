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

// GET - List all invoices with summary totals
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const district_id = searchParams.get('district_id')

    // Build query for invoices with related data
    let query = supabase
      .from('intelligence_invoices')
      .select(`
        *,
        districts (id, name, state),
        intelligence_contracts (id, contract_name),
        collections_workflow (*)
      `)
      .order('invoice_date', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }
    if (district_id) {
      query = query.eq('district_id', district_id)
    }

    const { data: invoices, error: invoicesError } = await query

    if (invoicesError) {
      console.error('[Invoices API] Fetch error:', invoicesError)
      return NextResponse.json({ error: invoicesError.message }, { status: 500 })
    }

    // Calculate summary totals
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    let totalOutstanding = 0
    let totalOverdue = 0
    let dueThisMonth = 0
    let paidYTD = 0

    for (const inv of invoices || []) {
      const amount = parseFloat(inv.amount) || 0
      const dueDate = inv.due_date ? new Date(inv.due_date) : null
      const invoiceDate = inv.invoice_date ? new Date(inv.invoice_date) : null

      if (inv.status === 'paid') {
        // Check if paid this year
        if (invoiceDate && invoiceDate >= startOfYear) {
          paidYTD += amount
        }
      } else if (!['void', 'draft'].includes(inv.status)) {
        // Outstanding invoice
        totalOutstanding += amount

        // Check if overdue
        if (dueDate && dueDate < now) {
          totalOverdue += amount
        }

        // Check if due this month
        if (dueDate && dueDate >= startOfMonth && dueDate <= endOfMonth) {
          dueThisMonth += amount
        }
      }
    }

    return NextResponse.json({
      invoices: invoices || [],
      summary: {
        totalOutstanding,
        totalOverdue,
        dueThisMonth,
        paidYTD,
      }
    })
  } catch (error) {
    console.error('[Invoices API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new invoice
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const body = await request.json()

    const {
      district_id,
      contract_id,
      invoice_number,
      invoice_date,
      due_date,
      amount,
      service_start_date,
      service_end_date,
      status,
      notes,
      ap_requirements_json,
    } = body

    if (!district_id || !invoice_number) {
      return NextResponse.json(
        { error: 'district_id and invoice_number are required' },
        { status: 400 }
      )
    }

    // Create the invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('intelligence_invoices')
      .insert({
        district_id,
        contract_id: contract_id || null,
        invoice_number: invoice_number.trim(),
        invoice_date: invoice_date || null,
        due_date: due_date || null,
        amount: amount ? parseFloat(amount) : null,
        service_start_date: service_start_date || null,
        service_end_date: service_end_date || null,
        status: status || 'draft',
        notes: notes?.trim() || null,
        ap_requirements_json: ap_requirements_json || {},
      })
      .select()
      .single()

    if (invoiceError) {
      console.error('[Invoices API] Insert error:', invoiceError)
      return NextResponse.json({ error: invoiceError.message }, { status: 500 })
    }

    // Auto-create collections_workflow record
    const { error: workflowError } = await supabase
      .from('collections_workflow')
      .insert({
        invoice_id: invoice.id,
        current_stage: 'submitted',
        risk_flag: 'none',
      })

    if (workflowError) {
      console.error('[Invoices API] Collections workflow error:', workflowError)
      // Don't fail the request, just log the error
    }

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('[Invoices API] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
