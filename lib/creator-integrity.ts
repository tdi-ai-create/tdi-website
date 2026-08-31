// ---------------------------------------------------------------------------
// Creator integrity checks: places where two sources disagree
//
// The Creator Command Center already answers "who is waiting on us", from
// `waitingOn`. That question cannot catch a record that is lying, because when
// the data is wrong nobody appears to be waiting. In August 2026 two creators
// were published in April, a write on 08-13 marked their milestone complete,
// and they silently dropped off the needs-attention list. The portal then told
// them we were editing a post they had never sent, and the agreement gate
// closed one of them with "never completed anything".
//
// These checks ask a different question: which records contradict themselves,
// or contradict something we can verify independently. One module, used by both
// the admin panel and the weekly report, so the screen and the Slack message can
// never disagree. Same reasoning as lib/agreement-gate.ts.
// ---------------------------------------------------------------------------

export type IntegrityCheckId =
  | 'draft_not_recorded'
  | 'publish_mismatch'
  | 'agreement_contradiction'
  | 'closed_but_submitted'
  | 'completed_without_date';

/** A per-creator finding. Someone should open this record and look. */
export interface IntegrityFinding {
  checkId: IntegrityCheckId;
  creatorId: string;
  name: string | null;
  email: string | null;
  /** What disagrees, in a sentence, so the row is actionable without digging. */
  detail: string;
}

/**
 * A system-level finding. Not about one creator, so it renders as a single
 * line rather than N rows. completed_without_date currently matches 18 of the
 * roster, and 18 identical rows is noise, not a signal.
 */
export interface IntegritySystemFinding {
  checkId: IntegrityCheckId;
  detail: string;
  count: number;
  creatorsAffected: number;
}

export interface IntegrityReport {
  findings: IntegrityFinding[];
  system: IntegritySystemFinding[];
  checkedAt: string;
}

const BLOG_SUBMIT_MARKER = 'Link submitted for Draft Your Blog Post';
const GATE_CLOSURE_MARKER = 'Closed by the agreement gate';

interface CreatorRow {
  id: string;
  name: string | null;
  email: string | null;
  agreement_signed: boolean | null;
  published_date: string | null;
}

interface MilestoneRow {
  creator_id: string;
  milestone_id: string;
  status: string | null;
  completed_at: string | null;
  submitted_value: string | null;
}

interface NoteRow {
  creator_id: string;
  content: string | null;
}

/**
 * Runs every check. Read-only: this never writes, and never emails. It reports
 * what disagrees and leaves the judgement to a person.
 */
