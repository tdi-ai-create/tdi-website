#!/usr/bin/env node
/**
 * Propose a section for every published Hub item, by scoring rather than by
 * first match wins.
 *
 * The first pass used a CASE that stopped at the first matching branch, and the
 * branch order decided everything. A behavior tool carrying one stress tag
 * landed under teacher load because teacher load was checked first, which is
 * how Calm Response Scripts, the most opened tool in the Hub, ended up filed
 * under the reason good teachers leave.
 *
 * Here every section scores the item and the highest score wins. A tag that
 * means the item IS about that subject scores 3. A tag that merely touches the
 * subject scores 1. So one stress tag cannot outvote three behavior tags.
 *
 * WRITES NOTHING. It prints what it would change, for a person to read first.
 * Pass --json to get the machine readable form.
 */

import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync(new URL('../../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
    })
);

const URL_ = env.LEARNING_HUB_SUPABASE_URL || env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
const KEY = env.LEARNING_HUB_SUPABASE_SERVICE_KEY;
if (!URL_ || !KEY) throw new Error('Learning Hub URL or service key missing from .env.local');

/**
 * STRONG: the tag says this item is about that subject.
 * WEAK:   the tag says the item touches it. Supporting evidence only.
 *
 * A tag may appear as WEAK in several sections. That is the point: "routines"
 * is weak evidence for both behavior and the first weeks, so it decides nothing
 * on its own and lets the strong tags settle it.
 */
const STRONG = {
  paras: ['para', 'paras', 'para-support', 'para-teacher-communication', 'para-schedule', 'personal-care', 'caseload-management'],
  behavior: ['behavior', 'behavior-management', 'behavior-support', 'classroom-management', 'de-escalation', 'conflict-resolution', 'restorative-practices', 'self-regulation', 'zones-of-regulation', 'abc-tracking', 'peer-mediation', 'bullying', 'bullying-prevention', 'student-shutdown', 'trauma-informed', 'behavior-notes', 'peer-exclusion'],
  instructional_planning: ['lesson-planning', 'lesson-design', 'unit-design', 'backwards-design', 'curriculum', 'instructional-strategies', 'differentiation', 'scaffolding', 'small-group-instruction', 'cooperative-learning', 'direct-instruction', 'formative-assessment', 'formative assessment', 'assessment', 'standards-based-grading', 'standards-alignment', 'mastery-learning', 'project-based-learning', 'retrieval-practice', 'student-engagement', 'questioning', 'self assessment', 'self-assessment', 'test-prep', 'testing', 'progress-monitoring', 'progress monitoring'],
  first_weeks: ['back-to-school', 'first-week', 'onboarding', 'orientation', 'classroom-setup', 'room-setup', 'new-teacher', 'new teacher', 'new-teacher-support', 'new-student', 'mid-year-transfer', 'school-transfer', 'enrollment'],
  families: ['family-communication', 'family communication', 'parent-communication', 'parent-conferences', 'parent conferences', 'family-engagement', 'conferences', 'newsletter'],
  leading: ['leadership', 'school-leadership', 'coaching', 'instructional coaching', 'coaching cycle', 'observation', 'instructional-rounds', 'instructional rounds', 'walkthrough', 'plc', 'mentoring', 'staff-culture', 'school-improvement', 'leadership team', 'staff-meeting', 'staff-meetings', 'staff meetings', 'retention', 'teacher-retention'],
  teacher_load: ['wellness', 'self-care', 'burnout', 'burnout-prevention', 'stress-management', 'stress-relief', 'workload', 'workload-management', 'boundaries', 'time-management', 'time-savers', 'sub-plans', 'substitute-plans', 'grading-workflow'],
  ai_technology: ['ai', 'ai-tools', 'ai-literacy', 'ai-policy', 'academic-integrity', 'digital-citizenship', 'device-management', 'classroom-technology', 'remote-learning'],
};

