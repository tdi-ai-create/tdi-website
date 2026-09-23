/**
 * Everybody holding a paid Hub seat should be on their school's roster.
 *
 * verify-seat-attribution catches a seat that traces to no partnership at all.
 * This catches the next failure along, and it is quieter: the seat is linked to
 * the right partnership, the person is using the Hub, and they are simply not in
 * `staff_members`. Nothing errors. The school looks fine. That person is invisible
 * on the Team tab, absent from every report, and excluded from the denominator of
 * every goal, so a school can be told 4 of 8 educators are active when it is really
 * 4 of 11.
 *
 * Found 22 Sep 2026 while onboarding four schools on the same day. Three of the
 * four had a roster that did not match their seats. St. Peter Chanel was missing
 * seven people, Glen Ellyn three, St. Mary two. The one that made the point was
 * Fatima Arjumand at Glen Ellyn, who was the single most active account in that
 * school and appeared on no leadership screen anywhere.
 *
 * Provisioning writes the Hub seat. Adding the person to the roster is a separate
 * step and nothing has ever checked that the two agree.
 *
 * Matched on email, lowercased. Not on name, which drifts, and not on user id,
 * which staff_members does not carry.
 *
 * The known gaps are recorded in a baseline, for the same reason seat attribution
 * keeps one: a check that can never pass is one people learn to skip. This fails
 * on a NEW gap, or on an existing one growing, which is what a freshly broken
 * roster looks like. Fix a school, drop its line, and it cannot come back quietly.
 *
 * Run:    node scripts/integrity/verify-roster-coverage.mjs
 * Update: node scripts/integrity/verify-roster-coverage.mjs --update-baseline
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const BASELINE = 'scripts/integrity/roster-coverage-baseline.json';
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
  .select('id, org_name, status')
  .not('status', 'in', '("completed")');
die('partnerships', pErr);

const nameById = new Map((partnerships ?? []).map((p) => [String(p.id), p.org_name || '(unnamed partnership)']));

const { data: seats, error: sErr } = await hub
  .from('hub_memberships')
  .select('user_id, partnership_id')
  .eq('tier', 'all_access')
  .eq('status', 'active')
  .not('partnership_id', 'is', null);
die('hub_memberships', sErr);

// Only the partnerships we actually manage. A seat pointing at a partnership that
// no longer exists is a different fault and verify-seat-attribution owns it, so
// reporting it here too would make two checks fail for one problem.
const managed = (seats ?? []).filter((s) => nameById.has(String(s.partnership_id)));

const userIds = [...new Set(managed.map((s) => s.user_id))];
const emailById = new Map();
for (let i = 0; i < userIds.length; i += 500) {
  const { data, error } = await hub
    .from('hub_profiles')
    .select('id, email')
    .in('id', userIds.slice(i, i + 500));
  die('hub_profiles', error);
  for (const p of data ?? []) if (p.email) emailById.set(String(p.id), p.email.toLowerCase());
}

const { data: roster, error: rErr } = await portal
  .from('staff_members')
  .select('partnership_id, email, is_active');
die('staff_members', rErr);

const rosterByPartnership = new Map();
for (const r of roster ?? []) {
  if (!r.is_active || !r.email || !r.partnership_id) continue;
  const key = String(r.partnership_id);
  if (!rosterByPartnership.has(key)) rosterByPartnership.set(key, new Set());
  rosterByPartnership.get(key).add(r.email.toLowerCase());
}

const seatsByPartnership = new Map();
for (const s of managed) {
  const key = String(s.partnership_id);
  const email = emailById.get(String(s.user_id));
  if (!email) continue;
  if (!seatsByPartnership.has(key)) seatsByPartnership.set(key, new Set());
  seatsByPartnership.get(key).add(email);
}

/** Per partnership: how many seat holders are absent from the roster. */
const gaps = {};
let totalMissing = 0;
for (const [id, seatEmails] of seatsByPartnership) {
  const onRoster = rosterByPartnership.get(id) ?? new Set();
  const missing = [...seatEmails].filter((e) => !onRoster.has(e)).sort();
  if (missing.length === 0) continue;
  gaps[id] = { org_name: nameById.get(id), missing_count: missing.length, missing };
  totalMissing += missing.length;
}

if (UPDATING) {
  writeFileSync(
    BASELINE,
    JSON.stringify(
      {
        _comment:
          'Seat holders who are not on their school roster, and so are invisible to the Team tab, every report and every goal denominator. Fix a school and drop its entry. Regenerate with: node scripts/integrity/verify-roster-coverage.mjs --update-baseline',
        generated_at: new Date().toISOString().slice(0, 10),
        total_missing: totalMissing,
        partnerships: gaps,
      },
      null,
      2
    ) + '\n'
  );
  console.log(`\nBaseline written. ${totalMissing} seat holder(s) currently off roster across ${Object.keys(gaps).length} partnership(s).\n`);
  process.exit(0);
}

if (!existsSync(BASELINE)) {
  console.error(`\nNo baseline at ${BASELINE}. Create it with --update-baseline, having first looked at what it records.\n`);
  process.exit(1);
}

const baseline = JSON.parse(readFileSync(BASELINE, 'utf8'));
const known = baseline.partnerships ?? {};

const regressions = [];
for (const [id, gap] of Object.entries(gaps)) {
  const before = known[id];
  if (!before) {
    regressions.push(`${gap.org_name}: ${gap.missing_count} seat holder(s) off roster, and this school had none before.`);
    continue;
  }
  if (gap.missing_count > before.missing_count) {
    regressions.push(
      `${gap.org_name}: ${gap.missing_count} seat holder(s) off roster, up from ${before.missing_count}.`
    );
    continue;
  }
  // Same count but different people still means somebody new went invisible.
  const wasMissing = new Set(before.missing ?? []);
  const newlyMissing = gap.missing.filter((e) => !wasMissing.has(e));
  if (newlyMissing.length > 0) {
    regressions.push(`${gap.org_name}: ${newlyMissing.join(', ')} newly off roster.`);
  }
}

const fixed = Object.entries(known).filter(([id, before]) => {
  const now = gaps[id];
  return !now || now.missing_count < before.missing_count;
});

if (regressions.length === 0) {
  const covered = [...seatsByPartnership.entries()].filter(([id]) => !gaps[id]).length;
  console.log(
    `\nRoster coverage holding. ${covered} partnership(s) have every seat holder on the roster` +
      `${totalMissing ? `, and the ${totalMissing} known gap(s) in the baseline have not grown` : ''}.`
  );
  if (fixed.length > 0) {
    console.log(`\n${fixed.length} school(s) improved since the baseline was written:`);
    for (const [id, before] of fixed) {
      const now = gaps[id]?.missing_count ?? 0;
      console.log(`  ${before.org_name}: ${before.missing_count} -> ${now}`);
    }
    console.log('\nRun with --update-baseline to lock that in so it cannot slip back.');
  }
  console.log('');
  process.exit(0);
}

console.error('\nSeat holders have gone missing from a school roster.\n');
for (const line of regressions) console.error(`  ${line}`);
console.error(
  '\nSomebody holds a paid seat and is not on their school roster. They will not appear\n' +
    'on the Team tab, in any report, or in the denominator of any goal, and nothing will\n' +
    'error. Add them to staff_members, then re-run.\n'
);
process.exit(1);
