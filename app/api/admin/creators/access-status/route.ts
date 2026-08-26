import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { isTDIAdmin } from '@/lib/is-tdi-admin';

/**
 * GET /api/admin/creators/access-status
 *
 * Who can actually get into Creator Studio, and who never could.
 *
 * On 26 August 2026 thirteen of twenty active creators had never signed in, and
 * the cause was not a broken account or an unwelcoming screen. Every one of the
 * seven who had signed in was sent a link. Not one of the thirteen ever was.
 * Nothing in the product surfaced that, which is why it ran for three months.
 *
 * This is the check that would have caught it, so it stays after the backlog is
 * cleared. It should read all-clear most of the time and go loud when it does not.
 */

type Blocker = 'no_account' | 'never_invited' | 'invited_not_arrived' | null;

export async function GET(request: NextRequest) {
  const adminEmail = request.headers.get('x-user-email');
  if (!adminEmail || !(await isTDIAdmin(adminEmail))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const supabase = getServiceSupabase();

  const { data: creators, error: creatorError } = await supabase
    .from('creators')
    .select('id, name, email, content_path, status, lifecycle_state, created_at')
    .eq('status', 'active')
    .order('name');

  if (creatorError) {
    return NextResponse.json({ error: creatorError.message }, { status: 500 });
  }

  // auth.users is not reachable through PostgREST, so it comes from the admin
  // API. Forty creators fits comfortably inside one page.
  const authByEmail = new Map<string, { last_sign_in_at: string | null; recovery_sent_at: string | null; created_at: string }>();
  let page = 1;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) {
      return NextResponse.json({ error: `Could not read accounts: ${error.message}` }, { status: 500 });
    }
    for (const u of data.users) {
      if (u.email) {
        authByEmail.set(u.email.toLowerCase(), {
          last_sign_in_at: u.last_sign_in_at ?? null,
          recovery_sent_at: (u as { recovery_sent_at?: string | null }).recovery_sent_at ?? null,
          created_at: u.created_at,
        });
      }
    }
    if (data.users.length < 1000) break;
    page += 1;
  }

  // Invites we sent ourselves, which is a truer signal than recovery_sent_at
  // because it records the email a person actually clicked send on.
  const { data: invites } = await supabase
    .from('creator_email_log')
    .select('creator_id, sent_at')
    .eq('category', 'invite')
    .eq('dry_run', false)
    .order('sent_at', { ascending: false });

  const lastInvite = new Map<string, string>();
  for (const row of invites || []) {
    if (row.creator_id && !lastInvite.has(row.creator_id)) lastInvite.set(row.creator_id, row.sent_at);
  }

  const rows = (creators || []).map((c) => {
    const auth = c.email ? authByEmail.get(c.email.toLowerCase()) : undefined;
    const signedIn = Boolean(auth?.last_sign_in_at);
    const everSentSomething = Boolean(auth?.recovery_sent_at) || lastInvite.has(c.id);

    let blocker: Blocker = null;
    if (!auth) blocker = 'no_account';
    else if (!signedIn && !everSentSomething) blocker = 'never_invited';
    else if (!signedIn) blocker = 'invited_not_arrived';

    return {
      id: c.id,
      name: (c.name || '').trim(),
      email: c.email,
      contentPath: c.content_path,
      paused: (c.lifecycle_state ?? 'active') === 'paused',
      hasAccount: Boolean(auth),
      accountMade: auth?.created_at ?? null,
      lastSignIn: auth?.last_sign_in_at ?? null,
      lastInviteSent: lastInvite.get(c.id) ?? null,
      blocker,
    };
  });

  const lockedOut = rows.filter((r) => r.blocker !== null);

  return NextResponse.json({
    total: rows.length,
    signedIn: rows.filter((r) => r.blocker === null).length,
    lockedOut: lockedOut.length,
    byBlocker: {
      no_account: rows.filter((r) => r.blocker === 'no_account').length,
      never_invited: rows.filter((r) => r.blocker === 'never_invited').length,
      invited_not_arrived: rows.filter((r) => r.blocker === 'invited_not_arrived').length,
    },
    creators: rows,
  });
}
