import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { isTDIAdmin } from '@/lib/is-tdi-admin';
import { placeProject, resolveStepRow } from '@/lib/creator-step-engine';
import {
  blocksPublish,
  hasSignedAgreement,
  needsAgreementReminder,
} from '@/lib/creator-agreement';

/**
 * Answers "what happens if each unsigned creator signs right now" without
 * signing anything.
 *
 * It calls the same resolveStepRow and placeProject the real sign route calls,
 * so a pass here means the real path resolves, not that a second implementation
 * of the rules agrees with itself. placeProject is run with dryRun, which reads
 * the board and reports what it would do without writing.
 *
 * Read only. There is no write path in this file at all, which is why it is a
 * GET with no action parameter to get wrong.
 */
export async function GET() {
  const authClient = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await isTDIAdmin(user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: creators, error } = await supabase
    .from('creators')
    .select('id, name, email, status, publish_status, agreement_signed, agreement_signed_at, active_project_id, is_test_account')
    .eq('status', 'active');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const subjects = (creators || []).filter((c) => !c.is_test_account);

  const { data: agreementMilestones } = await supabase
    .from('milestones')
    .select('id')
    .eq('phase_id', 'agreement');

  const agreementMilestoneId = agreementMilestones?.[0]?.id ?? 'agreement_sign';

  const rows = [];

  for (const c of subjects) {
    const signed = hasSignedAgreement(c);

    const row: Record<string, unknown> = {
      name: c.name,
      email: c.email,
      publish_status: c.publish_status,
      signed,
      // Rule A
      reminderShows: needsAgreementReminder(c),
      // Rule B
      publishBlocked: blocksPublish(c),
    };

    if (!signed) {
      // Rule D depends on this resolving. If it does not, the signature still
      // saves and the team gets told, but we want to know up front.
      const resolved = await resolveStepRow(supabase, c.id, agreementMilestoneId);
      row.stepRowResolves = !resolved.error && !!resolved.recordId;
      if (resolved.error) row.stepRowError = resolved.error;

      // Rule E. What the board would do. For anyone already past the agreement
      // this should report no new step, because placement only moves forward.
      if (c.active_project_id) {
        const placed = await placeProject(supabase, c.active_project_id, { dryRun: true });
        row.boardWouldOpen = placed.openStep?.name ?? null;
        row.boardWouldLock = placed.locked;
        if (placed.error) row.boardError = placed.error;
      } else {
        row.boardError = 'No active project';
      }
    }

    rows.push(row);
  }

  const unsigned = rows.filter((r) => !r.signed);

  return NextResponse.json({
    dryRun: true,
    wroteNothing: true,
    totals: {
      active: rows.length,
      signed: rows.length - unsigned.length,
      unsigned: unsigned.length,
      publishedUnsigned: unsigned.filter((r) => r.publish_status === 'published').length,
      cannotResolveStep: unsigned.filter((r) => r.stepRowResolves === false).length,
    },
    creators: rows.sort((a, b) => Number(a.signed) - Number(b.signed)),
  });
}