const WEAK = {
  paras: ['sped', 'special-education', 'iep-504', 'inclusion', 'specialists', 'specialist', 'accommodations', 'accommodation-log', 'autism', 'aac', 'AAC'],
  behavior: ['sel', 'social-emotional', 'classroom-routines', 'routines', 'daily-routines', 'transitions', 'procedures', 'classroom-culture', 'classroom-climate', 'classroom-environment', 'student-support', 'de-escalation', 'safety', 'classroom-safety', 'school-safety', 'sensory-break', 'intervention', 'morning-meeting', 'meetings'],
  instructional_planning: ['planning', 'pacing', 'small-group', 'small groups', 'grouping', 'stations', 'rotation', 'modeling', 'discussion', 'student-talk', 'student-voice', 'student ownership', 'reflection', 'engagement', 'exit tickets', 'formative-checks', 'data-driven', 'data', 'objectives', 'stem', 'STEM-integration', 'math-integration', 'literacy', 'early-childhood', 'ell', 'language-support', 'group-work', 'collaboration', 'responsive-teaching', 'relevance', 'differentiation', 'testing-anxiety', 'testing-season', 'lesson-planning'],
  first_weeks: ['routines', 'classroom-routines', 'procedures', 'transitions', 'classroom-supplies', 'first-day', 'welcome'],
  families: ['communication', 'email-templates', 'difficult-conversations', 'advocacy', 'community-engagement', 'community', 'volunteer-coordination', 'family-change', 'divorce-separation', 'military-family', 'housing-instability'],
  leading: ['facilitation', 'meeting agenda', 'staff meetings', 'team-building', 'team building', 'culture', 'morale', 'recognition', 'celebrations', 'professional-development', 'professional learning', 'data meetings', 'debrief', 'accountability', 'supervision', 'site-supervision', 'documentation'],
  teacher_load: ['productivity', 'efficiency', 'priorities', 'organization', 'mindset', 'resilience', 'gratitude', 'self-monitoring', 'substitute-teacher', 'end-of-year', 'holiday', 'seasonal', 'scheduling', 'workload'],
  ai_technology: ['technology', 'computers', 'tablets', 'ai-policy', 'equipment'],
};

/**
 * Held back from the buyer facing page on purpose.
 *
 * Trade and lab specific material, which does not represent the library to a
 * district, and four pieces written for people already inside TDI. Everything
 * else that scores nothing is a gap to be looked at, not a decision.
 */
const HOLD_TITLES = new Set([
  'Pitch It with Confidence: Recommending TDI to Your Admin',
  'When to Lean on Your TDI Team',
  'Funding PD that Actually Works... with an expert team',
  'Mastery Learning + TDI PD Model (2-Page Explainer)',
]);
const HOLD_TAGS = new Set([
  'welding', 'cosmetology', 'CTE', 'vocational', 'vocational-education',
  'lab-safety', 'hands-on-lab', 'chemistry', 'science-lab', 'science-fair', 'lab-report',
  'credential-translation', 'certification', 'credentials', 'industry',
]);

const SECTIONS = Object.keys(STRONG);

/**
 * Paras is not a topic, it is an audience.
 *
 * The other seven sections group by the problem a tool solves. This one groups
 * by who the tool was written for, and that beats subject matter: a redirection
 * guide written for paraprofessionals belongs with the para material, not in
 * the general behavior list, because the person looking for it is looking by
 * role. Scoring it like a topic emptied the section, which is the single most
 * differentiated thing in the library.
 *
 * Explicit para tags only. Special education and inclusion are not the same
 * thing: an IEP accommodation tracker written for a teacher is not a para tool.
 */
const PARA_AUDIENCE = STRONG.paras;

function scoreItem(tags) {
  const t = (tags || []).map((x) => String(x));
  const lower = new Set(t.map((x) => x.toLowerCase()));
  const has = (tag) => lower.has(String(tag).toLowerCase());

  const scores = {};
  for (const s of SECTIONS) {
    let n = 0;
    for (const tag of STRONG[s]) if (has(tag)) n += 3;
    for (const tag of WEAK[s]) if (has(tag)) n += 1;
    scores[s] = n;
  }
  return scores;
}

function bestOf(scores) {
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [top, topScore] = ranked[0];
  const [, second] = ranked[1];
  if (topScore === 0) return { section: null, confidence: 'none', topScore, margin: 0 };
  const margin = topScore - second;
  // A tie, or a one point margin between two sections, is not a decision a
  // machine should make on a sales page.
  const confidence = margin === 0 ? 'tied' : margin === 1 ? 'close' : 'clear';
  return { section: top, confidence, topScore, margin };
}

async function fetchAll(table, select, filter) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const url = `${URL_}/rest/v1/${table}?select=${select}&${filter}`;
    const res = await fetch(url, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Range: `${from}-${from + 999}` },
    });
    if (!res.ok) throw new Error(`${table} read failed: ${res.status} ${await res.text()}`);
    const page = await res.json();
    rows.push(...page);
    if (page.length < 1000) break;
  }
  return rows;
}

