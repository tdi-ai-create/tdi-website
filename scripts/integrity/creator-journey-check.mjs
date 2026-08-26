// Prints the journey the dashboard will draw, for real creators, from real data.
// Reads only.
//
//   npx tsx scripts/integrity/creator-journey-check.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const { getJourney } = await import('../../lib/creator-journey.ts');

// One of each shape: mid-course, mid-download, two projects, and unchosen.
const WHO = ['Holly Stuart', 'Kim Lohse', 'Katie Welch', 'Celia Correa'];

const MARK = { complete: '[x]', open: '>>>', in_review: '...', changes_requested: '<<<', todo: '[ ]' };

for (const name of WHO) {
  const { data: c } = await sb.from('creators').select('id, name').eq('name', name).maybeSingle();
  if (!c) { console.log(`${name}: not found\n`); continue; }

  const { data: projects } = await sb
    .from('creator_projects')
    .select('id, project_number, content_path')
    .eq('creator_id', c.id)
    .order('project_number');

  for (const p of projects || []) {
    const j = await getJourney(sb, p.id);
    console.log('='.repeat(64));
    console.log(`${c.name}   project ${p.project_number}   path: ${j?.path ?? 'not chosen'}`);
    if (!j) { console.log('  no journey\n'); continue; }

    console.log(`  ${j.completedSteps} of ${j.totalSteps} steps done`);
    console.log(`  open step: ${j.openStep ? j.openStep.name : 'none'}` +
                (j.openStageName ? `   (stage: ${j.openStageName})` : ''));
    console.log('');

    for (const s of j.stages) {
      const mark = s.current ? '>' : s.done === s.total ? 'x' : ' ';
      console.log(`  [${mark}] ${s.name.padEnd(26)} ${s.done} of ${s.total}`);
      if (s.current) {
        for (const st of s.steps) {
          console.log(`         ${MARK[st.status]} ${st.name}${st.ours ? '   (we do this)' : ''}` +
                      (st.dueOn ? `   due ${st.dueOn}` : '') +
                      (st.round ? `   round ${st.round} of 2` : ''));
        }
      }
    }
    console.log('');
  }
}
console.log('Rows written this run: 0');
