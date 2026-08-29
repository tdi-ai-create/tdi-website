import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';

/**
 * What needs a person, ranked.
 *
 * The admin portal could show you every creator and never tell you that Katie
 * Welch had been waiting on us for nineteen days. Six tabs, ninety one pieces
 * of state, and no screen that answered "what do I do now".
 *
 * This is that screen's data. Four groups, because there are four genuinely
 * different kinds of problem:
 *
 *   blocked_on_us  they cannot move until we do something
 *   overdue        their clock has run out
 *   data_issue     the row disagrees with the world
 *   no_clock       open, but invisible to every reminder
 *
 * Read only on purpose. Every row carries a link to where the action already
 * lives, so a first version cannot write anything wrong.
 */

export const dynamic = 'force-dynamic';

type Row = {
  creatorId: string;
  recordId: string;
  stepStatus: string;
  name: string;
  status: string | null;
  contentPath: string | null;
  step: string;
  ours: boolean;
  reviewStatus: string | null;
  submitted: boolean;
  days: number | null;
  dueOn: string | null;
  href: string;
};

export async function GET() {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const [creatorsRes, stepsRes] = await Promise.all([
    supabase.from('creators').select('id, name, status, content_path'),
    supabase
      .from('creator_milestones')
      .select('id, creator_id, status, review_status, opened_at, due_on, milestones(name, requires_team_action)')
      // Both statuses, not just available. waiting_approval means they have
      // handed something in and are waiting on us, which is the most blocked a
      // creator can be. Querying only available hid Amy Storer and Catherine
      // Dorian, three and eight days in, while the Action Center listed both.
      // Two screens disagreeing about what needs us is the exact failure this
      // queue exists to end.
      .in('status', ['available', 'waiting_approval']),
  ]);

  if (creatorsRes.error) {
    return NextResponse.json({ error: `Reading creators failed: ${creatorsRes.error.message}` }, { status: 500 });
  }
  if (stepsRes.error) {
    return NextResponse.json({ error: `Reading open steps failed: ${stepsRes.error.message}` }, { status: 500 });
  }

  const creators = creatorsRes.data || [];
  const byId = new Map(creators.map((c) => [c.id, c]));

  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);

  const rows: Row[] = (stepsRes.data || []).map((s) => {
    const c = byId.get(s.creator_id);
    // Supabase types the joined row as an array when it cannot prove the
    // relationship is to-one. It is to-one here.
    const m = (Array.isArray(s.milestones) ? s.milestones[0] : s.milestones) as
      | { name?: string; requires_team_action?: boolean }
      | undefined;
    const submitted = s.review_status === 'submitted';
    return {
      creatorId: s.creator_id,
      recordId: s.id,
      stepStatus: s.status,
      name: c?.name || 'Unknown creator',
      status: c?.status ?? null,
      contentPath: c?.content_path ?? null,
      step: m?.name || 'Unnamed step',
      // Ours if the step is one we own, or if they have handed something in
      // and are waiting to hear back. The second half is the case the first
      // version missed.
      ours: Boolean(m?.requires_team_action) || s.status === 'waiting_approval' || submitted,
      submitted,
      reviewStatus: s.review_status ?? null,
      days: s.opened_at ? Math.floor((now - new Date(s.opened_at).getTime()) / 86400000) : null,
      dueOn: s.due_on ?? null,
      href: `/tdi-admin/creators/${s.creator_id}`,
    };
  });

  // Longest wait first inside every group. A row with no clock has waited an
  // unknown amount of time, which is its own problem, so it sorts last rather
  // than first.
  const byWait = (a: Row, b: Row) => (b.days ?? -1) - (a.days ?? -1);

  // A creator who is not active has no business holding an open step. That is
  // checked before anything else, so a withdrawn person never shows up in a
  // list of people to chase.
  const dataIssue = rows.filter((r) => r.status !== 'active').sort(byWait);
  const rest = rows.filter((r) => r.status === 'active');

  const blockedOnUs = rest.filter((r) => r.ours).sort(byWait);
  const notOurs = rest.filter((r) => !r.ours);

  const overdue = notOurs.filter((r) => r.dueOn && r.dueOn < today).sort(byWait);
  const noClock = notOurs
    .filter((r) => !r.dueOn && r.days === null)
    .sort((a, b) => a.name.localeCompare(b.name));

  const accountedFor = new Set([...blockedOnUs, ...overdue, ...noClock, ...dataIssue].map((r) => r.recordId));
  const moving = rows.filter((r) => !accountedFor.has(r.recordId)).sort(byWait);

  return NextResponse.json({
    groups: {
      blocked_on_us: blockedOnUs,
      overdue,
      data_issue: dataIssue,
      no_clock: noClock,
    },
    moving,
    counts: {
      needsSomeone: blockedOnUs.length + overdue.length + dataIssue.length + noClock.length,
      openSteps: rows.length,
      activeCreators: creators.filter((c) => c.status === 'active').length,
    },
  });
}
