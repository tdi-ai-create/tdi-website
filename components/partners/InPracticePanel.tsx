'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  currentSteps,
  goalReading,
  stepSpread,
  STEPS,
  type Answer,
  type Assignment,
} from '@/lib/partners/assignments';

/**
 * In Practice. A leader assigns a Hub tool to named staff and has to say which
 * goal it serves.
 *
 * The agreement is docs/assignment-spec.md, rules A0 to A10. Rule ids below are
 * from it, and where a rule exists to prevent a failure this codebase has
 * already had, the failure is named.
 *
 * Every number shown here is computed in lib/partners/assignments.ts and
 * checked by npm run check:assignments. Nothing is computed inline, because the
 * two ways this hurts a school are both silent: a percentage wrong in a
 * plausible direction, and a teacher's words shown to somebody they did not
 * choose.
 */

export type PanelGoal = {
  id: string;
  kpi_label: string;
  status: string;
  target_value: number | null;
  target_unit?: string;
  measured_by_assignment?: boolean;
};

export type PanelPerson = {
  id: string;
  name: string;
  email?: string | null;
  role: string;
};

type Props = {
  partnershipId: string;
  orgName: string;
  userId: string;
  userEmail: string;
  goals: PanelGoal[];
  roster: PanelPerson[];
};

/** A1.1. Three open per person, counted across every leader, never per leader. */
const CAP = 3;

/** Above this many names a grid stops working and you have to search. */
const GRID_MAX = 12;

