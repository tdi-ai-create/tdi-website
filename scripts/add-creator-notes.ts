/**
 * TEA-4629 Followup: Add documentation notes to affected creator profiles
 *
 * Three groups:
 *   A: 24 standard broadcast recipients (visible to creator)
 *   B: Holly Stuart (visible to creator, custom message)
 *   C: 6 historical drift backfill (internal only)
 *
 * Run with: npx tsx scripts/add-creator-notes.ts
 * Add --dry-run to preview without inserting
 * Add --schema-only to just view the table schema
 * Add --test-one to insert only Karrissa Ebert's note
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SCHEMA_ONLY = args.includes('--schema-only');
const TEST_ONE = args.includes('--test-one');

// Group A: 25 IDs from the CCP (we'll verify count after resolution)
const GROUP_A_PREFIXES = [
  '791f4fbd', // Karrissa Ebert
  'f4038dc0', // Jessica Torres
  '15bec560', // Paige Griffin
  '8754ccf1', // Melissa France
  'a9e919a0', // Steph Sukow
  '924f1828', // Katie Landers
  'd7b1d9ea', // Kim Lohse
  'c7b333e2', // Sheila Daly
  '8e1fe08f', // Dr. Stephanie Nardi
  '88691d32', // Kayla Joye Brown
  '3a3c1a71', // Erin Siegrist
  'a5dfacfe', // Noor Shammas
  'e8540685', // Rebecca Blahus
  '8aa897ed', // Amanda Duffy
  '74058153', // Joe Vercellino
  '6b3ef58f', // Kimberelle Martin
  '2473324f', // Erin Light
  '4342b0b4', // Aitabe Fornes
  '6aeaab34', // Jeanette Mihalchik
  '75b65466', // Dr. Cherry-Ann Joseph-Hislop
  '718c3dc7', // Erin Shook
  'c12d149b', // Stacy Kratochvil
  'e5ee9815', // Lindsay Hall
  '3f7bc435', // Megan Fitzsimmons
  'fb79a439', // Dana DeLorto
];

// Group B: Holly Stuart
const HOLLY_ID = '264f389a-dfb8-42cb-ba17-494ceb31cf09';

// Group C: Historical drift
const GROUP_C_IDS = [
  '1a6f8135-7879-4c90-8e19-ed16c8ba3507', // Katie Welch
  '2b2f3a86-4642-49b7-93ef-0e7ecd138de4', // Sue Thompson
  '4ff09187-3fa1-412c-9ce3-8eb5f1fed566', // Ian Bowen
  'a33904a3-40ff-4a7c-9fa5-fa4ca98b621a', // Jay Jackson
  '4b373438-11c5-485d-8f76-8673b6a73037', // Walter Cullin Jr
  '02324c36-2663-49a7-aa61-c3a91ea576d8', // Paige Roberts
];

// Amy Storer — explicitly excluded (personal reply email is her record)
const AMY_ID = '9994154d-577a-47e0-b1f5-1c5b7a353d78';

// Jessica Torres — demo/test account, excluded from broadcast notes
const DEMO_ID = 'f4038dc0-2103-458f-a46c-ad36d97be949';

// Note content
const GROUP_A_NOTE = {
  title: 'Agreement Page Update',
  body: `Good news! We resolved a technical issue that was affecting the agreement page, and you should now be able to complete that step without any errors.

An email went out today (5/27/26) from Rae with the details — please check your inbox if you haven't already.

You'll also be hearing from Bella Dailey soon — she's our new Special Projects Lead, joining our team to make sure every creator has personal support throughout their project. She'll be reaching out over the next week or two to say hi and answer any questions you have.

Thanks so much for your patience — we're so glad to have you creating with us!`,
};

const GROUP_B_NOTE = {
  title: 'Agreement Status Fixed',
  body: `Hi Holly! Thanks again for letting us know your portal was stuck on the agreement screen. We identified the issue and fixed your account directly today — your agreement milestone is now properly marked complete, and you should see Content Design unlock as your next phase when you refresh.

Bella reached out personally to confirm everything is sorted. If anything else feels off, just reply to her email anytime — she's your go-to going forward.

Thanks for your patience and for being such a thoughtful partner!`,
};

const GROUP_C_NOTE = {
  title: 'Internal: Agreement Flag Backfilled',
  body: `[Auto] Backfilled creators.agreement_signed = true on 5/27/26. The agreement_sign milestone was already marked complete prior to this date, but the agreement_signed flag had drifted to false. See TEA-4629 followup for context.

No creator-facing email sent — this creator's portal view was unaffected by the drift.`,
};

async function main() {
  // Step 1: Schema
  console.log('=== Step 1: creator_notes schema ===\n');
  const { data: columns, error: schemaErr } = await supabase
    .rpc('', undefined) // Won't work — use a workaround
    .select();

  // Direct query via the table itself to discover columns
  const { data: sampleRow, error: sampleErr } = await supabase
    .from('creator_notes')
    .select('*')
    .limit(1);

  if (sampleErr) {
    console.error('Error querying creator_notes:', sampleErr.message);
    return;
  }

  if (sampleRow && sampleRow.length > 0) {
    console.log('Columns found:', Object.keys(sampleRow[0]).join(', '));
    console.log('Sample row:', JSON.stringify(sampleRow[0], null, 2));
  } else {
    console.log('Table exists but is empty. Trying insert shape...');
    // Try to see what columns exist by checking error on a dummy insert
    const { error: probeErr } = await supabase
      .from('creator_notes')
      .insert({ creator_id: '00000000-0000-0000-0000-000000000000', content: 'probe' })
      .select();
    if (probeErr) {
      console.log('Probe error (reveals schema info):', probeErr.message);
    }
  }

  if (SCHEMA_ONLY) return;

  // Step 2: Resolve Group A UUIDs
  console.log('\n=== Step 2: Resolve Group A UUIDs ===\n');

  const { data: allCreators } = await supabase
    .from('creators')
    .select('id, name, email');

  if (!allCreators) {
    console.error('Could not fetch creators');
    return;
  }

  const groupACreators = allCreators.filter(c =>
    GROUP_A_PREFIXES.some(prefix => c.id.startsWith(prefix))
  );

  // Remove Holly, Amy, and demo account if they ended up in the list
  const groupAFiltered = groupACreators.filter(c =>
    c.id !== HOLLY_ID && c.id !== AMY_ID && c.id !== DEMO_ID
  );

  console.log(`Group A resolved: ${groupAFiltered.length} creators (expected 24-25)`);
  for (const c of groupAFiltered) {
    console.log(`  ${c.name} (${c.email}) — ${c.id}`);
  }

  // Verify Holly
  const holly = allCreators.find(c => c.id === HOLLY_ID);
  console.log(`\nGroup B (Holly): ${holly ? `${holly.name} (${holly.email})` : 'NOT FOUND'}`);

  // Verify Group C
  const groupCCreators = allCreators.filter(c => GROUP_C_IDS.includes(c.id));
  console.log(`\nGroup C resolved: ${groupCCreators.length} creators (expected 6)`);
  for (const c of groupCCreators) {
    console.log(`  ${c.name} (${c.email}) — ${c.id}`);
  }

  // Verify Amy excluded
  const amy = allCreators.find(c => c.id === AMY_ID);
  console.log(`\nAmy Storer (EXCLUDED): ${amy ? `${amy.name} (${amy.email})` : 'NOT FOUND'}`);

  const totalNotes = groupAFiltered.length + 1 + groupCCreators.length;
  console.log(`\nTotal notes to insert: ${totalNotes}`);

  if (DRY_RUN) {
    console.log('\n[DRY RUN] Would insert notes but stopping here.');
    return;
  }

  if (TEST_ONE) {
    console.log('\n=== TEST: Inserting one note for Karrissa Ebert ===\n');
    const karrissa = groupAFiltered.find(c => c.id.startsWith('791f4fbd'));
    if (!karrissa) {
      console.error('Karrissa Ebert not found!');
      return;
    }

    const { data: inserted, error: insertErr } = await supabase
      .from('creator_notes')
      .insert({
        creator_id: karrissa.id,
        content: `**${GROUP_A_NOTE.title}**\n\n${GROUP_A_NOTE.body}`,
        author: 'TDI Team',
        visible_to_creator: true,
      })
      .select();

    if (insertErr) {
      console.error('Insert error:', insertErr.message, insertErr.details, insertErr.hint);
      return;
    }

    console.log('Inserted:', JSON.stringify(inserted, null, 2));
    console.log('\nVerify at: /tdi-admin/creators/' + karrissa.id);
    return;
  }

  // Step 4: Bulk insert all three groups
  console.log('\n=== Step 4: Bulk insert ===\n');

  // Check for existing notes from test insert to avoid duplicates
  const { data: existingNotes } = await supabase
    .from('creator_notes')
    .select('creator_id')
    .eq('author', 'TDI Team')
    .gt('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString());

  const alreadyNoted = new Set((existingNotes || []).map(n => n.creator_id));
  if (alreadyNoted.size > 0) {
    console.log(`Skipping ${alreadyNoted.size} creators who already have a note from this session`);
  }

  // Group A (skip already-noted)
  const groupAToInsert = groupAFiltered.filter(c => !alreadyNoted.has(c.id));
  const groupARows = groupAToInsert.map(c => ({
    creator_id: c.id,
    content: `**${GROUP_A_NOTE.title}**\n\n${GROUP_A_NOTE.body}`,
    author: 'TDI Team',
    visible_to_creator: true,
  }));

  console.log(`Inserting Group A (${groupARows.length} rows, ${groupAFiltered.length - groupAToInsert.length} skipped)...`);
  const { data: aResult, error: aErr } = await supabase
    .from('creator_notes')
    .insert(groupARows)
    .select('id, creator_id');

  if (aErr) {
    console.error('Group A insert error:', aErr.message, aErr.details);
    return;
  }
  console.log(`  Inserted: ${aResult?.length} rows`);

  // Group B — Holly
  console.log('Inserting Group B (Holly)...');
  const { data: bResult, error: bErr } = await supabase
    .from('creator_notes')
    .insert({
      creator_id: HOLLY_ID,
      content: `**${GROUP_B_NOTE.title}**\n\n${GROUP_B_NOTE.body}`,
      author: 'TDI Team',
      visible_to_creator: true,
    })
    .select('id, creator_id');

  if (bErr) {
    console.error('Group B insert error:', bErr.message, bErr.details);
    return;
  }
  console.log(`  Inserted: ${bResult?.length} row`);

  // Group C — drift backfill
  const groupCRows = GROUP_C_IDS.map(id => ({
    creator_id: id,
    content: `**${GROUP_C_NOTE.title}**\n\n${GROUP_C_NOTE.body}`,
    author: 'TDI Team',
    visible_to_creator: false,
  }));

  console.log(`Inserting Group C (${groupCRows.length} rows)...`);
  const { data: cResult, error: cErr } = await supabase
    .from('creator_notes')
    .insert(groupCRows)
    .select('id, creator_id');

  if (cErr) {
    console.error('Group C insert error:', cErr.message, cErr.details);
    return;
  }
  console.log(`  Inserted: ${cResult?.length} rows`);

  // Step 5: Verify
  console.log('\n=== Step 5: Verification ===\n');

  const { data: recentNotes } = await supabase
    .from('creator_notes')
    .select('id, creator_id, author, visible_to_creator, created_at')
    .gt('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });

  console.log(`Total notes inserted in last 5 minutes: ${recentNotes?.length}`);

  // Verify Amy has no new note
  const { data: amyNotes } = await supabase
    .from('creator_notes')
    .select('id')
    .eq('creator_id', AMY_ID)
    .gt('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString());

  console.log(`Amy Storer new notes (should be 0): ${amyNotes?.length}`);

  console.log('\nDone!');
}

main().catch(console.error);
