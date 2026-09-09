// ---------------------------------------------------------------------------
// Work that exists and reaches nobody.
//
// Rae asked on 8 September 2026 how an error survived more than ten dry runs.
// The answer: every dry run tested one job on its own, and the failure lived
// between two of them. The eligibility audit created a window question
// correctly. find_work had a correct branch for handing that research to Amara.
// Each passed its own test. Nothing asked the question neither job owns:
//
//   is there a party who can actually do this item, and are they being offered it?
//
// So Amara's queue sat empty while five copies of the same question sat on
// Bella's list, and the only reason anyone found out is that Bella said so.
//
// These rules are deliberately about reachability, not about backlog. "Nobody
// has done this yet" is normal and is somebody's job to work through. "Nobody
// can do this, and nothing will ever surface it again" is a different thing,
// and it is invisible precisely because no screen is built to show absence.
//
// Every rule here was measured against production before being written. A rule
// that finds nothing on the day it ships is a rule nobody can trust later.
// ---------------------------------------------------------------------------

import { isAgentWindowWork } from './funding-window-work';
import { isOursToDo, isWaitingOnUs } from './creator-turn';
import { isPersonOwned } from './funding-ownership';

/* eslint-disable @typescript-eslint/no-explicit-any */
type DbClient = any;

export interface OrphanFinding {
  /** Stable key, so a report can be diffed against yesterday's. */
  rule: string;
  /** What is stranded, in words a person can act on. */
  what: string;
  /** Why nobody will pick it up. */
  why: string;
  where: string;
  link?: string;
}

const SITE = 'https://www.teachersdeserveit.com';

/**
 * Every rule, run together, so the caller gets one answer rather than five.
 *
 * Errors are collected rather than thrown. A rule whose query fails must not
 * take the other four down, and a silent zero from a broken query is exactly
 * the failure this whole file exists to catch, so it is reported as a finding
 * in its own right.
 */
