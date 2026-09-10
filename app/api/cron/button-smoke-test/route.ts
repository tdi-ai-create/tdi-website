import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { guardCron } from '@/lib/cron-guard';
import { postCreatorMessage } from '@/lib/creator-slack';

// ---------------------------------------------------------------------------
// Press the buttons.
//
// Approve, Request changes and Mark complete were broken on the admin creator
// page from 31 August to 8 September. Nothing static caught it: the page sent
// creator_milestones.id where the routes look up milestones.id, and both are
// typed string. Every dry run in that window checked the buttons rendered and
// deliberately did not press them, because pressing meant approving a real
// creator's work. Rendering was all it proved. Bella found the rest.
//
// So this presses them, nightly, against the sandbox creator. Jessica Torres is
// archived and paused, which excludes her from every board, sweep, digest and
// count, so nothing here touches a real person or reaches anyone's inbox.
//
// It asserts the outcome in the database rather than the response code. A 200
// is not proof, and that rule exists because a delete handler here once reported
// success whether or not it deleted anything.
//
// It also sends one deliberately wrong payload, a record id where a step key
// belongs, and requires the route to refuse it with a named error. That is the
// exact shape of the September break, so the guard against it is itself tested
// rather than assumed.
//
// Silent when everything works. Speaks to #rae-actions when a button stops.
// ---------------------------------------------------------------------------

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SANDBOX_EMAIL = 'demo.creator@teachersdeserveit.com';
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.teachersdeserveit.com';

/** The board state the reset script leaves, and that this test depends on. */
const IN_REVIEW_STEP = 'recording_completed';
const OPEN_STEP = 'recording_started';

interface Check {
  name: string;
  ok: boolean;
  detail: string;
}

