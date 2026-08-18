import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { isTDIAdmin } from '@/lib/is-tdi-admin';

/**
 * GET /api/admin/whoami
 *
 * Resolves admin status for the caller's own session. Client components used
 * to decide this themselves by testing whether the signed-in email ended in
 * @teachersdeserveit.com, which excluded team members on other domains.
 *
 * Takes no input, so it cannot be used to probe whether some other address
 * is an admin. It only ever reports on the session presenting the cookie.
 */
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ isAdmin: false, email: null });
    }

    return NextResponse.json({
      isAdmin: await isTDIAdmin(user.email),
      email: user.email,
    });
  } catch (error) {
    console.error('[whoami] failed:', error);
    return NextResponse.json({ isAdmin: false, email: null }, { status: 500 });
  }
}
