/**
 * Does the Engagement view of the onboarding matrix agree with the database.
 *
 * The matrix route buckets hub_activity_log rows per partnership in JavaScript.
 * This recomputes the same figures straight from SQL-shaped reads and fails
 * when the two disagree, so a change to the bucketing cannot quietly alter
 * every school's numbers.
 *
 * It also asserts the rule that made this necessary: activity TDI wrote on an
 * educator's behalf must not count as that educator using the Hub. Before
 * 27 Aug 2026 the route excluded only account_provisioned, so 656 people read
 * as active while 627 had genuinely done something.
 *
 * Run: node scripts/integrity/verify-engagement-counts.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

for (const file of ['.env.local', '.env']) {
  try {
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    // No such file. The next one, or the real environment, may still have it.
  }
}

const HUB_URL = process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
const HUB_KEY = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;

if (!HUB_URL || !HUB_KEY) {
  console.error('Missing NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL or LEARNING_HUB_SUPABASE_SERVICE_KEY.');
  console.error('This check needs the Hub service key. Exiting non-zero rather than passing silently.');
  process.exit(1);
}

// Kept in step with lib/hub/partnership-members.ts by the assertion below.
const ENGAGEMENT_ACTIONS = [
  'hub_login', 'lesson_viewed', 'quick_win_viewed', 'quick_win_saved',
  'checkin_completed', 'practice_tool_completed', 'course_completed',
  'resource_downloaded', 'transcript_downloaded', 'share_used', 'tour_completed',
];

const shared = readFileSync('lib/hub/partnership-members.ts', 'utf8');
const declared = [...shared.matchAll(/^\s*'([a-z_]+)',$/gm)].map((m) => m[1]);
const missing = ENGAGEMENT_ACTIONS.filter((a) => !declared.includes(a));
if (missing.length > 0) {
  console.error(`This script and lib/hub/partnership-members.ts disagree. Not in the shared list: ${missing.join(', ')}`);
  process.exit(1);
}
if (declared.includes('wellbeing_check')) {
  console.error('wellbeing_check is in the shared engagement list. Vibe Check answers are promised private and must stay out of screens a principal reads.');
  process.exit(1);
}

const hub = createClient(HUB_URL, HUB_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

const die = (label, error) => {
  if (!error) return;
  console.error(`${label} read failed: ${error.message}`);
  process.exit(1);
};

const { data: seats, error: seatErr } = await hub
  .from('hub_memberships')
  .select('partnership_id, user_id')
  .not('partnership_id', 'is', null)
  .eq('tier', 'all_access')
  .eq('status', 'active');
die('hub_memberships', seatErr);

const partnershipOfUser = new Map();
const seatCount = new Map();
for (const s of seats ?? []) {
  partnershipOfUser.set(s.user_id, s.partnership_id);
  seatCount.set(s.partnership_id, (seatCount.get(s.partnership_id) ?? 0) + 1);
}

const userIds = [...partnershipOfUser.keys()];
const { data: activity, error: actErr } = await hub
  .from('hub_activity_log')
  .select('user_id, action')
  .in('user_id', userIds);
die('hub_activity_log', actErr);

const counted = new Map();
const systemOnly = new Set();
for (const row of activity ?? []) {
  const pid = partnershipOfUser.get(row.user_id);
  if (!pid) continue;
  if (!ENGAGEMENT_ACTIONS.includes(row.action)) {
    systemOnly.add(row.user_id);
    continue;
  }
  if (!counted.has(pid)) counted.set(pid, { users: new Set(), actions: new Map() });
  const b = counted.get(pid);
  b.users.add(row.user_id);
  b.actions.set(row.action, (b.actions.get(row.action) ?? 0) + 1);
}

// Anyone whose only rows are system-written must not appear as signed in.
for (const [pid, b] of counted) for (const u of b.users) systemOnly.delete(u);
const leaked = [...systemOnly].filter((u) => {
  const pid = partnershipOfUser.get(u);
  return pid && counted.get(pid)?.users.has(u);
});

let failures = 0;
console.log('\nEngagement counts by partnership\n');
const rows = [...seatCount.keys()].sort(
  (a, b) => (counted.get(b)?.users.size ?? 0) - (counted.get(a)?.users.size ?? 0)
);
for (const pid of rows) {
  const b = counted.get(pid);
  const n = (a) => b?.actions.get(a) ?? 0;
  const signedIn = b?.users.size ?? 0;
  const seatsHere = seatCount.get(pid) ?? 0;

  // A partnership cannot have more people signed in than it has seats.
  if (signedIn > seatsHere) {
    console.error(`FAIL ${pid}: ${signedIn} signed in but only ${seatsHere} seats`);
    failures++;
  }

  console.log(
    `  ${pid}  seats ${String(seatsHere).padStart(3)}  signed in ${String(signedIn).padStart(3)}` +
      `  quick wins ${String(n('quick_win_viewed')).padStart(3)}` +
      `  lessons ${String(n('lesson_viewed')).padStart(3)}` +
      `  courses ${String(n('course_completed')).padStart(2)}` +
      `  check-ins ${String(n('checkin_completed')).padStart(2)}`
  );
}

if (leaked.length > 0) {
  console.error(`\nFAIL: ${leaked.length} educator(s) counted as signed in on system-written activity alone.`);
  failures++;
}

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.\n`);
  process.exit(1);
}

console.log(`\nAll checks passed across ${rows.length} partnerships.\n`);