export async function GET(request: NextRequest) {
  const guard = guardCron(request);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status ?? 401 });
  }
  const { dryRun } = guard;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const checks: Check[] = [];
  const add = (name: string, ok: boolean, detail: string) => checks.push({ name, ok, detail });

  // The sandbox must be archived. If somebody reactivated her, stop: every
  // assumption about this being safe rests on her being excluded from
  // everything.
  const { data: creator, error: creatorErr } = await supabase
    .from('creators')
    .select('id, name, status, lifecycle_state')
    .eq('email', SANDBOX_EMAIL)
    .maybeSingle();

  if (creatorErr || !creator) {
    return NextResponse.json(
      { success: false, error: `Sandbox creator not found (${SANDBOX_EMAIL}). Nothing was pressed.` },
      { status: 500 },
    );
  }
  if (creator.status !== 'archived') {
    return NextResponse.json(
      {
        success: false,
        error: `Sandbox creator is "${creator.status}", not archived. Refusing to press write buttons against a live creator.`,
      },
      { status: 409 },
    );
  }

  if (dryRun) {
    return NextResponse.json({
      success: true,
      dryRun: true,
      wouldPress: ['approve-milestone', 'request-revision', 'approve-milestone (wrong id)'],
      against: { creator: creator.name, step_in_review: IN_REVIEW_STEP, open_step: OPEN_STEP },
      note: 'Nothing pressed. A dry run here proves only that the sandbox is present and archived.',
    });
  }

  // round: 0 matters as much as the status.
  //
  // Feedback is deliberately capped at two rounds, after which Request changes
  // approves instead of opening a third. The first version of this reset moved
  // status and review_status and left the counter alone, so after two runs the
  // sandbox was permanently capped, the route did exactly the right thing, and
  // this job reported "a write button has stopped working" every morning.
  //
  // It did that on its first production run, 10 September, and it was wrong.
  // A check that cries wolf daily is worse than no check, because the morning
  // it is right is the morning it gets skimmed.
  const reset = async () => {
    const rows = [
      { milestone_id: IN_REVIEW_STEP, status: 'waiting_approval', review_status: 'submitted' },
      { milestone_id: OPEN_STEP, status: 'available', review_status: null },
    ];
    for (const r of rows) {
      const { error } = await supabase
        .from('creator_milestones')
        .update({
          status: r.status,
          review_status: r.review_status,
          round: 0,
          completed_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('creator_id', creator.id)
        .eq('milestone_id', r.milestone_id);
      if (error) throw new Error(`Could not reset ${r.milestone_id}: ${error.message}`);
    }
  };

  /**
   * Reset, then confirm the board actually reads the way the next check needs.
   *
   * A test that reports a product failure when its own setup did not take is a
   * lying test, and this job exists to stop exactly that class of thing. If the
   * precondition cannot be established, say so instead of blaming a button.
   */
  const resetAndConfirm = async (): Promise<string | null> => {
    await reset();
    const row = await stepStatus(IN_REVIEW_STEP);
    if (row?.status !== 'waiting_approval' || row?.review_status !== 'submitted') {
      return `expected ${IN_REVIEW_STEP} to read waiting_approval/submitted, found ${row?.status}/${row?.review_status}`;
    }
    return null;
  };

  const stepStatus = async (milestoneId: string) => {
    const { data } = await supabase
      .from('creator_milestones')
      .select('status, review_status')
      .eq('creator_id', creator.id)
      .eq('milestone_id', milestoneId)
      .maybeSingle();
    return data;
  };

  const post = async (path: string, body: unknown) => {
    const res = await fetch(`${SITE}${path}`, {
      method: 'POST',
      // No credential is sent, because none is required.
      //
      // Worth stating plainly rather than leaving as a convenient silence:
      // /api/admin/approve-milestone and /api/admin/request-revision carry no
      // auth check of their own, and middleware.ts only refreshes sessions, it
      // does not block. Anyone who knows a creator id and a step key can
      // approve a creator's work.
      //
      // That is a separate finding from this test and it needs Rae's call,
      // because adding requireAdminAuth here also means giving this job a way
      // in. Sending a header that does nothing would have hidden it.
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, json };
  };

  try {
    const setupBefore = await resetAndConfirm();
    if (setupBefore) {
      add('the sandbox could be put in a testable state', false, setupBefore);
    }

    // 1. The wrong identifier must be refused, and refused by name.
    const wrong = await post('/api/admin/approve-milestone', {
      milestoneId: creator.id, // a uuid, which is the September mistake
      creatorId: creator.id,
      adminEmail: 'cron@teachersdeserveit.com',
    });
    add(
      'a record id where a step key belongs is refused',
      wrong.status === 400 && /wrong field|row id/i.test(String(wrong.json?.error ?? '')),
      `status ${wrong.status}: ${String(wrong.json?.error ?? '').slice(0, 90)}`,
    );

    // 2. Approve actually completes the step.
    const before = await stepStatus(IN_REVIEW_STEP);
    const approve = await post('/api/admin/approve-milestone', {
      milestoneId: IN_REVIEW_STEP,
      creatorId: creator.id,
      adminEmail: 'cron@teachersdeserveit.com',
    });
    const afterApprove = await stepStatus(IN_REVIEW_STEP);
    add(
      'Approve completes the step',
      afterApprove?.status === 'completed',
      `${before?.status} then ${afterApprove?.status} (http ${approve.status})`,
    );

    // 3. Request changes actually sends it back.
    //
    // Confirmed rather than assumed: without a clean round counter the route
    // correctly approves at the cap, and reading that as a broken button is
    // how this job lied on its first run.
    const setupForRevision = await resetAndConfirm();
    if (setupForRevision) {
      add('the sandbox could be reset before testing Request changes', false, setupForRevision);
    }

    const revision = await post('/api/admin/request-revision', {
      milestoneId: IN_REVIEW_STEP,
      creatorId: creator.id,
      adminEmail: 'cron@teachersdeserveit.com',
      note: 'Automated check. No action needed, this is the sandbox creator.',
    });
    const afterRevision = await stepStatus(IN_REVIEW_STEP);
    add(
      'Request changes sends the step back',
      afterRevision?.status !== 'completed' && afterRevision?.review_status !== 'submitted',
      `now ${afterRevision?.status}/${afterRevision?.review_status} (http ${revision.status})`,
    );
  } catch (e) {
    add('the check itself ran', false, String((e as Error).message ?? e));
  } finally {
    // Always leave her pressable for tomorrow, even if something above threw.
    try {
      await reset();
    } catch (e) {
      add('sandbox reset afterwards', false, String((e as Error).message ?? e));
    }
  }

  const failures = checks.filter((c) => !c.ok);

  if (failures.length > 0) {
    await postCreatorMessage(
      `*A write button has stopped working* | ${failures.length} of ${checks.length} checks failed\n` +
        `Pressed against the sandbox creator, so no real creator was touched.` +
        failures.map((f) => `\n\n- ${f.name}\n  ${f.detail}`).join('') +
        `\n\n${SITE}/tdi-admin/creators/${creator.id}`,
      'rae',
    );
  }

  console.log(
    `[button-smoke-test] ${checks.length - failures.length}/${checks.length} passed` +
      (failures.length ? `: ${failures.map((f) => f.name).join('; ')}` : ''),
  );

  return NextResponse.json({
    success: failures.length === 0,
    checks,
    failed: failures.length,
  });
}
