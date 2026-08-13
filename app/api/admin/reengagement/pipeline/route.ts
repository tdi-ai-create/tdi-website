import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCreatorActivity } from '@/lib/creator-activity';
import { classifyRoster } from '@/lib/agreement-gate';
import { AGREEMENT_GRACE_DAYS } from '@/lib/reengagement-config';
import {
  PAUSE_CHECK_IN_SENDS_ENABLED,
  STALL_THRESHOLD_DAYS,
  STEP_INTERVAL_DAYS,
  REENROLMENT_COOLDOWN_DAYS,
  FINAL_STEP,
} from '@/lib/reengagement-config';

// ---------------------------------------------------------------------------
// GET /api/admin/reengagement/pipeline
//
// Everything the Re-engagement tab needs in one call: where each creator sits
// on the ladder, who the next run would contact, and what has actually gone
// out. Built after an audit found the sequence had been emailing the wrong 19
// people for a month with no way for anyone to notice from the admin.
// ---------------------------------------------------------------------------

interface CreatorRow {
  id: string;
  name: string | null;
  email: string | null;
  lifecycle_state: string | null;
  publish_status: string | null;
  status: string | null;
  paused_at: string | null;
  paused_by: string | null;
}

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, error: 'Server config error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const now = new Date();

    const { data: creators, error: creatorsError } = await supabase
      .from('creators')
      .select('id, name, email, lifecycle_state, publish_status, status, paused_at, paused_by')
      .neq('is_test_account', true);

    if (creatorsError) {
      return NextResponse.json({ success: false, error: creatorsError.message }, { status: 500 });
    }

    const byId = new Map((creators as CreatorRow[]).map((c) => [c.id, c]));

    // The agreement gate, from the same classifier the cron uses, so what Bella
    // reads here is exactly what will happen.
    const gate = await classifyRoster(supabase, now);
    const unsignedWorking = gate
      .filter((v) => v.outcome === 'unsigned_working')
      .map((v) => ({ id: v.creatorId, name: v.name, reason: v.reason }));
    const closingSoon = gate
      .filter((v) => v.outcome === 'close')
      .map((v) => ({ id: v.creatorId, name: v.name, reason: v.reason }));
    const activity = await getCreatorActivity(supabase, now);

    // ---- The ladder: who sits at each step right now ----
    const { data: sequences } = await supabase
      .from('creator_reengagement_sequences')
      .select('id, creator_id, current_step, status, started_at, last_email_sent_at')
      .eq('status', 'active')
      .order('started_at', { ascending: true });

    const ladder = Array.from({ length: FINAL_STEP + 1 }, (_, step) => ({
      step,
      label: stepLabel(step),
      creators: [] as unknown[],
    }));

    for (const seq of sequences || []) {
      const creator = byId.get(seq.creator_id);
      if (!creator) continue;

      const creatorActivity = activity.get(seq.creator_id);
      const nextEmailDue = new Date(
        new Date(seq.last_email_sent_at).getTime() + STEP_INTERVAL_DAYS * 24 * 60 * 60 * 1000
      );

      ladder[seq.current_step]?.creators.push({
        id: creator.id,
        name: creator.name,
        email: creator.email,
        startedAt: seq.started_at,
        lastEmailAt: seq.last_email_sent_at,
        nextEmailDue: nextEmailDue.toISOString(),
        daysSinceActivity: creatorActivity?.daysSinceActivity ?? null,
        why: creatorActivity?.explanation ?? null,
      });
    }

    // ---- Who the next run would touch ----
    // Mirrors the cron's own logic so this is a genuine preview rather than a
    // second, drifting definition of the same thing.
    const activeSequenceIds = new Set((sequences || []).map((s) => s.creator_id));

    const cooldownStart = new Date(now);
    cooldownStart.setDate(cooldownStart.getDate() - REENROLMENT_COOLDOWN_DAYS);
    const { data: recentSequences } = await supabase
      .from('creator_reengagement_sequences')
      .select('creator_id')
      .in('status', ['completed', 'cancelled'])
      .gte('created_at', cooldownStart.toISOString());
    const inCooldown = new Set((recentSequences || []).map((s) => s.creator_id));

    const wouldEnrol = (creators as CreatorRow[])
      .filter((c) => {
        if (c.status !== 'active') return false;
        if (c.lifecycle_state && c.lifecycle_state !== 'active') return false;
        if (c.publish_status === 'published') return false;
        if (activeSequenceIds.has(c.id)) return false;
        if (inCooldown.has(c.id)) return false;
        const a = activity.get(c.id);
        // The cron enrols on last_portal_activity_at alone, so this preview has
        // to use the same field. Using the broader activity figure here would
        // show Bella a list the cron will not actually act on.
        return !!a && a.daysSincePortalActivity >= STALL_THRESHOLD_DAYS;
      })
      .map((c) => {
        const a = activity.get(c.id)!;
        return {
          id: c.id,
          name: c.name,
          email: c.email,
          daysSinceActivity: a.daysSincePortalActivity,
          why: a.explanation,
        };
      })
      .sort((a, b) => b.daysSinceActivity - a.daysSinceActivity);

    // Sequences whose next email is due, so the ladder shows movement, not just
    // a static snapshot.
    const wouldAdvance = (sequences || [])
      .filter((s) => {
        const days = Math.floor(
          (now.getTime() - new Date(s.last_email_sent_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        return days >= STEP_INTERVAL_DAYS;
      })
      .map((s) => {
        const creator = byId.get(s.creator_id);
        const nextStep = s.current_step + 1;
        return {
          id: s.creator_id,
          name: creator?.name ?? null,
          email: creator?.email ?? null,
          currentStep: s.current_step,
          nextStep,
          wouldPause: nextStep >= FINAL_STEP,
        };
      });

    // ---- What has actually gone out ----
    const { data: recentSends } = await supabase
      .from('creator_email_log')
      .select('creator_id, creator_name, creator_email, category, subject, step, sent_at, dry_run')
      .eq('category', 'reengagement')
      .order('sent_at', { ascending: false })
      .limit(60);

    // ---- Paused creators, who are easy to forget about entirely ----
    const paused = (creators as CreatorRow[])
      .filter((c) => c.lifecycle_state === 'paused')
      .map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        pausedAt: c.paused_at,
        pausedBy: c.paused_by,
        daysPaused: c.paused_at
          ? Math.floor((now.getTime() - new Date(c.paused_at).getTime()) / (1000 * 60 * 60 * 24))
          : null,
      }))
      .sort((a, b) => (b.daysPaused ?? 0) - (a.daysPaused ?? 0));

    return NextResponse.json({
      success: true,
      config: {
        // The re-engagement cron delivers on its scheduled run and only holds
        // back when explicitly asked via ?dryRun, so there is no standing "off"
        // state to warn about. The paused check-in job does carry a switch.
        sendsEnabled: true,
        pauseCheckInSendsEnabled: PAUSE_CHECK_IN_SENDS_ENABLED,
        stallThresholdDays: STALL_THRESHOLD_DAYS,
        agreementGraceDays: AGREEMENT_GRACE_DAYS,
        stepIntervalDays: STEP_INTERVAL_DAYS,
        finalStep: FINAL_STEP,
      },
      ladder,
      unsignedWorking,
      closingSoon,
      wouldEnrol,
      wouldAdvance,
      recentSends: recentSends || [],
      paused,
      totals: {
        inSequence: (sequences || []).length,
        wouldEnrol: wouldEnrol.length,
        wouldAdvance: wouldAdvance.length,
        facingPause: wouldAdvance.filter((w) => w.wouldPause).length,
        paused: paused.length,
        unsignedWorking: unsignedWorking.length,
        closingSoon: closingSoon.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[reengagement-pipeline] Error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

function stepLabel(step: number): string {
  switch (step) {
    case 0:
      return 'First check-in';
    case 1:
      return 'Nudge 1';
    case 2:
      return 'Nudge 2';
    case 3:
      return 'Nudge 3';
    case 4:
      return 'Nudge 4';
    case 5:
      return 'Final check-in';
    case 6:
      return 'Pause notice';
    default:
      return `Step ${step}`;
  }
}
