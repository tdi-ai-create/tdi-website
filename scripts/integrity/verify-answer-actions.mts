// Proves that answering a question actually starts the next piece of work.
//
//   npx tsx scripts/integrity/verify-answer-actions.mts
//
// Until 11 September 2026 an answer of "proceed" or "still stuck" was recorded
// faithfully and created nothing. Bella confirmed on 9 September that the
// St. Peter Chanel window was open and closing 1 October; no next step existed
// and nobody held it.
//
// The judgement is proved by lib/health/guards.ts, which runs without a
// database. This is the other half: it writes for real, because a correct plan
// that the database rejects is still a dead feature, and a wrong column plus a
// swallowed error is the oldest bug in this codebase. Writing for real is what
// caught both bugs in the first version of this rule. owner_type only accepts
// 'tdi' or 'client', so a decision routed to Rae failed a check constraint;
// and a returning question matched the item it came from and was dropped as a
// duplicate, so "still stuck" would have gone quiet exactly as before.
//
// Everything it creates is on a throwaway pursuit, removed at the end, and the
// count of anything left behind is printed rather than assumed.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

const { applyAnswerOutcome } = await import('../../lib/funding-answer-actions.js');

const created: { table: string; id: string }[] = [];
let failures = 0;
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'pass' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
  if (!ok) failures++;
};

try {
  // A throwaway pursuit, named so nobody mistakes it for real work.
  const { data: pursuit, error: pErr } = await sb
    .from('funding_pursuits')
    .insert({ pursuit_name: 'ZZ Automated check, safe to delete', district_name: 'ZZ Test School', total_amount: 0 })
    .select('id')
    .single();
  if (pErr) throw new Error(`could not create the test pursuit: ${pErr.message}`);
  created.push({ table: 'funding_pursuits', id: pursuit.id });

  const mkAsk = async (title: string, category: string) => {
    const { data, error } = await sb
      .from('funding_action_items')
      .insert({
        pursuit_id: pursuit.id,
        title,
        category,
        status: 'pending',
        owner_type: 'tdi',
        owner_name: 'Bella',
        requires_answer: true,
      })
      .select('id')
      .single();
    if (error) throw new Error(`could not create the test ask: ${error.message}`);
    created.push({ table: 'funding_action_items', id: data.id });
    return data.id as string;
  };

  const openTitles = async () => {
    const { data } = await sb
      .from('funding_action_items')
      .select('id, title, owner_name, requires_answer, due_date')
      .eq('pursuit_id', pursuit.id)
      .eq('status', 'pending');
    for (const r of data || []) if (!created.find((c) => c.id === r.id)) created.push({ table: 'funding_action_items', id: r.id });
    return data || [];
  };

  // 1. proceed on a gate must create the application step.
  const gateId = await mkAsk('Is this funder actually open, and when does it close?', 'gate');
  const r1 = await applyAnswerOutcome(sb, {
    actionId: gateId,
    pursuitId: pursuit.id,
    opportunityId: null,
    outcome: 'proceed',
    questionTitle: 'Is this funder actually open, and when does it close?',
    answer: 'Sept 1 to Oct 1, open now',
    answeredBy: 'check@teachersdeserveit.com',
    category: 'gate',
    grantName: 'Test Foundation Grant',
    schoolName: 'ZZ Test School',
  });
  check('a cleared gate writes a real next step', r1.created === 1 && !r1.error, r1.error || r1.titles[0]);

  const after1 = await openTitles();
  check(
    'the next step is on the board and owned by a person',
    after1.some((t) => t.title.includes('Test Foundation Grant') && t.owner_name === 'Bella'),
    after1.map((t) => t.title).join(' | ').slice(0, 90),
  );

  // 2. Answering twice must not create the work twice.
  const r2 = await applyAnswerOutcome(sb, {
    actionId: gateId,
    pursuitId: pursuit.id,
    opportunityId: null,
    outcome: 'proceed',
    questionTitle: 'Is this funder actually open, and when does it close?',
    answer: 'Sept 1 to Oct 1, open now',
    answeredBy: 'check@teachersdeserveit.com',
    category: 'gate',
    grantName: 'Test Foundation Grant',
    schoolName: 'ZZ Test School',
  });
  check('editing the answer does not duplicate the work', r2.created === 0 && r2.skipped, `created ${r2.created}`);

  // 3. still stuck must come back, with a due date in the future.
  const stuckId = await mkAsk('Is TDI an approved vendor with this state agency?', 'gate');
  const r3 = await applyAnswerOutcome(sb, {
    actionId: stuckId,
    pursuitId: pursuit.id,
    opportunityId: null,
    outcome: 'still_blocked',
    questionTitle: 'Is TDI an approved vendor with this state agency?',
    answer: 'Left a voicemail, no reply',
    answeredBy: 'check@teachersdeserveit.com',
    category: 'gate',
    grantName: 'Test Foundation Grant',
    priorReAsks: 0,
  });
  check('still stuck comes back rather than going quiet', r3.created === 1 && !r3.error, r3.error || r3.titles[0]);

  const after3 = await openTitles();
  const reAsk = after3.find((t) => t.title === 'Is TDI an approved vendor with this state agency?' && t.id !== stuckId);
  check('the returning question still asks a question', !!reAsk && reAsk.requires_answer === true);
  check('it is due in the future', !!reAsk && new Date(reAsk.due_date) > new Date(), reAsk?.due_date);

  // 4. Third time it becomes Rae's decision, not another chase.
  const thirdId = await mkAsk('Is TDI an approved vendor with this state agency? (third)', 'gate');
  const r4 = await applyAnswerOutcome(sb, {
    actionId: thirdId,
    pursuitId: pursuit.id,
    opportunityId: null,
    outcome: 'still_blocked',
    questionTitle: 'Is TDI an approved vendor with this state agency? (third)',
    answer: 'Still nothing',
    answeredBy: 'check@teachersdeserveit.com',
    category: 'gate',
    grantName: 'Test Foundation Grant',
    priorReAsks: 2,
  });
  const after4 = await openTitles();
  const decision = after4.find((t) => t.title.startsWith('Decide what to do about'));
  check('a question asked three times becomes a decision', r4.created === 1 && !!decision, r4.error || '');
  check('and that decision is Rae\'s, not another chase for Bella', decision?.owner_name === 'Rae', decision?.owner_name);
} catch (e) {
  check('the check itself ran', false, String((e as Error).message));
} finally {
  // Remove everything this created, children first.
  for (const c of created.filter((c) => c.table === 'funding_action_items')) {
    await sb.from('funding_action_items').delete().eq('id', c.id);
  }
  for (const c of created.filter((c) => c.table === 'funding_pursuits')) {
    await sb.from('funding_pursuits').delete().eq('id', c.id);
  }
  const { count } = await sb
    .from('funding_pursuits')
    .select('*', { count: 'exact', head: true })
    .like('pursuit_name', 'ZZ Automated check%');
  console.log(`\ncleanup: ${created.length} rows removed, ${count ?? 0} test pursuits left behind`);
}

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
