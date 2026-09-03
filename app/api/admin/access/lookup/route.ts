import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServiceSupabase } from '@/lib/supabase';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
import { diagnose, isAccountLevel, type AccessFacts, type Surface } from '@/lib/access-diagnosis';

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
 * Find one auth user by email, and establish whether the account can actually
 * authenticate.
 *
 * The identities array is the signal, because an account with no identity row
 * can never sign in no matter what the person tries. That is the shape the
 * fifteen SQL-created accounts were in.
 *
 * It has to come from getUserById. listUsers returns identities as null for
 * every user without exception, measured across all 98 accounts, so inferring
 * anything from it there marks healthy accounts as broken. The first version of
 * this did exactly that and reported every account as needing repair, including
 * one belonging to somebody who had signed in the day before.
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

      const { data: full } = await client.auth.admin.getUserById(hit.id);
      const identities = full?.user?.identities;

      // Only claim malformed when we positively know there are no identities.
      // An unreadable answer means we do not know, and saying "broken" on a
      // guess sends someone to repair an account that works. Having signed in
      // is proof on its own that the row is fine.
      const malformed =
        !hit.last_sign_in_at && Array.isArray(identities) && identities.length === 0;

      return {
        id: hit.id,
        lastSignInAt: hit.last_sign_in_at ?? null,
        recoverySentAt: u.recovery_sent_at ?? null,
        invitedAt: u.invited_at ?? null,
        emailConfirmedAt: hit.email_confirmed_at ?? null,
        malformed,
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

  // One account problem is one problem, however many products it stops them
  // reaching. Account level findings are lifted out and reported once; what
  // stays on a surface is genuinely specific to it.
  const seenAccountLevel = new Set<string>();
  const accountFindings: ReturnType<typeof diagnose> = [];
  for (const s of surfaces) {
    for (const f of s.findings) {
      if (isAccountLevel(f.blocker) && !seenAccountLevel.has(f.blocker)) {
        seenAccountLevel.add(f.blocker);
        accountFindings.push(f);
      }
    }
    s.findings = s.findings.filter(f => !isAccountLevel(f.blocker));
  }

  return NextResponse.json({
    email,
    accountFindings,
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
