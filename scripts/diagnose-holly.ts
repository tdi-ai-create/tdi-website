/**
 * Holly Stuart full account diagnosis — TEA-4629
 * Run with: npx tsx scripts/diagnose-holly.ts
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const HOLLY_ID = '264f389a-dfb8-42cb-ba17-494ceb31cf09';

async function main() {
  // 1.1 Schema discovery
  console.log('=== 1.1 creators schema (agreement fields) ===');
  const { data: creatorCols } = await supabase.rpc('sql', {
    query: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'creators' ORDER BY ordinal_position"
  }).select();
  // Fallback: just select Holly and inspect keys
  const { data: holly } = await supabase.from('creators').select('*').eq('id', HOLLY_ID).single();
  if (holly) {
    const agreementFields = Object.entries(holly).filter(([k]) =>
      k.includes('agreement') || k.includes('sign') || k.includes('version')
    );
    console.log('Agreement-related fields on Holly\'s record:');
    for (const [k, v] of agreementFields) {
      console.log(`  ${k}: ${JSON.stringify(v)}`);
    }
    console.log('\nFull creator record:');
    console.log(JSON.stringify(holly, null, 2));
  }

  // 1.3 Holly's milestone rows — check for duplicates
  console.log('\n=== 1.3 Holly\'s agreement_sign milestone rows ===');
  const { data: milestones, error: msErr } = await supabase
    .from('creator_milestones')
    .select('*')
    .eq('creator_id', HOLLY_ID)
    .eq('milestone_id', 'agreement_sign');

  if (msErr) {
    console.error('Error:', msErr.message);
  } else {
    console.log(`Found ${milestones?.length} agreement_sign rows:`);
    for (const m of milestones || []) {
      console.log(JSON.stringify(m, null, 2));
    }
  }

  // Also get ALL milestones to see the full picture
  console.log('\n=== Holly\'s ALL milestone rows ===');
  const { data: allMs } = await supabase
    .from('creator_milestones')
    .select('milestone_id, status, completed_at, project_id')
    .eq('creator_id', HOLLY_ID)
    .order('created_at');

  if (allMs) {
    console.log(`Total milestones: ${allMs.length}`);
    for (const m of allMs) {
      console.log(`  ${m.milestone_id}: ${m.status} | project_id: ${m.project_id} | completed_at: ${m.completed_at}`);
    }
  }

  // 1.4 Holly's projects
  console.log('\n=== 1.4 Holly\'s projects ===');
  const { data: projects, error: projErr } = await supabase
    .from('creator_projects')
    .select('*')
    .eq('creator_id', HOLLY_ID);

  if (projErr) {
    console.error('Projects error:', projErr.message);
    // Table might not exist or might have different name
    console.log('Trying alternate: checking creator record for project references...');
    if (holly) {
      const projFields = Object.entries(holly).filter(([k]) => k.includes('project'));
      for (const [k, v] of projFields) {
        console.log(`  ${k}: ${JSON.stringify(v)}`);
      }
    }
  } else {
    console.log(`Found ${projects?.length} projects:`);
    for (const p of projects || []) {
      console.log(JSON.stringify(p, null, 2));
    }
  }

  // Check milestones table for agreement-related entries
  console.log('\n=== Agreement milestones in milestones table ===');
  const { data: msDefs } = await supabase
    .from('milestones')
    .select('id, name, phase_id, sort_order')
    .eq('phase_id', 'agreement');
  console.log('Agreement phase milestones:', JSON.stringify(msDefs, null, 2));

  // 1.7 demo.creator check
  console.log('\n=== 1.7 demo.creator check ===');
  const { data: demo } = await supabase
    .from('creators')
    .select('id, name, email, agreement_signed')
    .eq('email', 'demo.creator@teachersdeserveit.com')
    .maybeSingle();
  console.log('Demo creator:', JSON.stringify(demo, null, 2));

  // Check if any other creators have the same contradiction
  console.log('\n=== Blast radius: creators with agreement_signed=true but milestone not completed ===');
  const { data: completedMs } = await supabase
    .from('creator_milestones')
    .select('creator_id, status, project_id')
    .eq('milestone_id', 'agreement_sign');

  const { data: allCreators } = await supabase
    .from('creators')
    .select('id, name, email, agreement_signed');

  if (completedMs && allCreators) {
    for (const c of allCreators) {
      const ms = completedMs.filter(m => m.creator_id === c.id);
      if (c.agreement_signed && ms.some(m => m.status !== 'completed')) {
        console.log(`  CONTRADICTION: ${c.name} (${c.email}) — agreement_signed=true but milestone status=${ms.map(m => `${m.status} (project:${m.project_id})`).join(', ')}`);
      }
      if (ms.length > 1) {
        console.log(`  DUPLICATE: ${c.name} (${c.email}) — ${ms.length} agreement_sign rows: ${ms.map(m => `status=${m.status}, project=${m.project_id}`).join(' | ')}`);
      }
    }
  }
}

main().catch(console.error);