const quickWins = await fetchAll(
  'hub_quick_wins',
  'id,title,topic_tags,hub_section,quick_win_type',
  'is_published=eq.true'
);

const proposals = quickWins.map((row) => {
  const held = HOLD_TITLES.has(row.title) || (row.topic_tags || []).some((t) => HOLD_TAGS.has(t));
  const scores = scoreItem(row.topic_tags);
  const writtenForParas = (row.topic_tags || []).some((t) =>
    PARA_AUDIENCE.some((p) => p.toLowerCase() === String(t).toLowerCase())
  );

  let best = held
    ? { section: null, confidence: 'held', topScore: 0, margin: 0 }
    : writtenForParas
      ? { section: 'paras', confidence: 'audience', topScore: scores.paras, margin: 0 }
      : bestOf(scores);

  // A close score never moves an item that already has a home.
  //
  // A tie or a one point margin is not evidence, it is noise. Left to decide,
  // it wanted to move The First 10 Minutes Framework out of the first weeks on
  // a score of one against one, and Principal Playbook out of leading. The
  // point of this pass is to correct what is plainly wrong, not to churn 68
  // rows on arithmetic nobody would defend out loud.
  //
  // An item with no section at all is different: there, a weak signal still
  // beats being invisible, so it is proposed and flagged for a person to read.
  if (row.hub_section && best.section !== row.hub_section && best.margin < 2) {
    best = { section: row.hub_section, confidence: 'too close to move', topScore: best.topScore, margin: best.margin };
  }

  // A score never strips a section a person already set.
  //
  // The Creative Ideas series carries no topic tags at all, only the material
  // it uses, so it scores nothing. It is on the page because the health check
  // caught it missing and a person placed it. Letting the model pull it back
  // off would undo that silently, which is the whole failure this page is
  // built to avoid. The model may move an item or add one. It may not remove.
  if (!best.section && row.hub_section) {
    best = { section: row.hub_section, confidence: 'kept by hand', topScore: 0, margin: 0 };
  }
  return {
    id: row.id,
    title: row.title,
    type: row.quick_win_type,
    tags: row.topic_tags || [],
    now: row.hub_section,
    proposed: best.section,
    confidence: best.confidence,
    margin: best.margin,
    scores,
  };
});

const changed = proposals.filter((p) => p.now !== p.proposed);
const needsEye = proposals.filter((p) => p.confidence === 'tied' || p.confidence === 'close');
const gaps = proposals.filter((p) => p.confidence === 'none');

/**
 * --apply writes the changes through the content-sync API rather than straight
 * to the table, so every row goes through the same validation and read-back
 * the agents use, and a write that did not land reports itself.
 *
 * Needs a local dev server. It talks to the same Hub database either way.
 */
if (process.argv.includes('--apply')) {
  const base = process.env.SYNC_BASE || 'http://localhost:3000';
  const key = env.PAPERCLIP_SYNC_KEY;
  if (!key) throw new Error('PAPERCLIP_SYNC_KEY missing from .env.local');

  let ok = 0;
  const failures = [];
  for (const p of changed) {
    const res = await fetch(`${base}/api/hub/content-sync`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set_section', id: p.id, hub_section: p.proposed }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok && body.verified && body.hub_section === p.proposed) ok += 1;
    else failures.push(`${p.title}: ${body.error || JSON.stringify(body)}`);
  }

  console.log(`wrote and verified: ${ok} of ${changed.length}`);
  if (failures.length) {
    console.log('FAILED:');
    for (const f of failures) console.log(`  ${f}`);
    process.exit(1);
  }
} else if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ proposals, changed, needsEye, gaps }, null, 2));
} else {
  console.log(`published: ${proposals.length}`);
  console.log(`would change section: ${changed.length}`);
  console.log(`  onto the page (was off): ${changed.filter((p) => !p.now && p.proposed).length}`);
  console.log(`  off the page (was on):   ${changed.filter((p) => p.now && !p.proposed).length}`);
  console.log(`  moved between sections:  ${changed.filter((p) => p.now && p.proposed).length}`);
  console.log(`close calls a person should read: ${needsEye.length}`);
  console.log(`no tag evidence at all: ${gaps.length}`);
  console.log('');
  for (const s of SECTIONS) {
    const before = proposals.filter((p) => p.now === s).length;
    const after = proposals.filter((p) => p.proposed === s).length;
    console.log(`${s.padEnd(24)} ${String(before).padStart(3)} -> ${String(after).padStart(3)}`);
  }
}
