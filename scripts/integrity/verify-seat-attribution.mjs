/**
 * Every paid Hub seat should trace back to a partnership somebody is managing.
 *
 * On 29 Aug 2026 thirty-six did not. Twenty at d94.org carried a partnership_id
 * naming a row that does not exist in the partnerships table. Fifteen at
 * morenci.org had neither an id nor a slug, and eight of those educators were
 * signed in and working, a better rate than any partnership we do track. One
 * more at St. Mary sat outside the slug that rescues the other ten.
 *
 * Nothing was watching, so nobody knew. Those thirty-six people appeared on no
 * leadership screen, in no report, and against no renewal conversation.
 *
 * The thirty-eight that exist today are recorded in a baseline, because a check
 * that can never pass is one people learn to skip. It fails on a new domain, or
 * on an existing one growing, which is what a newly broken link looks like. Fix
 * a school, drop its line from the baseline, and it can never come back quietly.
 *
 * Run:    node scripts/integrity/verify-seat-attribution.mjs
 * Update: node scripts/integrity/verify-seat-attribution.mjs --update-baseline
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const BASELINE = 'scripts/integrity/seat-attribution-baseline.json';
const UPDATING = process.argv.includes('--update-baseline');

for (const file of ['.env.local', '.env']) {
  try {
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    // Not present. The next file, or the real environment, may still have it.
  }
}

const HUB_URL = process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
const HUB_KEY = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;
const PORTAL_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PORTAL_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!HUB_URL || !HUB_KEY || !PORTAL_URL || !PORTAL_KEY) {
  console.error('This check needs service keys for both databases. Exiting non-zero rather than passing silently.');
  process.exit(1);
}

// createClient constructs a RealtimeClient eagerly, which throws on a Node
// without native WebSocket. That surfaced as a stack trace from inside
// supabase-js rather than anything a person could act on, so say what it is.
function client(url, key, label) {
  try {
    return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  } catch (err) {
    console.error(`Could not create the ${label} client: ${err.message}`);
    console.error(`Node ${process.version}. supabase-js needs native WebSocket, which arrived in Node 22.`);
    process.exit(1);
  }
}

const hub = client(HUB_URL, HUB_KEY, 'Learning Hub');
const portal = client(PORTAL_URL, PORTAL_KEY, 'partnerships');

const die = (label, error) => {
  if (!error) return;
  console.error(`${label} read failed: ${error.message}`);
  process.exit(1);
};

const { data: partnerships, error: pErr } = await portal
  .from('partnerships')
  .select('id, org_name, slug, status')
  .not('status', 'in', '("completed")');
die('partnerships', pErr);

const liveIds = new Set((partnerships ?? []).map((p) => String(p.id)));
const slugToId = new Map();
for (const p of partnerships ?? []) if (p.slug) slugToId.set(p.slug, String(p.id));

// Someone who bought their own membership has no partnership by design, so
// counting them as unattributed makes this fail on a new paying customer. It
// did, on 31 Aug, for one teacher at Unit 5 who subscribed through Stripe.
// An alarm that fires when somebody gives us money teaches everyone to ignore
// the alarm.
//
// Everything else stays in scope. Measured on 31 Aug: district_partner 250 of
// 250 attributed, partner_roster_update 16 of 16, admin_assigned 0 of 17,
// sales_deal 0 of 1. The signal lives in those three.
const SELF_SERVE_SOURCES = ['stripe'];

const { data: seats, error: sErr } = await hub
  .from('hub_memberships')
  .select('user_id, partnership_id, source')
  .eq('tier', 'all_access')
  .eq('status', 'active');
die('hub_memberships', sErr);

const selfServe = (seats ?? []).filter((s) => SELF_SERVE_SOURCES.includes(s.source)).length;
const districtSeats = (seats ?? []).filter((s) => !SELF_SERVE_SOURCES.includes(s.source));

const orphanIds = districtSeats.filter((s) => !liveIds.has(String(s.partnership_id))).map((s) => s.user_id);

if (orphanIds.length === 0) {
  console.log(
    `\nAll ${districtSeats.length} district all-access seats trace to a partnership` +
      `${selfServe ? `, and ${selfServe} self-serve seat(s) correctly have none` : ''}.\n`
  );
  process.exit(0);
}

const unique = [...new Set(orphanIds)];
const { data: profiles, error: prErr } = await hub
  .from('hub_profiles')
  .select('id, email, partnership_slug')
  .in('id', unique);
die('hub_profiles', prErr);

// A profile carrying a slug that matches a live partnership is attributed by
// the fallback the matrix route uses, so it is not orphaned.
const stillOrphaned = (profiles ?? []).filter((p) => !p.partnership_slug || !slugToId.has(p.partnership_slug));

if (stillOrphaned.length === 0) {
  console.log(
    `\nAll ${districtSeats.length} district all-access seats trace to a partnership, ` +
      `${unique.length} via the slug fallback` +
      `${selfServe ? `, and ${selfServe} self-serve seat(s) correctly have none` : ''}.\n`
  );
  process.exit(0);
}

const byDomain = {};
for (const p of stillOrphaned) {
  const email = String(p.email ?? '');
  const domain = email.includes('@') ? email.split('@')[1].toLowerCase() : 'unknown';
  byDomain[domain] = (byDomain[domain] ?? 0) + 1;
}

const sorted = Object.entries(byDomain).sort((a, b) => b[1] - a[1]);

console.log(`\n${stillOrphaned.length} live all-access seat(s) belong to no partnership:\n`);
for (const [domain, n] of sorted) console.log(`  ${String(n).padStart(4)}  ${domain}`);

if (UPDATING) {
  writeFileSync(BASELINE, JSON.stringify(byDomain, null, 2) + '\n');
  console.log(`\nBaseline written to ${BASELINE}.\n`);
  process.exit(0);
}

// A missing baseline must fail rather than write itself and pass, or deleting
// the file would silently disarm the check.
if (!existsSync(BASELINE)) {
  console.error(`\n${BASELINE} is missing, so this check would rewrite it and pass. Restore it, or run with --update-baseline deliberately.\n`);
  process.exit(1);
}

const baseline = JSON.parse(readFileSync(BASELINE, 'utf8'));
const regressions = [];
for (const [domain, n] of sorted) {
  const allowed = baseline[domain] ?? 0;
  if (n > allowed) {
    regressions.push(allowed === 0 ? `${domain}: ${n} seat(s), not in the baseline at all` : `${domain}: ${n} seat(s), baseline allows ${allowed}`);
  }
}

const fixed = Object.keys(baseline).filter((d) => !(d in byDomain));
if (fixed.length > 0) {
  console.log(`\nFixed since the baseline: ${fixed.join(', ')}. Drop them from ${BASELINE}.`);
}

if (regressions.length > 0) {
  console.error('\nNewly unattributed seats:\n');
  for (const r of regressions) console.error(`  ${r}`);
  console.error('\nEach of these is a real educator on no leadership screen and in no report.');
  console.error('Fix by creating or restoring the partnership, or by setting hub_profiles.partnership_slug.\n');
  process.exit(1);
}

console.log('\nNo new unattributed seats. The ones listed above are known and recorded.\n');
