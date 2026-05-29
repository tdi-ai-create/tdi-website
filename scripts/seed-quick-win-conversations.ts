/**
 * Seed quick_win_responses with varied community posts across all published quick wins.
 * Run with: npx tsx scripts/seed-quick-win-conversations.ts
 *
 * Prerequisites: FK constraint on user_id must be dropped first.
 * Uses the Hub Supabase project.
 */

import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

// Use Hub project - try Hub URL first, fall back to main
const supabaseUrl = process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('Using Supabase URL:', supabaseUrl?.substring(0, 30) + '...');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Fake user IDs (no FK constraint, just need unique UUIDs)
const PERSONAS = [
  { id: 'a1111111-1111-1111-1111-111111111111', name: 'Maria S.', role: 'Teacher, 3-5' },
  { id: 'a2222222-2222-2222-2222-222222222222', name: 'James R.', role: 'Teacher, 6-8' },
  { id: 'a3333333-3333-3333-3333-333333333333', name: 'Tanya W.', role: 'Para, PK-2' },
  { id: 'a4444444-4444-4444-4444-444444444444', name: 'Devon K.', role: 'Coach, K-12' },
  { id: 'a5555555-5555-5555-5555-555555555555', name: 'Lisa M.', role: 'Teacher, 9-12' },
  { id: 'a6666666-6666-6666-6666-666666666666', name: 'Carlos P.', role: 'Teacher, PK-2' },
  { id: 'a7777777-7777-7777-7777-777777777777', name: 'Angela T.', role: 'School Leader, K-8' },
  { id: 'a8888888-8888-8888-8888-888888888888', name: 'Priya N.', role: 'Para, 6-8' },
  { id: 'a9999999-9999-9999-9999-999999999999', name: 'Marcus B.', role: 'Teacher, K-2' },
  { id: 'ab111111-1111-1111-1111-111111111111', name: 'Rachel F.', role: 'Coach, 3-8' },
];

// Response templates by contribution type, varied and authentic
const TRIED_IT = [
  "Used this first thing Monday morning and it clicked immediately. My students responded way better than I expected. Will definitely keep using it.",
  "Printed it out and tried it during my planning period. Took me about 3 minutes to get set up and it was ready to go by the next class.",
  "I was skeptical but gave it a shot with my afternoon group. They are usually the hardest to engage and this actually worked. Sharing with my team.",
  "Tried this with my small group today. Simple, clear, and the kids got it right away. Sometimes the straightforward tools are the best ones.",
  "Downloaded it on Sunday and used it all week. By Thursday it felt like second nature. My co-teacher noticed the difference before I even told her.",
  "Used this during transitions and it cut our wasted time in half. Not exaggerating. My admin even asked what I changed.",
  "Gave this a try with my reading group. It helped me stay organized and the students liked the structure. Win-win.",
  "I tried this as a self-check tool and it honestly helped ME more than the students. Made me more intentional about my planning.",
];

const ADAPTED_IT = [
  "The core idea is solid but I tweaked it for my SPED students. Slowed down the pacing and added visual supports. Worked great after that.",
  "I used this but changed the language for my ELL students. Same structure, just simpler vocabulary. They were able to follow along independently.",
  "Adapted this for a staff meeting instead of classroom use. My teachers loved it and asked for more tools like this.",
  "I modified this for my high schoolers. They thought it was too elementary at first so I reframed it as a productivity hack. Landed perfectly after that.",
  "Made it digital instead of printing it. Put it in a shared Google Doc so my whole team could use it. Way more practical for us.",
  "Combined this with another tool I already use. Together they cover more ground than either one alone.",
];

const STILL_TRYING = [
  "Day 2 of using this. Not seeing huge results yet but I can tell the foundation is there. Going to give it the full two weeks.",
  "Started this week. My students are still getting used to it but I am staying consistent. Hoping it clicks soon.",
  "Tried it once and it was bumpy. Going to try again tomorrow with a slightly different setup. The concept makes sense, just need to find my rhythm.",
  "Using this alongside my existing routine. Not ready to fully commit yet but I like the direction. Will report back.",
];

const GOT_STUCK = [
  "Love the concept but I am struggling with the timing piece. My class periods are only 42 minutes and this feels like it needs more runway.",
  "Downloaded it but I am not sure how to integrate it with the curriculum I already have. Would love to see an example of someone using it alongside a reading block.",
  "Tried it and my students were confused by step 3. I think the instructions could be clearer for younger learners. Going to try rewriting that part.",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickPersona(exclude: string[] = []) {
  const available = PERSONAS.filter(p => !exclude.includes(p.id));
  return pickRandom(available.length > 0 ? available : PERSONAS);
}

function getResponseCount(): number {
  // 1-6 responses, weighted toward 2-4
  const weights = [1, 2, 3, 3, 4, 4, 4, 5, 5, 6];
  return pickRandom(weights);
}

function pickContributionType(): { type: string; pool: string[] } {
  const roll = Math.random();
  if (roll < 0.40) return { type: 'tried_it', pool: TRIED_IT };
  if (roll < 0.65) return { type: 'adapted_it', pool: ADAPTED_IT };
  if (roll < 0.85) return { type: 'still_trying', pool: STILL_TRYING };
  return { type: 'got_stuck', pool: GOT_STUCK };
}

function randomDate(): string {
  // Random date within last 30 days
  const daysAgo = Math.floor(Math.random() * 30) + 1;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(Math.floor(Math.random() * 12) + 7); // 7am-7pm
  date.setMinutes(Math.floor(Math.random() * 60));
  return date.toISOString();
}

async function main() {
  // Get all published quick wins
  const { data: quickWins, error } = await supabase
    .from('hub_quick_wins')
    .select('id, title, slug')
    .eq('is_published', true);

  if (error) {
    console.error('Error fetching quick wins:', error.message);
    return;
  }

  console.log(`Found ${quickWins?.length} published quick wins`);

  // Check existing responses
  const { count: existingCount } = await supabase
    .from('quick_win_responses')
    .select('id', { count: 'exact', head: true });

  console.log(`Existing responses: ${existingCount}`);

  if ((existingCount || 0) > 10) {
    console.log('Already seeded. Delete existing rows first if you want to re-seed.');
    console.log('Run: DELETE FROM quick_win_responses WHERE user_id LIKE \'a%\';');
    return;
  }

  let totalInserted = 0;

  for (const qw of quickWins || []) {
    const count = getResponseCount();
    const usedPersonas: string[] = [];
    const rows = [];

    for (let i = 0; i < count; i++) {
      const persona = pickPersona(usedPersonas);
      usedPersonas.push(persona.id);
      const { type, pool } = pickContributionType();
      const body = pickRandom(pool);

      rows.push({
        quick_win_id: qw.id,
        user_id: persona.id,
        contribution_type: type,
        title: null,
        body: body,
        helpful_count: Math.floor(Math.random() * 20),
        created_at: randomDate(),
      });
    }

    const { error: insertError } = await supabase
      .from('quick_win_responses')
      .insert(rows);

    if (insertError) {
      console.error(`Error seeding ${qw.slug}:`, insertError.message);
    } else {
      totalInserted += rows.length;
      process.stdout.write('.');
    }
  }

  console.log(`\nDone! Inserted ${totalInserted} responses across ${quickWins?.length} quick wins.`);

  // Verify
  const { count: finalCount } = await supabase
    .from('quick_win_responses')
    .select('id', { count: 'exact', head: true });
  console.log(`Total responses in table: ${finalCount}`);
}

main().catch(console.error);
