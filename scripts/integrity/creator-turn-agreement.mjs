// Asks every screen the same question about the same creator and checks they
// agree.
//
//   npx tsx scripts/integrity/creator-turn-agreement.mjs
//
// tsx rather than node: creator-journey.ts imports './creator-phases' without a
// file extension, which is fine for Next and which Node's TypeScript loader
// refuses to resolve.
//
// Reads only. This is the check that would have caught the admin page saying
// "HOLLY'S TURN" about a step the Needs You board had just called ours.

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

const { getJourney } = await import('../../lib/creator-journey.ts');
const { isWaitingOnUs } = await import('../../lib/creator-turn.ts');

const { data: projects } = await supabase
  .from('creator_projects')
  .select('id, creator_id, status')
  .neq('status', 'cancelled');

const { data: creators } = await supabase
  .from('creators')
  .select('id, name, status');

const byId = new Map((creators ?? []).map((c) => [c.id, c]));

let checked = 0;
let disagreed = 0;

for (const p of projects) {
  const c = byId.get(p.creator_id);
  if (c?.status !== 'active') continue;

  const journey = await getJourney(supabase, p.id);
  const step = journey?.openStep;
  if (!step) continue;

  // The other screen's answer, read straight from the row the queue reads.
  const { data: row } = await supabase
    .from('creator_milestones')
    .select('status, review_status, milestones!inner(requires_team_action)')
    .eq('id', step.recordId)
    .maybeSingle();

  if (!row) continue;

  const queueSays = isWaitingOnUs({
    status: row.status,
    reviewStatus: row.review_status,
    requiresTeamAction: row.milestones?.requires_team_action,
  });

  checked += 1;

  if (queueSays !== step.waitingOnUs) {
    disagreed += 1;
    console.log(
      `DISAGREE  ${c.name} on "${step.name}": journey says waitingOnUs=${step.waitingOnUs}, ` +
        `the queue rule says ${queueSays}`
    );
    continue;
  }

  console.log(
    `${queueSays ? 'waiting on us ' : 'their turn   '} ${c.name}: ${step.name}`
  );
}

console.log(`\n${checked} open steps checked, ${disagreed} disagreement(s).`);
process.exit(disagreed === 0 ? 0 : 1);
