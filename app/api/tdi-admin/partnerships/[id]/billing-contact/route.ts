import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { resolveBillingContact, billingContactUrl } from '@/lib/billing-contact'
import { billingContactChanged } from '@/lib/billing-slack'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Written as one literal on purpose. Building this string by concatenation
// defeats the Supabase client's type inference and every field below silently
// becomes `unknown`.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const supabase = getServiceSupabase()

  const { data, error } = await supabase
    .from('partnerships')
    .select('id, org_name, contact_name, contact_email, primary_contact_name, primary_contact_email, billing_contact_name, billing_contact_email, billing_contact_title, billing_contact_source, billing_contact_updated_at, billing_token')
    .eq('id', id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Partnership not found' }, { status: 404 })

  const billing = resolveBillingContact(data)

  return NextResponse.json({
    billing: {
      name: billing.name,
      email: billing.email,
      title: billing.title,
      // true means we are still guessing, using whoever signed the contract
      isFallback: billing.isFallback,
      source: billing.source,
      updatedAt: data.billing_contact_updated_at,
    },
    relationship: {
      name: data.primary_contact_name || data.contact_name,
      email: data.primary_contact_email || data.contact_email,
    },
    shareUrl: data.billing_token ? billingContactUrl(data.billing_token) : null,
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const supabase = getServiceSupabase()

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Could not read that request.' }, { status: 400 })

  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 200) : ''
  const title = typeof body.title === 'string' ? body.title.trim().slice(0, 120) : ''

  if (!name) return NextResponse.json({ error: 'Please add a name.' }, { status: 400 })
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'That email does not look right.' }, { status: 400 })

  const { data: before } = await supabase
    .from('partnerships')
    .select('id, org_name, contact_name, contact_email, primary_contact_name, primary_contact_email, billing_contact_name, billing_contact_email, billing_contact_title, billing_contact_source, billing_contact_updated_at, billing_token')
    .eq('id', id)
    .maybeSingle()

  if (!before) return NextResponse.json({ error: 'Partnership not found' }, { status: 404 })

  const previous = resolveBillingContact(before)

  const { error } = await supabase
    .from('partnerships')
    .update({
      billing_contact_name: name,
      billing_contact_email: email,
      billing_contact_title: title || null,
      billing_contact_source: 'tdi',
      billing_contact_updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('[billing-contact admin] Update failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  billingContactChanged(
    before.org_name || 'a partner school',
    { name: previous.name, email: previous.email },
    { name, email },
    'tdi'
  ).catch(() => {})

  return NextResponse.json({ success: true, name, email, title: title || null })
}
