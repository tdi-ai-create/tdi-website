/**
 * TEA-4629 Diagnostic: Find stuck + drifted agreement creators
 *
 * Run with: npx tsx scripts/audit-agreement-creators.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  console.log('=== TEA-4629 Agreement Audit ===\n');

  // 1. Creators stuck at agreement_sign milestone (not completed)
  console.log('--- Query 1: Creators stuck at agreement_sign milestone ---');
  const { data: stuck, error: stuckErr } = await supabase
    .from('creator_milestones')
    .select(`
      creator_id,
      status,
      completed_at,
      creators!inner(id, name, email, agreement_signed, agreement_signed_at)
    `)
    .eq('milestone_id', 'agreement_sign')
    .neq('status', 'completed');

  if (stuckErr) {
    console.error('Query 1 error:', stuckErr.message);
    // Fallback: try without join
    console.log('\nFallback: querying milestone records directly...');
    const { data: milestones, error: msErr } = await supabase
      .from('creator_milestones')
      .select('creator_id, milestone_id, status, completed_at')
      .eq('milestone_id', 'agreement_sign')
      .neq('status', 'completed');

    if (msErr) {
      console.error('Fallback error:', msErr.message);
    } else if (milestones && milestones.length > 0) {
      console.log(`Found ${milestones.length} creators stuck at agreement_sign:\n`);
      for (const m of milestones) {
        // Look up creator details separately
        const { data: creator } = await supabase
          .from('creators')
          .select('id, name, email, agreement_signed, agreement_signed_at')
          .eq('id', m.creator_id)
          .single();

        if (creator) {
          console.log(`  - ${creator.name} (${creator.email})`);
          console.log(`    ID: ${creator.id}`);
          console.log(`    Milestone status: ${m.status}`);
          console.log(`    agreement_signed flag: ${creator.agreement_signed}`);
          console.log(`    agreement_signed_at: ${creator.agreement_signed_at || 'null'}`);
          console.log('');
        }
      }
    } else {
      console.log('No creators stuck at agreement_sign milestone.');
    }
  } else if (stuck && stuck.length > 0) {
    console.log(`Found ${stuck.length} creators stuck at agreement_sign:\n`);
    for (const row of stuck) {
      const c = row.creators as Record<string, unknown>;
      console.log(`  - ${c.name} (${c.email})`);
      console.log(`    ID: ${c.id}`);
      console.log(`    Milestone status: ${row.status}`);
      console.log(`    agreement_signed flag: ${c.agreement_signed}`);
      console.log(`    agreement_signed_at: ${c.agreement_signed_at || 'null'}`);
      console.log('');
    }
  } else {
    console.log('No creators stuck at agreement_sign milestone.');
  }

  // 2. Also check: creators who don't have an agreement_sign milestone record at all
  console.log('\n--- Query 1b: Creators missing agreement_sign milestone record ---');
  const { data: allCreators } = await supabase
    .from('creators')
    .select('id, name, email, agreement_signed')
    .eq('agreement_signed', false);

  if (allCreators && allCreators.length > 0) {
    for (const c of allCreators) {
      const { data: milestone } = await supabase
        .from('creator_milestones')
        .select('id, status')
        .eq('creator_id', c.id)
        .eq('milestone_id', 'agreement_sign')
        .maybeSingle();

      if (!milestone) {
        console.log(`  - ${c.name} (${c.email}) — NO milestone record at all`);
        console.log(`    ID: ${c.id}`);
        console.log('');
      }
    }
  }

  // 3. Historical drift: milestone completed but agreement_signed = false
  console.log('\n--- Query 2: Drift — milestone completed but agreement_signed = false ---');
  const { data: driftMilestones, error: driftMsErr } = await supabase
    .from('creator_milestones')
    .select('creator_id, status, completed_at')
    .eq('milestone_id', 'agreement_sign')
    .eq('status', 'completed');

  if (driftMsErr) {
    console.error('Drift milestone query error:', driftMsErr.message);
  } else if (driftMilestones && driftMilestones.length > 0) {
    let driftCount = 0;
    for (const m of driftMilestones) {
      const { data: creator } = await supabase
        .from('creators')
        .select('id, name, email, agreement_signed')
        .eq('id', m.creator_id)
        .eq('agreement_signed', false)
        .maybeSingle();

      if (creator) {
        driftCount++;
        console.log(`  - ${creator.name} (${creator.email})`);
        console.log(`    ID: ${creator.id}`);
        console.log(`    Milestone: completed at ${m.completed_at}`);
        console.log(`    agreement_signed flag: false (DRIFTED)`);
        console.log('');
      }
    }
    if (driftCount === 0) {
      console.log('No drift found — all completed milestones have agreement_signed = true.');
    } else {
      console.log(`Found ${driftCount} creators with drift.`);
    }
  } else {
    console.log('No completed agreement_sign milestones found at all.');
  }

  // 4. Summary stats
  console.log('\n--- Summary ---');
  const { count: totalCreators } = await supabase.from('creators').select('id', { count: 'exact', head: true });
  const { count: signedCount } = await supabase.from('creators').select('id', { count: 'exact', head: true }).eq('agreement_signed', true);
  const { count: unsignedCount } = await supabase.from('creators').select('id', { count: 'exact', head: true }).eq('agreement_signed', false);

  console.log(`Total creators: ${totalCreators}`);
  console.log(`agreement_signed = true: ${signedCount}`);
  console.log(`agreement_signed = false: ${unsignedCount}`);
}

main().catch(console.error);
