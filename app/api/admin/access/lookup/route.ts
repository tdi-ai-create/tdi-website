import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServiceSupabase } from '@/lib/supabase';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
import { diagnose, type AccessFacts, type Surface } from '@/lib/access-diagnosis';

/**
 * GET /api/admin/access/lookup?email=someone@school.org
 *
 * Everything about one person's ability to sign in, across Creator Studio and
 * the Learning Hub, in one answer.
 *
 * Both systems are asked, because "which system are they in" is usually the
 * question rather than the premise. Hillary was reported as a Creator Studio
 * problem and was in fact a partner contact who could not reach her school
 * dashboard.
 */

function hubAdmin() {
  const url = process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/**
 * Find one auth user by email without listing the whole table.
 *
 * The columns that break SQL-created accounts are not exposed by the admin API,
 * so malformed is inferred from what it does return: an account with no
 * identities can never authenticate.
 */
async function findAuthUser(
  client: ReturnType<typeof getServiceSupabase>,
  email: string,
) {
  const target = email.trim().toLowerCase();
  let page = 1;
  for (;;) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(error.message);
    const hit = data.users.find(u => (u.email || '').toLowerCase() === target);
    if (hit) {
      const u = hit as typeof hit & { recovery_sent_at?: string | null; invited_at?: string | null };
      return {
        id: hit.id,
        lastSignInAt: hit.last_sign_in_at ?? null,
        recoverySentAt: u.recovery_sent_at ?? null,
        invitedAt: u.invited_at ?? null,
        emailConfirmedAt: hit.email_confirmed_at ?? null,
        malformed: !Array.isArray(hit.identities) || hit.identities.length === 0,
      };
    }
    if (data.users.length < 1000) break;
    page += 1;
  }
  return null;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const email = (request.nextUrl.searchParams.get('email') || '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Enter an email address to look up.' }, { status: 400 });
  }

  const main = getServiceSupabase();

  let authUser: AccessFacts['auth'] = null;
  try {
    authUser = await findAuthUser(main, email);
  } catch (e) {
    return NextResponse.json(
      { error: `Could not read sign in accounts: ${e instanceof Error ? e.message : 'unknown'}` },
      { status: 500 },
    );
  }

  // Creator Studio
  const { data: creator, error: creatorError } = await main
    .from('creators')
    .select('id, name, email, status, lifecycle_state, content_path, created_at, restarted_at, agreement_signed')
    .ilike('email', email)
    .maybeSingle();
  if (creatorError) {
    return NextResponse.json({ error: creatorError.message }, { status: 500 });
  }

  // Learning Hub, a separate project. Read only, and never through the shared
  // client, because bundling the two is what made Quick Wins vanish in July.
  let hubProfile: { id: string; email: string | null; display_name: string | null } | null = null;
  let hubReadable = true;
  const hub = hubAdmin();
  if (!hub) {
    hubReadable = false;
  } else {
    const { data, error } = await hub
      .from('hub_profiles')
      .select('id, email, display_name')
      .ilike('email', email)
      .maybeSingle();
    if (error) hubReadable = false;
    else hubProfile = data;
  }

  const inactiveReason = (() => {
    if (!creator) return null;
    const s = String(creator.status || '').toLowerCase();
    if (['withdrawn', 'paused', 'inactive', 'closed'].includes(s)) return s;
    return null;
  })();

  const surfaces: Array<{ surface: Surface; present: boolean; findings: ReturnType<typeof diagnose> }> = [];

  if (creator) {
    const facts: AccessFacts = {
      email,
      surface: 'creator_studio',
      auth: authUser,
      record: { exists: true, inactiveReason },
    };
    surfaces.push({ surface: 'creator_studio', present: true, findings: diagnose(facts) });
  }

  if (hubProfile || (hubReadable && !creator)) {
    const facts: AccessFacts = {
      email,
      surface: 'hub',
      auth: authUser,
      record: { exists: !!hubProfile, inactiveReason: null },
    };
    surfaces.push({ surface: 'hub', present: !!hubProfile, findings: diagnose(facts) });
  }

  return NextResponse.json({
    email,
    account: authUser,
    creator: creator
      ? {
          id: creator.id,
          name: creator.name,
          status: creator.status,
          contentPath: creator.content_path,
          agreementSigned: creator.agreement_signed,
          joined: creator.created_at,
          restartedAt: creator.restarted_at,
        }
      : null,
    hub: hubProfile ? { id: hubProfile.id, displayName: hubProfile.display_name } : null,
    hubReadable,
    surfaces,
    foundAnywhere: !!(creator || hubProfile || authUser),
  });
}
