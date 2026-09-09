// Resets the sandbox creator so every write button can be pressed again.
//
//   npx tsx scripts/integrity/reset-sandbox-creator.mjs
//
// WHY THIS EXISTS
//
// There was no safe place to press a write button in this system. Previews
// cannot be signed into, there is no staging, and every other creator is a real
// person. So Approve, Request changes and Mark complete were only ever verified
// by reading the code, and all three were broken from 31 August to 8 September:
// they sent `creator_milestones.id` where the route looks up `milestones.id`, a
// uuid against a text key. Bella clicked Approve on Holly Stuart and got
// "Error approving milestone." with no reason.
//
// The 6 September dry run had checked that those buttons rendered and
// deliberately did not press them. Rendering was all it proved.
//
// THE SANDBOX
//
// Jessica Torres, demo.creator@teachersdeserveit.com. Archived and paused, so
// she is excluded by construction from every board, sweep, digest and count:
// each of those filters on `creators.status = 'active'`. Her page still loads
// by id, and her buttons are the same buttons.
//
// After running this she has one step in review, which makes Approve and
// Request changes appear, and one step open, which makes Mark complete appear.
//
// Press them. Then check the database rather than the screenshot: a screenshot
// taken too early made me report a working modal as broken.

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const SANDBOX_EMAIL = 'demo.creator@teachersdeserveit.com';

const { data: creator, error: cErr } = await supabase
  .from('creators')
  .select('id, name, status, lifecycle_state')
  .eq('email', SANDBOX_EMAIL)
  .maybeSingle();

if (cErr || !creator) {
  console.error(`Could not find the sandbox creator (${SANDBOX_EMAIL}):`, cErr?.message ?? 'no row');
  process.exit(1);
}

// Refuse to touch anything that is not archived. If somebody has made this
// account live, resetting its board would be rewriting a real creator's work.
if (creator.status !== 'archived') {
  console.error(
    `Refusing to reset: ${creator.name} is "${creator.status}", not archived. ` +
      'The sandbox must stay archived so it cannot appear on a board.'
  );
  process.exit(1);
}

const RESET = [
  { milestone_id: 'intake_completed', status: 'completed', review_status: null, round: 0 },
  { milestone_id: 'content_path_selection', status: 'completed', review_status: null, round: 0 },
  // In review, so Approve and Request changes both render.
  { milestone_id: 'recording_completed', status: 'waiting_approval', review_status: 'submitted', round: 0 },
  // Open, so Mark complete renders.
  { milestone_id: 'recording_started', status: 'available', review_status: null, round: 0 },
];

let failed = 0;
for (const row of RESET) {
  const { error } = await supabase
    .from('creator_milestones')
    .update({
      status: row.status,
      review_status: row.review_status,
      round: row.round,
      completed_at: row.status === 'completed' ? new Date().toISOString() : null,
      approved_by: null,
      completed_by: null,
      submitted_value:
        row.milestone_id === 'recording_completed' ? 'https://example.invalid/sandbox-asset' : null,
    })
    .eq('creator_id', creator.id)
    .eq('milestone_id', row.milestone_id);

  if (error) {
    failed += 1;
    console.error(`  ${row.milestone_id}: ${error.message}`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} step(s) could not be reset.`);
  process.exit(1);
}

const { data: board } = await supabase
  .from('creator_milestones')
  .select('status, review_status, milestones!inner(name)')
  .eq('creator_id', creator.id);

console.log(`Sandbox reset: ${creator.name} (${creator.status}, ${creator.lifecycle_state})`);
for (const b of board ?? []) {
  const m = Array.isArray(b.milestones) ? b.milestones[0] : b.milestones;
  console.log(`  ${b.status.padEnd(18)} ${b.review_status ?? '-'}  ${m?.name}`);
}
console.log(`\nhttps://www.teachersdeserveit.com/tdi-admin/creators/${creator.id}`);
console.log('Press Approve, Request changes and Mark complete, then check the database.');
