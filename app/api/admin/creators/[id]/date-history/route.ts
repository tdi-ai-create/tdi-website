import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data, error } = await (supabase
      .from('projected_date_history') as any)
      .select('*')
      .eq('creator_id', id)
      .order('changed_at', { ascending: false })

    if (error) {
      return NextResponse.json({ history: [], error: error.message }, { status: 200 })
    }

    return NextResponse.json({ history: data || [] })
  } catch {
    return NextResponse.json({ history: [] })
  }
}
