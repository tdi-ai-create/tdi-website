import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

function isTDIAdmin(email: string) {
  return email.toLowerCase().endsWith('@teachersdeserveit.com')
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const email = request.headers.get('x-user-email')

    if (!email || !isTDIAdmin(email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const supabase = getServiceSupabase()

    // Fetch partnership
    const { data: partnership, error: pError } = await supabase
      .from('partnerships')
      .select('*')
      .eq('id', id)
      .single()

    if (pError || !partnership) {
      return NextResponse.json({ error: 'Partnership not found' }, { status: 404 })
    }

    // Fetch organization
    const { data: organization } = await supabase
      .from('organizations')
      .select('*')
      .eq('partnership_id', id)
      .single()

    // Fetch action items
    const { data: actionItems } = await supabase
      .from('action_items')
      .select('*')
      .eq('partnership_id', id)
      .order('sort_order')

    return NextResponse.json({
      success: true,
      partnership,
      organization: organization || null,
      items: actionItems || [],
    })
  } catch (error) {
    console.error('Error fetching partnership:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
