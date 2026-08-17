import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Creator portal: staff_members lives here
const portalSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Learning Hub: auth.users lives here, exposed via the hub_user_last_login view
const hubSupabase = createClient(
  process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

/**
 * GET /api/cron/sync-hub-login-dates
 *
 * staff_members.hub_login_date is read by the partner dashboard, seven crons, the
 * admin briefing and the KPI updater, but nothing has ever written it. Every one of
 * those surfaces has therefore reported "0 educators logged in" for every partnership
 * regardless of actual usage.
 *
 * This copies the real sign-in timestamp from the Hub's auth.users across to the
 * portal, matched on email.
 *
 * Pass ?dryRun=1 to see what would change without writing.
 */
export async function GET(request: NextRequest) {
  const dryRun = request.nextUrl.searchParams.get('dryRun') === '1';

  try {
    // 1. Every active roster member in the portal
    const { data: staff, error: staffError } = await portalSupabase
      .from('staff_members')
      .select('id, email, hub_login_date, partnership_id')
      .eq('is_active', true);

    if (staffError) {
      return NextResponse.json({ error: `staff_members read failed: ${staffError.message}` }, { status: 500 });
    }

    const roster = (staff || []).filter(s => s.email);
    if (roster.length === 0) {
      return NextResponse.json({ success: true, dryRun, scanned: 0, updated: 0, message: 'No active staff to sync.' });
    }

    // 2. Their Hub sign-in timestamps, in chunks so the IN list stays sane
    const emails = [...new Set(roster.map(s => s.email.toLowerCase().trim()))];
    const loginByEmail = new Map<string, string | null>();

    const CHUNK = 200;
    for (let i = 0; i < emails.length; i += CHUNK) {
      const batch = emails.slice(i, i + CHUNK);
      const { data: hubUsers, error: hubError } = await hubSupabase
        .from('hub_user_last_login')
        .select('email, last_sign_in_at')
        .in('email', batch);

      if (hubError) {
        // Surface rather than swallow. A silent failure here is how this column died.
        return NextResponse.json({ error: `hub_user_last_login read failed: ${hubError.message}` }, { status: 500 });
      }

      for (const u of hubUsers || []) {
        loginByEmail.set(u.email, u.last_sign_in_at);
      }
    }

    // 3. Only write rows whose value actually changes
    const changes: { id: string; email: string; from: string | null; to: string }[] = [];
    for (const s of roster) {
      const hubLogin = loginByEmail.get(s.email.toLowerCase().trim());
      if (!hubLogin) continue;

      const current = s.hub_login_date ? new Date(s.hub_login_date).getTime() : 0;
      const incoming = new Date(hubLogin).getTime();
      if (incoming > current) {
        changes.push({ id: s.id, email: s.email, from: s.hub_login_date, to: hubLogin });
      }
    }

    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        scanned: roster.length,
        matchedInHub: loginByEmail.size,
        wouldUpdate: changes.length,
        sample: changes.slice(0, 20),
      });
    }

    let updated = 0;
    let failed = 0;
    for (const c of changes) {
      const { error } = await portalSupabase
        .from('staff_members')
        .update({ hub_login_date: c.to, updated_at: new Date().toISOString() })
        .eq('id', c.id);

      if (error) failed++;
      else updated++;
    }

    return NextResponse.json({
      success: true,
      dryRun: false,
      scanned: roster.length,
      matchedInHub: loginByEmail.size,
      updated,
      failed,
      message: `Synced ${updated} hub_login_date value${updated === 1 ? '' : 's'} from the Hub.${failed > 0 ? ` ${failed} failed.` : ''}`,
    });
  } catch (error) {
    console.error('[sync-hub-login-dates]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
