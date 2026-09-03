import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServiceSupabase } from '@/lib/supabase';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
import type { RemedyAction, Surface } from '@/lib/access-diagnosis';

/**
 * POST /api/admin/access/resolve
 *
 * The fix, taken by the person who found the problem.
 *
 * Every one of these was previously a message to Rae and a wait. Bella can now
 * do all of them, because none of them require judgement she does not have and
 * every one is reversible or repeatable.
 *
 * Nothing here is destructive. Reactivating restores a record, repairing fills
 * in missing columns, and a sign in link can be sent as many times as needed.
 */

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.teachersdeserveit.com').replace(/\/$/, '');

const VALID: RemedyAction[] = ['create_account', 'repair_auth', 'send_link', 'reactivate', 'create_profile'];

function hubAdmin() {
  const url = process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

function redirectFor(surface: Surface) {
  return surface === 'hub' ? `${SITE_URL}/hub` : `${SITE_URL}/creator-portal/dashboard`;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const actor = auth.member?.email || auth.user?.email || 'unknown';
  const body = await request.json();
  const email = String(body.email || '').trim().toLowerCase();
  const action = body.action as RemedyAction;
  const surface: Surface = body.surface === 'hub' ? 'hub' : 'creator_studio';

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'An email address is required.' }, { status: 400 });
  }
  if (!VALID.includes(action)) {
    return NextResponse.json(
      { error: `Unknown action. Expected one of: ${VALID.join(', ')}` },
      { status: 400 },
    );
  }

  // Dry run computes the whole decision and reports what it would do, without
  // creating an account, writing a status, or generating a link. Built into the
  // route rather than a separate script, so it exercises this exact code path.
  const dryRun = body.dryRun === true || request.nextUrl.searchParams.get('dryRun') === '1';

  const supabase = getServiceSupabase();

  // ---- reactivate -------------------------------------------------------
  if (action === 'reactivate') {
    if (dryRun) {
      const { data: who } = await supabase
        .from('creators').select('id, name, status').ilike('email', email).maybeSingle();
      return NextResponse.json({
        ok: true, dryRun: true,
        would: who
          ? `Set ${who.name || email} from "${who.status}" to active, restart their agreement clock, and write a note.`
          : `Nothing to do. No creator with that address.`,
        wroteAnything: false,
      });
    }
    const { data, error } = await supabase
      .from('creators')
      .update({
        status: 'active',
        lifecycle_state: 'active',
        is_active: true,
        // Restart the agreement clock too. Reactivating someone and then
        // closing them again days later, counted from an application they
        // already restarted, is exactly what happened to Rebecca Blahus.
        restarted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .ilike('email', email)
      .select('id, name')
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'No creator with that address.' }, { status: 404 });

    const { error: noteError } = await supabase.from('creator_notes').insert({
      creator_id: data.id,
      content: `Reactivated by ${actor} from the access tool. The agreement clock was restarted at the same time.`,
      author: 'System',
      visible_to_creator: false,
      phase_id: 'onboarding',
    });
    if (noteError) console.error('[access/resolve] reactivate note NOT written:', noteError.message);

    return NextResponse.json({
      ok: true,
      did: `${data.name || email} is active again, and their agreement clock now runs from today.`,
    });
  }

  // ---- create the Hub profile ------------------------------------------
  if (action === 'create_profile') {
    if (dryRun) {
      return NextResponse.json({
        ok: true, dryRun: true,
        would: `Create a hub_profiles row for ${email}, pointed at their sign in account.`,
        wroteAnything: false,
      });
    }
    const hub = hubAdmin();
    if (!hub) {
      return NextResponse.json({ error: 'The Hub is not reachable from this server.' }, { status: 503 });
    }
    const { data: authUser } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const found = authUser?.users.find(u => (u.email || '').toLowerCase() === email);
    if (!found) {
      return NextResponse.json(
        { error: 'They need a sign in account before a Hub profile can point at one.' },
        { status: 400 },
      );
    }
    const { error } = await hub.from('hub_profiles').insert({ id: found.id, email });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, did: `Created a Hub profile for ${email}.` });
  }

  // ---- create the account ----------------------------------------------
  if (action === 'create_account') {
    if (dryRun) {
      return NextResponse.json({
        ok: true, dryRun: true,
        would: `Create a sign in account for ${email} through the admin API, then generate a link to ${redirectFor(surface)}.`,
        wroteAnything: false,
      });
    }
    // Never with SQL. Accounts inserted directly end up with NULL instance_id,
    // aud and token columns, and every sign in method fails for all of them.
    // Fifteen accounts were in that state in August.
    const { error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    // Fall through to sending them a link, since an account nobody is told
    // about is the most common failure of all.
  }

  // ---- repair a malformed account ---------------------------------------
  if (action === 'repair_auth') {
    if (dryRun) {
      const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const found = list?.users.find(u => (u.email || '').toLowerCase() === email);
      return NextResponse.json({
        ok: true, dryRun: true,
        would: found
          ? `Rewrite the account for ${email} through the admin API, then generate a fresh link.`
          : `Nothing to do. There is no account with that address to repair.`,
        wroteAnything: false,
      });
    }
    const { data: list, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });
    const found = list.users.find(u => (u.email || '').toLowerCase() === email);
    if (!found) {
      return NextResponse.json({ error: 'There is no account with that address to repair.' }, { status: 404 });
    }
    // Going through the admin API rather than SQL is the repair. It rewrites
    // the row properly, which a direct UPDATE does not.
    const { error } = await supabase.auth.admin.updateUserById(found.id, { email_confirm: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    // Then send them a link, below.
  }

  // ---- send the link -----------------------------------------------------
  if (dryRun) {
    return NextResponse.json({
      ok: true, dryRun: true,
      would: `Generate a magic link for ${email} pointing at ${redirectFor(surface)}. Nothing is emailed either way: the link is handed back for a person to send.`,
      wroteAnything: false,
    });
  }

  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: redirectFor(surface) },
  });

  if (linkError || !linkData?.properties?.action_link) {
    return NextResponse.json(
      { error: `Could not create a sign in link: ${linkError?.message || 'no link returned'}` },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    did:
      action === 'create_account'
        ? `Created an account for ${email} and generated their sign in link.`
        : action === 'repair_auth'
          ? `Repaired the account for ${email} and generated a fresh sign in link.`
          : `Generated a sign in link for ${email}.`,
    // Returned rather than sent. Sending is a separate, deliberate press.
    signInUrl: linkData.properties.action_link,
    surface,
  });
}
