import { isTDIAdmin } from '@/lib/tdi-admin/auth-check'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
import { getServiceSupabase } from '@/lib/supabase'

// function isTDIAdmin(email: string) {
//   return email.toLowerCase().endsWith('@teachersdeserveit.com')
// }

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // An x-user-email header is a claim, not proof. Anyone could send it.
    // requireAdminAuth verifies the actual signed-in session.
    const auth = await requireAdminAuth();
    if (auth instanceof NextResponse) return auth;
    const email = auth.member.email;

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

    // Enrich partnership with org_name like the list API does
    const enrichedPartnership = {
      ...partnership,
      org_name: organization?.name || null,
    }

    return NextResponse.json({
      success: true,
      partnership: enrichedPartnership,
      organization: organization || null,
      items: actionItems || [],
    })
  } catch (error) {
    console.error('Error fetching partnership:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
