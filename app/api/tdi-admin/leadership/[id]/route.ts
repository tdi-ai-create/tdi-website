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

    // The leader's most recent visit. partnerships has no last_principal_login
    // column, which the detail page was reading, so every school displayed
    // "Last Login Never". activity_log is where visits are actually recorded.
    const { data: loginEvents, error: loginError } = await supabase
      .from('activity_log')
      .select('created_at')
      .eq('partnership_id', id)
      .in('action', ['login', 'dashboard_viewed'])
      .order('created_at', { ascending: false })
      .limit(1)

    if (loginError) {
      console.error('[leadership/[id]] login lookup failed:', loginError.message)
    }

    const lastLeaderLogin = loginEvents?.[0]?.created_at ?? null

    // partnerships.org_name is the real column and select('*') already returned
    // it. This overwrote it with the organizations lookup, and only 7 of the 9
    // active partnerships have an organizations row, so two schools had their
    // name replaced with null and the page fell back to the word "School".
    const enrichedPartnership = {
      ...partnership,
      org_name: partnership.org_name || organization?.name || null,
      last_leader_login: lastLeaderLogin,
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
