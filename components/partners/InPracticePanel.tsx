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

  return (
    <div className="space-y-6">
      <Card>
        <h3 style={h}>Where things stand</h3>
        {open.length === 0 ? (
          <p style={sub}>
            Nothing has been assigned yet. Once something is, every goal you assign against shows
            how far your team has got with it, from read it to using it regularly.
          </p>
        ) : (
          <p style={sub}>
            Anything left of the dashed line has been read but not used with students yet.
          </p>
        )}

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

      <Assign
        partnershipId={partnershipId}
        userId={userId}
        userEmail={userEmail}
        goals={accepted}
        roster={roster}
        openByEmail={countOpenByEmail(open)}
        onAssigned={a => setAssignments(prev => [...a, ...prev])}
      />

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
  const [goalId, setGoalId] = useState<string>('');
  const [chosen, setChosen] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [plannedDate, setPlannedDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const withEmail = roster.filter(p => p.email);
  const matching = query
    ? withEmail.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : withEmail;

  const big = withEmail.length > GRID_MAX;

  async function send() {
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
          // Placeholder until the picker lands. The route refuses anything that
          // is not one of the four types, so this cannot become a silent path.
          contentType: 'quickwin',
          contentSlug: 'no-hands-up-help-systems',
          contentTitle: 'No-Hands-Up Help Systems',
          plannedDate: plannedDate || null,
        }),
      });
      const d = await res.json();
      // Never report success before the database has accepted it.
      if (!res.ok) { setResult(d.error || 'That did not go through.'); return; }
      onAssigned(d.assignments || []);
      setResult(`Assigned to ${d.created} ${d.created === 1 ? 'person' : 'people'}.`);
      setChosen([]);
    } catch (e) {
      setResult(String(e));
    } finally {
      setBusy(false);
    }
  }

  const ready = goalId && chosen.length > 0;

  return (
    <Card>
      <h3 style={h}>Assign a tool</h3>
      <p style={sub}>
        Pick the goal first, so the reason is built in rather than added afterwards.
      </p>

      <div style={{ marginTop: 14 }}>
        <Label>The goal</Label>
        <select
          value={goalId}
          onChange={e => setGoalId(e.target.value)}
          style={input}
        >
          <option value="">Choose a goal</option>
          {goals.map(g => (
            <option key={g.id} value={g.id}>
              {g.kpi_label}
              {g.measured_by_assignment === true ? '' : ' (measured another way)'}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: 16 }}>
        <Label>The people</Label>
        <p style={{ ...sub, marginTop: 0 }}>
          The number beside a name is what that person already has open. Three is the cap, and it is
          theirs rather than yours: two leaders assigning to the same person share it.
        </p>

        {big && (
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={`Search ${withEmail.length} names`}
            style={{ ...input, marginBottom: 10 }}
          />
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 7 }}>
          {matching.slice(0, query ? matching.length : 30).map(p => {
            const email = (p.email || '').toLowerCase();
            const openCount = openByEmail[email] || 0;
            const full = openCount >= CAP;
            const on = chosen.includes(email);
            return (
              <button
                key={p.id}
                type="button"
                disabled={full}
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

        {!query && matching.length > 30 && (
          <p style={{ ...sub, fontSize: 12.5 }}>
            {matching.length - 30} more. Search by name to reach them.
          </p>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <Label>Shared time</Label>
        {/* A3.1. Never labelled as a due date, because nothing comes due. */}
        <p style={{ ...sub, marginTop: 0 }}>
          Optional. When your staff plan to work on it together. It is not a deadline, nothing comes
          due, and nobody is marked late.
        </p>
        <input type="date" value={plannedDate} onChange={e => setPlannedDate(e.target.value)} style={input} />
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 9, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          disabled={!ready || busy}
          onClick={send}
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
