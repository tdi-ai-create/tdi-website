import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const q = request.nextUrl.searchParams.get('q') || ''
  if (q.length < 2) return NextResponse.json({ quotes: [] })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data } = await supabase
    .from('quotes')
    .select('id, title, status, contract_type, signed_at, contact_name, contact_email')
    .ilike('title', `%${q}%`)
    .order('created_at', { ascending: false })
    .limit(10)

  return NextResponse.json({ quotes: data || [] })
}