export async function findOrphanedWork(
  supabase: DbClient
): Promise<{ findings: OrphanFinding[]; errors: string[] }> {
  const findings: OrphanFinding[] = [];
  const errors: string[] = [];

  // --- Funding -------------------------------------------------------------

  const { data: liveP, error: pErr } = await supabase
    .from('funding_pursuits')
    .select('id, district_name, archived');
  if (pErr) errors.push(`pursuits: ${pErr.message}`);

  const pursuits = new Map<string, any>(
    (liveP ?? []).filter((p: any) => !p.archived).map((p: any) => [p.id, p])
  );

  const { data: items, error: iErr } = await supabase
    .from('funding_action_items')
    .select('id, pursuit_id, opportunity_id, title, status, owner_type, due_date')
    .in('status', ['pending', 'blocked']);
  if (iErr) errors.push(`action items: ${iErr.message}`);

  const { data: opps, error: oErr } = await supabase
    .from('funding_opportunities')
    .select('id, pursuit_id, name, status, research_status, window_status, window_checked_at');
  if (oErr) errors.push(`opportunities: ${oErr.message}`);

  const oppById = new Map<string, any>((opps ?? []).map((o: any) => [o.id, o]));

  const SETTLED = new Set(['closed', 'denied', 'awarded', 'not_applicable']);

  for (const it of (items ?? []) as any[]) {
    const school = pursuits.get(it.pursuit_id);
    if (!school) continue; // archived school, deliberately not our problem
    const where = school.district_name ?? 'Unknown school';
    const link = `${SITE}/tdi-admin/funding/${it.pursuit_id}?open=actions&action=${it.id}`;
    const opp = it.opportunity_id ? oppById.get(it.opportunity_id) : null;

    // 1. The path this question decides is already over.
    if (opp && SETTLED.has(opp.status)) {
      findings.push({
        rule: 'funding_item_on_settled_path',
        what: `"${it.title}"`,
        why: `The path it decides is ${opp.status}, so answering it changes nothing. It will sit on the list for ever.`,
        where: `${where} · ${opp.name}`,
        link,
      });
    }

    // 2. No due date means no reminder, no overdue count, no digest. The
    //    follow-up cron skips items with no due date, so this is genuinely
    //    invisible rather than merely low priority.
    if (isPersonOwned(it) && !it.due_date) {
      findings.push({
        rule: 'funding_item_no_due_date',
        what: `"${it.title}"`,
        why: 'It has no due date, so no reminder, digest or overdue count will ever mention it again.',
        where,
        link,
      });
    }

    // 3. The exact shape that started this. A question on a person's list that
    //    an agent is also being offered means the person is doing the agent's
    //    research, or more likely nobody is doing anything.
    if (opp && isPersonOwned(it) && isAgentWindowWork(opp)) {
      findings.push({
        rule: 'funding_question_duplicates_agent_work',
        what: `"${it.title}"`,
        why: 'The research agent is being offered this same funder. Asking a person as well means it is nobody\'s in practice.',
        where: `${where} · ${opp.name}`,
        link,
      });
    }
  }

  // --- Creator Studio ------------------------------------------------------

  const { data: creators, error: cErr } = await supabase
    .from('creators')
    .select('id, name, email, status, lifecycle_state');
  if (cErr) errors.push(`creators: ${cErr.message}`);

  const working = new Map<string, any>(
    (creators ?? [])
      .filter((c: any) => c.status === 'active' && c.lifecycle_state !== 'paused')
      .map((c: any) => [c.id, c])
  );

  const { data: steps, error: sErr } = await supabase
    .from('creator_milestones')
    .select('id, creator_id, status, review_status, due_on, opened_at, milestones!inner(name, requires_team_action)')
    .in('status', ['available', 'in_progress', 'waiting_approval']);
  if (sErr) errors.push(`creator steps: ${sErr.message}`);

  // Who has ever actually signed in.
  //
  // A step assigned to somebody with no way into the portal is not a slow
  // creator, it is a task with no possible actor. Read the same way the "Who
  // can get in" page reads it, through the auth admin API, because auth.users
  // is not a table PostgREST will select from.
  //
  // If this lookup fails the rule is skipped and says so, rather than treating
  // "no sign-ins found" as "nobody has ever signed in" and reporting every open
  // step in the system as stranded.
  const signedInEmails = new Set<string>();
  let signInLookupOk = true;
  try {
    const { data: authUsers, error: aErr } = await supabase.auth.admin.listUsers({ perPage: 5000 });
    if (aErr) throw new Error(aErr.message);
    for (const u of (authUsers?.users ?? []) as Array<{ email?: string; last_sign_in_at?: string }>) {
      if (u.email && u.last_sign_in_at) signedInEmails.add(u.email.trim().toLowerCase());
    }
  } catch (e) {
    signInLookupOk = false;
    errors.push(`sign-in lookup failed, so the "cannot get in" rule was skipped: ${String((e as Error).message ?? e)}`);
  }

  for (const st of (steps ?? []) as any[]) {
    const c = working.get(st.creator_id);
    if (!c) continue;
    const m = Array.isArray(st.milestones) ? st.milestones[0] : st.milestones;
    const stepName = m?.name ?? 'Unnamed step';
    const link = `${SITE}/tdi-admin/creators/${st.creator_id}`;

    // 4. Open, on the clock nowhere. The step reminder cron reads due_on, so a
    //    step without one is invisible to it whatever its age. Team-owned steps
    //    correctly have no due date, so they are excluded.
    const turn = {
      status: st.status,
      reviewStatus: st.review_status,
      requiresTeamAction: m?.requires_team_action,
    };

    // Only a step the creator actually has to move can be stranded for want of
    // a clock. Ours, and anything sitting in review, is waiting on us and is
    // covered by the daily "Waiting on TDI" list instead.
    if (!st.due_on && !isWaitingOnUs(turn)) {
      findings.push({
        rule: 'creator_step_no_clock',
        what: `${c.name} on "${stepName}"`,
        why: 'The step is open with no due date, so no reminder or overdue count will ever mention it.',
        where: 'Creator Studio',
        link,
      });
    }

    // 5. Waiting on a creator who has never got into the portal. Chasing them
    //    harder cannot work: there is no screen they can reach to do it.
    if (
      signInLookupOk &&
      !isOursToDo(turn) &&
      c.email &&
      !signedInEmails.has(String(c.email).trim().toLowerCase())
    ) {
      findings.push({
        rule: 'creator_step_but_never_signed_in',
        what: `${c.name} on "${stepName}"`,
        why: 'They have never signed in, so this step is waiting on somebody who cannot reach it. Send them a fresh link before chasing.',
        where: 'Creator Studio',
        link: `${SITE}/tdi-admin/creators/access`,
      });
    }
  }

  // --- Delivery tracking ----------------------------------------------------

  // 6. Is anything telling us what happens to the mail we send?
  //
  //    This rule exists because of how it was found. /api/webhooks/resend was
  //    written for invoices, is correct, and had recorded exactly zero events
  //    since the day it shipped, because RESEND_WEBHOOK_SECRET was never set and
  //    Resend was never pointed at it. Nothing noticed, because a thing that
  //    silently does nothing looks identical to a thing with nothing to do.
  //
  //    So the check is not "did an email bounce". It is "given that we have been
  //    sending, are outcomes coming back at all". A week of sends with no event
  //    of any kind means the pipe is disconnected again.
  const deliveryWindow = new Date(Date.now() - 7 * 86400000).toISOString();
  const { data: recentMail, error: mailErr } = await supabase
    .from('creator_email_log')
    .select('provider_id, last_event, sent_at')
    .eq('dry_run', false)
    .gte('sent_at', deliveryWindow);

  if (mailErr) {
    errors.push(`delivery tracking: ${mailErr.message}`);
  } else {
    const real = recentMail ?? [];
    const withId = real.filter((r: any) => r.provider_id);
    const withEvent = real.filter((r: any) => r.last_event);

    // Only meaningful once something has actually been sent. A quiet week is
    // not a broken webhook.
    if (real.length >= 3) {
      if (withId.length === 0) {
        findings.push({
          rule: 'delivery_tracking_dark',
          what: `${real.length} creator emails sent this week, none with a provider id`,
          why: 'No send site is recording the Resend message id, so no delivery outcome can ever be matched back. "We emailed them" cannot be checked.',
          where: 'Creator Studio',
        });
      } else if (withEvent.length === 0) {
        findings.push({
          rule: 'delivery_tracking_dark',
          what: `${withId.length} creator emails sent this week, not one delivery event received`,
          why: 'Ids are being recorded but nothing is coming back, so Resend is not reaching /api/webhooks/resend. Check RESEND_WEBHOOK_SECRET is set and the endpoint is still configured in Resend.',
          where: 'Creator Studio',
        });
      }
    }
  }

  return { findings, errors };
}

/** Groups findings by rule, for a report that reads as a list of problems. */
export function groupByRule(findings: OrphanFinding[]): Map<string, OrphanFinding[]> {
  const out = new Map<string, OrphanFinding[]>();
  for (const f of findings) {
    const list = out.get(f.rule) ?? [];
    list.push(f);
    out.set(f.rule, list);
  }
  return out;
}
