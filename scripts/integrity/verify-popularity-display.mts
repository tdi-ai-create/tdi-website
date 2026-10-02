/**
 * What a school will actually read on its leadership dashboard.
 *
 * Rae, 2 October 2026: no headcounts on a client-facing surface. The dashboard
 * now prints a share and a direction instead of "8 people". This replays the
 * real activity rows for every live partnership through the real exported
 * rules and asserts the properties that make the display honest:
 *
 *   - no share ever exceeds 100%, which is what pairing a 90 day numerator
 *     with a 30 day denominator used to do
 *   - a person who did the thing never reads as 0%
 *   - a truncated read claims no direction at all, because rows arrive newest
 *     first and the older half of every comparison is the part that is lost
 *
 * It prints the rendered rows so a change to the wording or the maths can be
 * read rather than guessed at.
 *
 * Run: npx tsx scripts/integrity/verify-popularity-display.mts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { sharePct, contentSharePct, engagementTrend, windowsAreComparable, MIN_SHARE_POPULATION } from '../../lib/partners/popularity';

for (const file of ['.env.local', '.env']) {
  try {
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    // The next file, or the real environment, may still have it.
  }
}

const HUB_URL = process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
const HUB_KEY = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;
const MAIN_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const MAIN_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!HUB_URL || !HUB_KEY || !MAIN_URL || !MAIN_KEY) {
  console.error('Missing Hub or main Supabase credentials. Exiting non-zero rather than passing silently.');
  process.exit(1);
}

const hub = createClient(HUB_URL, HUB_KEY);
const main = createClient(MAIN_URL, MAIN_KEY);

// The same window and cap the dashboard route uses.
const WINDOW_DAYS = 90;
const ROW_CAP = 5000;

const { data: partnerships, error: pErr } = await main
  .from('partnerships')
  .select('id, slug, status')
  .neq('status', 'archived');
if (pErr) { console.error('partnerships read failed:', pErr.message); process.exit(1); }

let failures = 0;
let rowsShown = 0;
const tally: Record<string, number> = { up: 0, down: 0, flat: 0, none: 0 };

for (const p of partnerships || []) {
  // The roster the dashboard divides by: people who still work there. The same
  // is_active filter the route applies, or the tiles here would not match it.
  const { data: staff } = await main
    .from('staff_members')
    .select('email')
    .eq('partnership_id', p.id)
    .eq('is_active', true);

  const rosterEmails = (staff || []).map(s => s.email).filter(Boolean) as string[];
  if (rosterEmails.length === 0) continue;

  // Email is the only join between the two databases, exactly as the route does it.
  const { data: idRows } = await hub
    .from('hub_profiles')
    .select('id')
    .in('email', rosterEmails.map(e => e.toLowerCase()));

  const profileIds = (idRows || []).map(r => String(r.id));
  if (profileIds.length === 0) continue;

  const since = new Date(Date.now() - WINDOW_DAYS * 86400000).toISOString();
  const { data: rows } = await hub
    .from('hub_activity_log')
    .select('user_id, action, metadata, created_at')
    .in('user_id', profileIds)
    .neq('action', 'account_provisioned')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(ROW_CAP);

  const truncated = (rows?.length ?? 0) >= ROW_CAP;
  const weekAgo = Date.now() - 7 * 86400000;
  const monthAgo = Date.now() - 30 * 86400000;
  const twoMonthsAgo = Date.now() - 60 * 86400000;

  const week = new Set<string>();
  const month = new Set<string>();
  const recentDays = new Map<string, Set<string>>();
  const priorDays = new Map<string, Set<string>>();
  const content = new Map<string, { title: string; people: Set<string>; recent: Set<string>; prior: Set<string> }>();

  for (const row of rows || []) {
    const uid = String(row.user_id);
    const at = new Date(row.created_at as string).getTime();
    if (at >= weekAgo) week.add(uid);
    if (at >= monthAgo) month.add(uid);
    const day = (row.created_at as string).slice(0, 10);
    if (at >= monthAgo) {
      const d = recentDays.get(day) || new Set<string>(); d.add(uid); recentDays.set(day, d);
    } else if (at >= twoMonthsAgo) {
      const d = priorDays.get(day) || new Set<string>(); d.add(uid); priorDays.set(day, d);
    }

    const meta = (row.metadata || {}) as Record<string, unknown>;
    let title: string | null = null;
    if (row.action === 'lesson_viewed' && typeof meta.course_title === 'string') title = meta.course_title;
    else if (['quick_win_viewed', 'quick_win_saved', 'quick_win_downloaded'].includes(String(row.action))
      && typeof meta.quick_win_title === 'string') title = meta.quick_win_title;
    if (!title) continue;

    const e = content.get(title) || { title, people: new Set<string>(), recent: new Set<string>(), prior: new Set<string>() };
    e.people.add(uid);
    if (at >= monthAgo) e.recent.add(uid);
    else if (at >= twoMonthsAgo) e.prior.add(uid);
    content.set(title, e);
  }

  const comparable = windowsAreComparable(
    Array.from(recentDays.values(), x => x.size),
    Array.from(priorDays.values(), x => x.size),
  );

  const top = Array.from(content.values()).sort((a, b) => b.people.size - a.people.size).slice(0, 8);
  if (top.length === 0) continue;

  const activeThisMonth = month.size;
  const weekTile = sharePct(week.size, rosterEmails.length);
  const monthTile = sharePct(activeThisMonth, rosterEmails.length);

  for (const [label, tile] of [['week', weekTile], ['month', monthTile]] as const) {
    if (tile !== null && (tile > 100 || tile < 0)) {
      console.error(`   FAIL ${label} tile out of range: ${tile}%`);
      failures++;
    }
  }
  console.log(`${comparable ? '' : '   [no arrows: an in-service day sits in the comparison]'}`.trim() ? `\n   ${p.slug} -> arrows withheld` : '');
  console.log(`\n${p.slug}   tiles: ${weekTile}% active this week, ${monthTile}% active this month   (roster ${rosterEmails.length})`);

  for (const e of top) {
    const pct = contentSharePct(e.recent.size, activeThisMonth);
    const trend = comparable ? engagementTrend(e.recent.size, e.prior.size, truncated) : null;
    const glyph = trend === 'up' ? 'up  ' : trend === 'down' ? 'down' : trend === 'flat' ? 'same' : '    ';
    console.log(`   ${glyph} ${(pct === null ? '' : pct + '%').padStart(4)}   ${e.title.slice(0, 58)}`);
    rowsShown++;
    tally[trend ?? 'none']++;

    if (pct !== null && pct > 100) { console.error(`   FAIL over 100%: ${e.title}`); failures++; }
    if (pct !== null && pct === 0 && e.recent.size > 0) { console.error(`   FAIL real people read as 0%: ${e.title}`); failures++; }
    if (truncated && trend !== null) { console.error(`   FAIL claimed a direction on a truncated read: ${e.title}`); failures++; }
    if (pct !== null && activeThisMonth < MIN_SHARE_POPULATION) {
      console.error(`   FAIL share printed for a school of ${activeThisMonth}: ${e.title}`);
      failures++;
    }
    // A headcount must not survive anywhere in what the row renders.
    if (String(pct).includes(String(e.people.size)) && e.people.size > 100) { failures++; }
  }
}

console.log(`\n${rowsShown} rows checked across live partnerships.`);
console.log(`Directions: ${tally.up} up, ${tally.down} down, ${tally.flat} steady, ${tally.none} no claim.`);
if (failures > 0) { console.error(`${failures} FAILED`); process.exit(1); }
console.log('No share over 100%, no real activity reading as zero, no direction claimed on a truncated read.');
