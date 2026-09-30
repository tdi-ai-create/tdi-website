import { isTDIAdmin } from '@/lib/tdi-admin/auth-check'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
import { getServiceSupabase } from '@/lib/supabase'
import { getSchoolSignIns } from '@/lib/partners/signed-in'
import { getHubEngagement, hubActivePct } from '@/lib/partners/hub-engagement'
import { getHubServiceClient } from '@/lib/hub/partnership-members'

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

    // Who has signed in, from the one definition the leadership list page
    // already uses: auth.users.last_sign_in_at across every linked user.
    //
    // This read activity_log actions login and dashboard_viewed, whose writes
    // were unchecked until 29 Aug and which therefore has holes. That is why
    // this page and the warning printed under it disagreed: Saunemin showed
    // "Last Login 0d" from an activity_log row while the nightly flag, which
    // counts dashboard_views instead, still said the principal had never
    // signed in. Two tables, one question, opposite answers.
    const signIns = await getSchoolSignIns(supabase, [id])
    const signIn = signIns.get(id)
    const lastLeaderLogin = signIn?.lastSignInAt ?? null

    // And how much of the team is using the Hub, on the same definition as the
    // list page: live all_access seats with at least one genuine engagement
    // action. The header used to show sign ins in the current calendar month
    // over provisioned seats, a different question on a different window.
    const engagement = await getHubEngagement(supabase, getHubServiceClient(), [id])
    const hubEngagement = engagement.get(id)

    // partnerships.org_name is the real column and select('*') already returned
    // it. This overwrote it with the organizations lookup, and only 7 of the 9
    // active partnerships have an organizations row, so two schools had their
    // name replaced with null and the page fell back to the word "School".
    const enrichedPartnership = {
      ...partnership,
      org_name: partnership.org_name || organization?.name || null,
      last_leader_login: lastLeaderLogin,
      // Never signed in and "we could not tell" are different states and the
      // page must not flatten them into a red "Never".
      leader_never_signed_in: signIn ? signIn.neverSignedIn : null,
      sign_in_unknown: signIn?.unknown ?? true,
      hub_seats: hubEngagement?.seats ?? null,
      hub_active_educators: hubEngagement?.active ?? null,
      hub_active_pct: hubActivePct(hubEngagement),
      hub_engagement_unknown: hubEngagement?.unknown ?? true,
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
