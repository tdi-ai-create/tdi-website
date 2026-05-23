import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: pursuit, error: pErr } = await (supabase
      .from('funding_pursuits') as any)
      .select('*')
      .eq('id', id)
      .single()

    if (pErr) throw pErr

    const { data: timeline } = await (supabase
      .from('funding_pursuit_timeline') as any)
      .select('*')
      .eq('pursuit_id', id)
      .order('display_order')

    const { data: touchpoints } = await (supabase
      .from('funding_pursuit_touchpoints_v1') as any)
      .select('*')
      .eq('pursuit_id', id)
      .order('display_order')

    return NextResponse.json({
      pursuit,
      timeline: timeline || [],
      touchpoints: touchpoints || [],
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