export async function runIntegrityChecks(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  now: Date = new Date()
): Promise<IntegrityReport> {
  const [{ data: creators }, { data: milestones }, { data: notes }] = await Promise.all([
    supabase.from('creators').select('id, name, email, agreement_signed, published_date'),
    supabase
      .from('creator_milestones')
      .select('creator_id, milestone_id, status, completed_at, submitted_value'),
    supabase.from('creator_notes').select('creator_id, content'),
  ]);

  const creatorRows: CreatorRow[] = creators || [];
  const milestoneRows: MilestoneRow[] = milestones || [];
  const noteRows: NoteRow[] = notes || [];

  // Milestones are per project, and a creator can have several. Katie Welch is
  // on her second: the first drafted and published, the second is still locked.
  //
  // Everything these checks compare against lives at CREATOR level. A note in
  // creator_notes, a published_date, an agreement_signed flag. So the milestone
  // side has to be read at creator level too, meaning "has this ever been
  // completed on any project", not "is it complete on one particular project".
  //
  // Reading a single project's row against a creator-level fact reported Katie
  // as "draft not recorded" on the day this shipped, which was wrong. A checker
  // that cries wolf gets ignored, which is the failure this exists to prevent.
  const everCompleted = (creatorId: string, milestoneId: string) =>
    milestoneRows.some(
      (m) => m.creator_id === creatorId && m.milestone_id === milestoneId && m.status === 'completed'
    );

  const everCompletedWithDate = (creatorId: string, milestoneId: string) =>
    milestoneRows.some(
      (m) => m.creator_id === creatorId && m.milestone_id === milestoneId && !!m.completed_at
    );

  const hasNote = (creatorId: string, marker: string) =>
    noteRows.some((n) => n.creator_id === creatorId && (n.content || '').includes(marker));

  const findings: IntegrityFinding[] = [];
  const push = (checkId: IntegrityCheckId, c: CreatorRow, detail: string) =>
    findings.push({ checkId, creatorId: c.id, name: c.name, email: c.email, detail });

  for (const c of creatorRows) {
    // 1. They sent us a draft and the milestone never recorded it.
    //
    // The link lands in creator_notes, not on the milestone. submitted_value is
    // empty for blog_drafted on nearly every creator, so an empty field there is
    // not evidence that nothing was submitted. This is the check that would have
    // caught Kim Lohse and Dr. Nardi in March.
    if (hasNote(c.id, BLOG_SUBMIT_MARKER) && !everCompleted(c.id, 'blog_drafted')) {
      push('draft_not_recorded', c, 'Draft link is in their notes but no blog_drafted milestone is complete');
    }

    // 2. The two records of "published" disagree.
    const milestoneSaysPublished = everCompleted(c.id, 'blog_published');
    const creatorSaysPublished = !!c.published_date;
    if (milestoneSaysPublished !== creatorSaysPublished) {
      push(
        'publish_mismatch',
        c,
        creatorSaysPublished
          ? 'published_date is set but the blog_published milestone is not complete'
          : 'blog_published is complete but the creator record has no published_date'
      );
    }

    // 3. The agreement milestone says signed, the creator record says not.
    //
    // sign-agreement writes agreement_signed, _at and _name together and only
    // then completes the milestone, so this combination cannot come from a real
    // signature. It comes from approving the milestone by hand, which makes an
    // unsigned creator look signed.
    if (everCompletedWithDate(c.id, 'agreement_sign') && !c.agreement_signed) {
      push('agreement_contradiction', c, 'agreement_sign milestone is complete but agreement_signed is false');
    }

    // 4. We closed them, and they had actually sent us work.
    if (hasNote(c.id, GATE_CLOSURE_MARKER) && hasNote(c.id, BLOG_SUBMIT_MARKER)) {
      push('closed_but_submitted', c, 'Closed by the agreement gate despite having submitted a blog draft');
    }
  }

  // 5. Completed with no date. System level on purpose: this matches most of
  // the roster, and one line is a signal where eighteen rows is noise. It is
  // here because a null completed_at is what made the agreement gate read
  // finished work as "never completed anything".
  const undated = milestoneRows.filter((m) => m.status === 'completed' && !m.completed_at);
  const undatedCreators = new Set(undated.map((m) => m.creator_id));
  const system: IntegritySystemFinding[] = [];
  if (undated.length > 0) {
    system.push({
      checkId: 'completed_without_date',
      detail: 'Milestones marked completed with no completed_at. Anything reading completion by date cannot see this work.',
      count: undated.length,
      creatorsAffected: undatedCreators.size,
    });
  }

  return { findings, system, checkedAt: now.toISOString() };
}

/** One line per check, for Slack. Empty string when everything is clean. */
export function formatIntegritySummary(report: IntegrityReport): string {
  const lines: string[] = [];

  const labels: Record<IntegrityCheckId, string> = {
    draft_not_recorded: 'Draft submitted but not recorded',
    publish_mismatch: 'Publication records disagree',
    agreement_contradiction: 'Agreement milestone complete but unsigned',
    closed_but_submitted: 'Closed despite having submitted work',
    completed_without_date: 'Milestones completed with no date',
  };

  const grouped = new Map<IntegrityCheckId, IntegrityFinding[]>();
  for (const f of report.findings) {
    const arr = grouped.get(f.checkId) || [];
    arr.push(f);
    grouped.set(f.checkId, arr);
  }

  for (const [checkId, items] of grouped) {
    const who = items.map((i) => i.name || i.email || i.creatorId).join(', ');
    lines.push(`${labels[checkId]}: ${items.length} (${who})`);
  }

  for (const s of report.system) {
    lines.push(`${labels[s.checkId]}: ${s.count} across ${s.creatorsAffected} creators`);
  }

  return lines.join('\n');
}