export default function InPracticePanel({
  partnershipId, orgName, userId, userEmail, goals, roster,
}: Props) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    const url = `/api/partners/assignments?partnershipId=${encodeURIComponent(partnershipId)}`
      + `&userId=${encodeURIComponent(userId)}&userEmail=${encodeURIComponent(userEmail)}`;
    fetch(url)
      .then(r => r.json())
      .then(d => {
        if (!live) return;
        if (d.error) { setLoadError(d.error); return; }
        setAssignments(d.assignments || []);
        setAnswers(d.answers || []);
      })
      .catch(e => live && setLoadError(String(e)))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [partnershipId, userId, userEmail]);

  const steps = useMemo(() => currentSteps(answers), [answers]);

  /**
   * A2.2. Only an accepted goal counts. Tidioute has three suggested and none
   * accepted, which is a blocked school rather than a school with goals.
   */
  const accepted = goals.filter(g => g.status === 'active');
  const suggested = goals.filter(g => g.status === 'suggested');

  /* ───────────────────── A10.1. The three blocked states ─────────────────────
     Never an empty tab. Each school is told the single thing that unblocks it,
     because an empty panel reads as the product being broken rather than as
     something specific being missing. */

  if (roster.length === 0) {
    return (
      <Blocked
        heading="There is nobody here to assign to yet"
        why={`Your goals are written and waiting. What is missing is the roster: no staff have been added to ${orgName}, so there is nobody for an assignment to reach.`}
        stepTitle="Send us your staff list"
        stepDetail="Names and school email addresses. We load it, everyone gets their Hub access, and this tab turns on the same day."
        rest="Nothing else about your partnership is waiting on this. Your goals, your plan and your reports are unaffected."
      />
    );
  }

  if (accepted.length === 0) {
    /**
     * A2.4b keeps the principle behind the goal wizard deleted on 24 September
     * 2026: a school with no accepted goal is not short of a text field, it is
     * short of an onboarding meeting. Rae's words in that commit: schools
     * without goals are schools without an onboarding meeting yet, which is not
     * something a button can solve.
     *
     * Tidioute is the shorter wait of the two, because three goals are already
     * written for them and accepting one opens this tab.
     */
    return suggested.length > 0 ? (
      <Blocked
        heading={`${suggested.length} goals are written for you. None are accepted yet`}
        why="Every assignment has to say which goal it serves, so your team is told why something landed on them. Yours are drafted and sitting here waiting on you, so this is a shorter wait than it looks."
        stepTitle="Accept one of these"
        stepDetail="Accepting one is enough to open this tab. You can accept the others later, and you can ask us to change the wording on any of them first."
        list={suggested.map(g => g.kpi_label)}
        rest="A goal that counts people rather than practice will not give this tab a number to read. It is still a real goal and an assignment can still name it."
      />
    ) : (
      <Blocked
        heading="Assigning starts with a goal, and yours are not written yet"
        why={`Every assignment here has to say which goal it serves, so your team is told why something landed on them rather than just being handed it. ${orgName} has no goals yet.`}
        stepTitle="Your onboarding meeting"
        stepDetail="Goals are not a form. Every goal we hold was written with a leader on a call, in their own words about their own building, and that conversation is the thing this is waiting on."
        rest={`${roster.length} ${roster.length === 1 ? 'person is' : 'people are'} on your roster already, so nothing is stopping them using the Hub in the meantime.`}
      />
    );
  }

  if (loading) return <Card><p style={sub}>Loading what has been assigned.</p></Card>;
  if (loadError) return <Card><p style={sub}>Could not load assignments: {loadError}</p></Card>;

  /* ───────────────────── Where things stand ───────────────────── */

  const open = assignments.filter(a => !a.closed_at);

  /**
   * Where things stand sits below the assign panel, and only once something has
   * been assigned.
   *
   * Rae, 2 October 2026, on seeing it live: we do not need this top section. She
   * was right, and emptier than unnecessary. With nothing assigned it rendered
   * three goals in a row each saying "Assignments do not move this number",
   * which is three identical caveats standing between a leader and the only
   * thing they opened the tab to do. A panel that reports on work nobody has
   * started is not a report, it is an obstacle.
   */
  const stand = open.length === 0 ? null : (
      <Card>
        <h3 style={h}>Where things stand</h3>
        <p style={sub}>
          Anything left of the dashed line has been read but not used with students yet.
        </p>

        {accepted.map(goal => {
          const mine = open.filter(a => a.goal_id === goal.id);
          const reading = goalReading(mine, steps, goal.measured_by_assignment === true);
          const spread = stepSpread(mine.filter(a => a.content_type !== 'quiz'), steps);

          return (
            <div key={goal.id} style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{goal.kpi_label}</span>
                <span style={{ fontSize: 13, color: '#6B7280' }}>
                  {mine.length} assigned
                  {goal.target_value !== null ? ` · target ${goal.target_value}${goal.target_unit || '%'}` : ''}
                </span>
              </div>

              {/**
                * A9.4. A goal TDI has not turned on shows a sentence rather than
                * a figure. It still carries the reason for an assignment.
                */}
              {reading.state === 'not_measured_this_way' && (
                <p style={{ ...note, background: '#FFF8E7', color: '#8a6d1f' }}>
                  Assignments do not move this number. It is measured another way.
                </p>
              )}

              {/* A5.4. Zero answered is not zero percent. It is unmeasured. */}
              {reading.state === 'unmeasured' && (
                <p style={note}>
                  {reading.assigned === 0
                    ? 'Nothing assigned against this goal yet.'
                    : `${reading.assigned} assigned, nobody has answered yet. That is unmeasured rather than zero.`}
                </p>
              )}

              {reading.state === 'collecting' && (
                <p style={note}>Still collecting. {reading.answered} of {reading.assigned} have answered.</p>
              )}

              {reading.state === 'measured' && (
                <>
                  <Bar counts={spread.counts} />
                  {/**
                    * A5.3a and L4.8. The percentage never appears without the
                    * number of people behind it. "100%" alone is a lie at one
                    * answer. "100%, 1 of 6 answered" is not.
                    */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 7, fontSize: 12.5, color: '#6B7280' }}>
                    <span>{reading.answered} of {reading.assigned} answered</span>
                    <span><b style={{ color: '#111827' }}>{reading.percent}%</b> in practice</span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </Card>
  );

  return (
    <div className="space-y-6">
      <Assign
        partnershipId={partnershipId}
        userId={userId}
        userEmail={userEmail}
        goals={accepted}
        roster={roster}
        openByEmail={countOpenByEmail(open)}
        onAssigned={a => setAssignments(prev => [...a, ...prev])}
      />

      {stand}

      <Card>
        <h3 style={h}>What your team is asked</h3>
        <p style={sub}>
          One question, four steps. Anything they add alongside is optional and they choose whether
          it stays with them, comes to you, or goes to the school without their name. A quiz asks
          none of this, because it is about them rather than their classroom.
        </p>
        <ol style={{ marginTop: 12, paddingLeft: 18, fontSize: 13.5, color: '#4B5563', lineHeight: 1.9 }}>
          {STEPS.map(s => <li key={s}>{s}</li>)}
        </ol>
      </Card>
    </div>
  );
}

/** A1.2. The cap is per recipient and shared across every leader. */
function countOpenByEmail(open: Assignment[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const a of open) out[a.recipient_email] = (out[a.recipient_email] || 0) + 1;
  return out;
}

/* ───────────────────────────── the assign flow ───────────────────────────── */

/**
 * The three ways in, and what each is good and bad at.
 *
 * Rae, 2 October 2026: a tab for the work, then three sub-tabs within it for
 * how to do the work, each showing the benefits and the risks before you
 * assign. The risks sit where the choice is being made rather than compressed
 * onto a card afterwards, because that is the only moment they can change
 * anything.
 *
 * One is always selected, so there is no closed state to get lost in.
 */
const DOORS = [
  {
    key: 'goal' as const,
    name: 'Start from a goal',
    why: 'You know which goal you are pushing on',
    encourages: 'You cannot reach a tool without passing through a goal, so the reason is built in rather than added afterwards. The goals with no reading sit in plain sight, which is a standing nudge to go and fix one.',
    risks: 'You cannot see how much any one person is already carrying until you reach the list of names, so this is the easiest of the three in which to overload somebody. The count on each name is there to catch it.',
    order: ['goal', 'tool', 'people'] as const,
  },
  {
    key: 'person' as const,
    name: 'Start from a person',
    why: 'You are thinking about one teacher',
    encourages: 'You see what that person is already carrying before you add to it, so it is the hardest of the three in which to overload somebody.',
    risks: 'The goal comes last, which is the point at which it is tempting to pick whichever one fits, so the reason can end up chosen to justify the tool rather than the other way round.',
    order: ['people', 'goal', 'tool'] as const,
  },
  {
    key: 'shared' as const,
    name: 'Start from shared time',
    why: 'A group works on it in the same meeting',
    encourages: 'Everybody gets the same thing at the same time, so the follow up conversation is one conversation rather than five separate ones.',
    risks: 'A group assignment hides the individual, so somebody already at their three can be swept in with everyone else. They are shown as full and cannot be selected.',
    order: ['goal', 'tool', 'people'] as const,
  },
];

type Item = {
  type: 'quickwin' | 'game' | 'course' | 'quiz';
  slug: string;
  title: string;
  category: string;
  effort: 'low' | 'medium' | 'high' | null;
  domains: string[];
  roles: string[];
};

const TYPE_WORD: Record<Item['type'], string> = {
  quickwin: 'Quick win', game: 'Game', course: 'Course', quiz: 'Quiz',
};
const EFFORT_WORD: Record<string, string> = { low: 'Grab & Go', medium: 'Short Prep', high: 'Deep Dive' };

function Assign({
  partnershipId, userId, userEmail, goals, roster, openByEmail, onAssigned,
}: {
  partnershipId: string;
  userId: string;
  userEmail: string;
  goals: PanelGoal[];
  roster: PanelPerson[];
  openByEmail: Record<string, number>;
  onAssigned: (a: Assignment[]) => void;
}) {
  const [door, setDoor] = useState<'goal' | 'person' | 'shared'>('goal');
  const [goalId, setGoalId] = useState('');
  const [chosen, setChosen] = useState<string[]>([]);
  const [nameQuery, setNameQuery] = useState('');
  const [plannedDate, setPlannedDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const [items, setItems] = useState<Item[]>([]);
  const [tool, setTool] = useState<Item | null>(null);
  const [kind, setKind] = useState<'all' | Item['type']>('all');
  const [category, setCategory] = useState('all');
  const [toolQuery, setToolQuery] = useState('');

  useEffect(() => {
    let live = true;
    fetch('/api/partners/assignable-content')
      .then(r => r.json())
      .then(d => { if (live && d.items) setItems(d.items); })
      .catch(() => {});
    return () => { live = false; };
  }, []);

  const current = DOORS.find(d => d.key === door)!;

  const categories = useMemo(
    () => [...new Set(items.filter(i => kind === 'all' || i.type === kind).map(i => i.category))].sort(),
    [items, kind],
  );

  const visibleTools = useMemo(() => items.filter(i =>
    (kind === 'all' || i.type === kind)
    && (category === 'all' || i.category === category)
    && (!toolQuery || i.title.toLowerCase().includes(toolQuery.toLowerCase()))
  ), [items, kind, category, toolQuery]);

  const withEmail = roster.filter(p => p.email);
  const matchingPeople = nameQuery
    ? withEmail.filter(p => p.name.toLowerCase().includes(nameQuery.toLowerCase()))
    : withEmail;
  const big = withEmail.length > GRID_MAX;

  const goal = goals.find(g => g.id === goalId);
  const ready = !!goalId && !!tool && chosen.length > 0;

  async function send() {
    if (!tool) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch('/api/partners/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnershipId, userId, userEmail,
          goalId,
          recipients: chosen,
          contentType: tool.type,
          contentSlug: tool.slug,
          contentTitle: tool.title,
          plannedDate: plannedDate || null,
        }),
      });
      const d = await res.json();
      // Never report success before the database has accepted it.
      if (!res.ok) { setResult(d.error || 'That did not go through.'); return; }
      onAssigned(d.assignments || []);
      setResult(`Assigned to ${d.created} ${d.created === 1 ? 'person' : 'people'}.`);
      setChosen([]);
      setTool(null);
    } catch (e) {
      setResult(String(e));
    } finally {
      setBusy(false);
    }
  }

  /* ---- the three steps, rendered in whichever order this door wants ---- */

  const stepGoal = (
    <div key="goal" style={{ marginTop: 18 }}>
      <Label>The goal</Label>
      <select value={goalId} onChange={e => setGoalId(e.target.value)} style={input}>
        <option value="">Choose a goal</option>
        {goals.map(g => (
          <option key={g.id} value={g.id}>
            {g.kpi_label}{g.measured_by_assignment === true ? '' : ' (measured another way)'}
          </option>
        ))}
      </select>
      {goal && goal.measured_by_assignment !== true && (
        <p style={{ ...note, background: '#FFF8E7', color: '#8a6d1f' }}>
          This assignment will carry the reason, so your team is told why it landed on them. It
          will not move this goal&apos;s number, which is measured another way.
        </p>
      )}
    </div>
  );

  const stepTool = (
    <div key="tool" style={{ marginTop: 18 }}>
      <Label>The tool</Label>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {(['all', 'quickwin', 'game', 'course', 'quiz'] as const).map(k => (
          <button
            key={k} type="button"
            onClick={() => { setKind(k); setCategory('all'); }}
            style={{
              font: 'inherit', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              padding: '6px 12px', borderRadius: 999, border: '1px solid transparent',
              background: kind === k ? '#1e2749' : '#EEF1F5',
              color: kind === k ? '#fff' : '#1a1f4e',
            }}
          >
            {k === 'all' ? 'Everything' : k === 'quickwin' ? 'Quick Wins' : k === 'game' ? 'Games' : k === 'course' ? 'Courses' : 'Quizzes'}
            {k !== 'all' && <span style={{ opacity: .6, marginLeft: 5 }}>{items.filter(i => i.type === k).length}</span>}
          </button>
        ))}
      </div>

      {kind === 'quiz' && (
        <p style={{ ...sub, marginTop: 0 }}>
          A quiz asks your team nothing afterwards. It is culture building, so you see how many took
          it and the spread across your staff, never who got which result.
        </p>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        <input
          value={toolQuery}
          onChange={e => setToolQuery(e.target.value)}
          placeholder="Search by name"
          style={{ ...input, flex: '1 1 220px', maxWidth: 300 }}
        />
        <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...input, flex: '0 1 240px' }}>
          <option value="all">Every category</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <p style={{ ...sub, marginTop: 0, fontSize: 12.5 }}>
        Showing {visibleTools.length} of {items.length}.
      </p>

      <div style={{ maxHeight: 320, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 7, marginTop: 8 }}>
        {visibleTools.slice(0, 60).map(i => {
          const on = tool?.slug === i.slug && tool?.type === i.type;
          return (
            <button
              key={i.type + i.slug} type="button"
              onClick={() => setTool(on ? null : i)}
              style={{
                textAlign: 'left', padding: '10px 12px', borderRadius: 10, background: '#fff',
                border: on ? '1px solid #1e2749' : '1px solid #E5E7EB',
                boxShadow: on ? 'inset 0 0 0 1px #1e2749' : 'none', cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: 13.6, fontWeight: 600, color: '#111827', lineHeight: 1.35 }}>{i.title}</div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                {TYPE_WORD[i.type]} &middot; {i.category}
                {i.effort ? ` · ${EFFORT_WORD[i.effort]}` : ''}
              </div>
            </button>
          );
        })}
      </div>
      {visibleTools.length > 60 && (
        <p style={{ ...sub, fontSize: 12.5 }}>{visibleTools.length - 60} more. Search or narrow the category.</p>
      )}
    </div>
  );

  const stepPeople = (
    <div key="people" style={{ marginTop: 18 }}>
      <Label>The people</Label>
      <p style={{ ...sub, marginTop: 0 }}>
        The number beside a name is what that person already has open. Three is the cap, and it is
        theirs rather than yours: two leaders assigning to the same person share it.
      </p>
      {big && (
        <input
          value={nameQuery}
          onChange={e => setNameQuery(e.target.value)}
          placeholder={`Search ${withEmail.length} names`}
          style={{ ...input, marginBottom: 10 }}
        />
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 7 }}>
        {matchingPeople.slice(0, nameQuery ? matchingPeople.length : 30).map(p => {
          const email = (p.email || '').toLowerCase();
          const openCount = openByEmail[email] || 0;
          const full = openCount >= CAP;
          const on = chosen.includes(email);
          return (
            <button
              key={p.id} type="button" disabled={full}
              title={full ? 'Already has three open. Close one of theirs first.' : undefined}
              onClick={() => setChosen(c => c.includes(email) ? c.filter(x => x !== email) : [...c, email])}
              style={{
                textAlign: 'left', padding: '8px 10px', borderRadius: 9, background: '#fff',
                border: on ? '1px solid #1e2749' : '1px solid #E5E7EB',
                boxShadow: on ? 'inset 0 0 0 1px #1e2749' : 'none',
                opacity: full ? 0.5 : 1, cursor: full ? 'not-allowed' : 'pointer',
                display: 'flex', gap: 8, alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 13.2, color: '#111827' }}>{p.name}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#6B7280' }}>
                {full ? 'full' : openCount > 0 ? `${openCount} open` : p.role}
              </span>
            </button>
          );
        })}
      </div>
      {!nameQuery && matchingPeople.length > 30 && (
        <p style={{ ...sub, fontSize: 12.5 }}>{matchingPeople.length - 30} more. Search by name to reach them.</p>
      )}
    </div>
  );

  const steps = { goal: stepGoal, tool: stepTool, people: stepPeople };

  return (
    <Card>
      <h3 style={h}>Assign a tool</h3>
      <p style={sub}>
        Three ways in. Open any one to see what it is good at, what it risks, and to assign from
        there. They all end in the same place, so pick whichever matches what you are already
        thinking about.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 10, marginTop: 14 }}>
        {DOORS.map((d, i) => {
          const on = d.key === door;
          return (
            <button
              key={d.key} type="button" onClick={() => setDoor(d.key)}
              style={{
                textAlign: 'left', padding: '13px 15px', borderRadius: 12, cursor: 'pointer',
                background: on ? '#fff' : '#f5f5f5',
                border: on ? '2px solid #FFBA06' : '1px solid #e5e7eb',
                boxShadow: on ? '0 1px 2px rgba(0,0,0,.05)' : 'none',
                display: 'flex', gap: 11, alignItems: 'flex-start',
              }}
            >
              <span style={{
                flex: 'none', width: 22, height: 22, borderRadius: 7, display: 'grid',
                placeItems: 'center', fontSize: 12, fontWeight: 700,
                background: on ? '#FFBA06' : '#e5e7eb', color: on ? '#1e2749' : '#6B7280',
              }}>{i + 1}</span>
              <span>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 650, color: '#111827' }}>{d.name}</span>
                <span style={{ display: 'block', fontSize: 12.5, color: '#6B7280', marginTop: 2 }}>{d.why}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginTop: 16 }}>
        <div style={{ background: '#EEF5F1', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', fontWeight: 700, color: '#2A9D8F' }}>
            What this encourages
          </div>
          <p style={{ fontSize: 13.5, color: '#374151', marginTop: 7, lineHeight: 1.6 }}>{current.encourages}</p>
        </div>
        <div style={{ background: '#FFF8E7', borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', fontWeight: 700, color: '#8a6d1f' }}>
            What it risks
          </div>
          <p style={{ fontSize: 13.5, color: '#374151', marginTop: 7, lineHeight: 1.6 }}>{current.risks}</p>
        </div>
      </div>

      {current.order.map(k => steps[k])}

      <div style={{ marginTop: 18 }}>
        <Label>Shared time</Label>
        {/* A3.1. Never labelled as a due date, because nothing comes due. */}
        <p style={{ ...sub, marginTop: 0 }}>
          Optional. When your staff plan to work on it together. It is not a deadline, nothing comes
          due, and nobody is marked late.
        </p>
        <input type="date" value={plannedDate} onChange={e => setPlannedDate(e.target.value)} style={input} />
      </div>

      <div style={{ ...note, marginTop: 18 }}>
        {ready && tool && goal
          ? <>You are assigning <b>{tool.title}</b> to {chosen.length} {chosen.length === 1 ? 'person' : 'people'},
            because of your goal <b>{goal.kpi_label}</b>.
            {tool.type === 'quiz'
              ? ' Nothing is asked of them afterwards, because a quiz is about them rather than their classroom.'
              : ' Ten days after they answer, they are asked once whether they have used it.'}
            {plannedDate ? ' They will be told the team plans to work on it around that date, and that it is not a deadline.' : ' No shared date, so nothing is scheduled and nothing comes due.'}</>
          : <>Still to pick: {[!goalId && 'a goal', !tool && 'something to assign', chosen.length === 0 && 'at least one person'].filter(Boolean).join(', ')}.</>}
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 9, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button" disabled={!ready || busy} onClick={send}
          style={{
            background: ready && !busy ? '#FFBA06' : '#E5E7EB',
            color: ready && !busy ? '#1e2749' : '#9CA3AF',
            border: 'none', borderRadius: 9, padding: '9px 16px',
            fontSize: 14, fontWeight: 600, cursor: ready && !busy ? 'pointer' : 'not-allowed',
          }}
        >
          {busy ? 'Assigning' : 'Assign'}
        </button>
        {result && <span style={{ fontSize: 13, color: '#4B5563' }}>{result}</span>}
      </div>
    </Card>
  );
}

/* ───────────────────────────── small pieces ───────────────────────────── */

const h = { fontSize: 16, fontWeight: 600, color: '#111827' } as const;
const sub = { fontSize: 13.5, color: '#6B7280', marginTop: 6, lineHeight: 1.6, maxWidth: '72ch' } as const;
const note = { fontSize: 12.5, color: '#6B7280', marginTop: 9, borderRadius: 8, padding: '9px 11px', background: '#F9FAFB', lineHeight: 1.55 } as const;
const input = { font: 'inherit', fontSize: 14, padding: '8px 11px', border: '1px solid #E5E7EB', borderRadius: 9, background: '#fff', color: '#111827', width: '100%', maxWidth: 460 } as const;

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100" style={{ padding: 22 }}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', fontWeight: 700, color: '#38618C', marginBottom: 7 }}>
      {children}
    </div>
  );
}

function Blocked({ heading, why, stepTitle, stepDetail, rest, list }: {
  heading: string; why: string; stepTitle: string; stepDetail: string; rest: string; list?: string[];
}) {
  return (
    <Card>
      <h3 style={h}>{heading}</h3>
      <p style={sub}>{why}</p>
      <div style={{ marginTop: 16, background: '#FFF8E7', border: '1px solid #f0dca8', borderRadius: 12, padding: '15px 17px', maxWidth: '68ch' }}>
        <div style={{ fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', fontWeight: 700, color: '#8a6d1f' }}>
          The one thing that unblocks this
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, marginTop: 6, color: '#111827' }}>{stepTitle}</div>
        <div style={{ fontSize: 13.5, color: '#4B5563', marginTop: 6, lineHeight: 1.6 }}>{stepDetail}</div>
      </div>
      {list && (
        <div style={{ marginTop: 13, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: '68ch' }}>
          {list.map(l => (
            <div key={l} style={{ border: '1px solid #E5E7EB', borderRadius: 10, padding: '11px 13px', fontSize: 13.8, color: '#111827' }}>
              {l}
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Suggested by TDI, not yet accepted</div>
            </div>
          ))}
        </div>
      )}
      <p style={{ ...sub, marginTop: 18 }}>{rest}</p>
    </Card>
  );
}

/** The four step bar. Counts only, never names. */
function Bar({ counts }: { counts: [number, number, number, number] }) {
  const total = counts.reduce((a, b) => a + b, 0);
  if (total === 0) return null;
  const colors = ['#EEF1F5', '#CBD9F2', '#9CB8E4', '#1e2749'];
  const notStarted = ((counts[0] + counts[1]) / total) * 100;
  return (
    <div style={{ position: 'relative', marginTop: 11 }}>
      <div style={{ display: 'flex', height: 22, borderRadius: 999, overflow: 'hidden' }}>
        {counts.map((n, i) => n === 0 ? null : (
          <div key={i} style={{
            width: `${(n / total) * 100}%`, background: colors[i],
            color: i === 3 ? '#fff' : '#374151', fontSize: 11, fontWeight: 600,
            display: 'grid', placeItems: 'center',
          }}>{n}</div>
        ))}
      </div>
      {/* Where a classroom starts. Everything left of it was read, not used. */}
      <div style={{ position: 'absolute', top: -3, bottom: -3, left: `${notStarted}%`, width: 2, background: '#FFBA06' }} />
    </div>
  );
}
