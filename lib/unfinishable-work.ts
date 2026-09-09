// ---------------------------------------------------------------------------
// Work a person cannot finish.
//
// Every check this codebase has tests one of two things: a property of the code
// (check:writes, check:definitions, deadcode) or the state of the data
// (check:schema, orphaned-work). Ten of them now. Not one asks the question
// Bella asks every morning without meaning to:
//
//   "If I opened this right now, could I actually finish it?"
//
// That is why she keeps finding these and we keep not. Every bug she has
// reported sits at a seam rather than inside a feature. The Approve button
// worked and the route worked, but the button sent the wrong id. send-to-client
// worked and outreach-queue worked, but only one created follow-ups. Lily works
// and her step exists, but nothing joined them. The label gate worked and the
// email worked, but together they said nothing to the school.
//
// Features get built and tested one at a time. Nobody walks the joins except
// the person doing the work, in production, one at a time.
//
// So this walks them. It resolves each open item the way the real control does,
// using the same functions the routes use, and reports anything that would
// leave a person stuck, misinformed, or holding a dead button.
//
// The rule for adding to this file: only check things that have actually gone
// wrong. A speculative check is noise, and a noisy report is one nobody reads.
// ---------------------------------------------------------------------------

import { clientTaskLabel, NEUTRAL_TASK_LABEL } from './funding-followup-email';
import { isPersonOwned } from './funding-ownership';

/* eslint-disable @typescript-eslint/no-explicit-any */
type DbClient = any;

const SITE = 'https://www.teachersdeserveit.com';

export interface Unfinishable {
  /** Stable key so a report can be diffed against yesterday's. */
  rule: string;
  /** What a person would hit. */
  what: string;
  /** Why they cannot finish it, in words that name the fix. */
  why: string;
  link?: string;
}

/**
 * Everything currently open that a person could not complete.
 *
 * Errors are collected rather than thrown. A broken rule must not hide the
 * other four, and a silent zero from a failed query is the exact failure this
 * file exists to catch.
 */
export async function findUnfinishableWork(
  supabase: DbClient
): Promise<{ findings: Unfinishable[]; errors: string[] }> {
  const findings: Unfinishable[] = [];
  const errors: string[] = [];

  // --- Funding tasks a person owns ------------------------------------------

  const { data: items, error: itemErr } = await supabase
    .from('funding_action_items')
    .select('id, pursuit_id, opportunity_id, title, description, client_label, owner_type, status, category')
    .in('status', ['pending', 'blocked']);

  if (itemErr) {
    errors.push(`funding action items: ${itemErr.message}`);
  } else {
    const personItems = (items ?? []).filter((i: any) => isPersonOwned(i));
    const pursuitIds = [...new Set(personItems.map((i: any) => i.pursuit_id).filter(Boolean))];
    const oppIds = [...new Set(personItems.map((i: any) => i.opportunity_id).filter(Boolean))];

    const { data: pursuits } = pursuitIds.length
      ? await supabase
          .from('funding_pursuits')
          .select('id, pursuit_name, district_name, client_contact_email')
          .in('id', pursuitIds)
      : { data: [] };

    const { data: gates } = pursuitIds.length
      ? await supabase.from('pursuit_gate').select('pursuit_id, submitter_email').in('pursuit_id', pursuitIds)
      : { data: [] };

    const { data: opps } = oppIds.length
      ? await supabase.from('funding_opportunities').select('id, name').in('id', oppIds)
      : { data: [] };

    const pursuitById = new Map<string, any>((pursuits ?? []).map((p: any) => [p.id, p]));
    const gateByPursuit = new Map<string, any>((gates ?? []).map((g: any) => [g.pursuit_id, g]));
    const oppById = new Map<string, any>((opps ?? []).map((o: any) => [o.id, o]));

    for (const item of personItems) {
      const pursuit = pursuitById.get(item.pursuit_id);
      const gate = gateByPursuit.get(item.pursuit_id);
      const school = pursuit?.pursuit_name ?? pursuit?.district_name ?? 'this pursuit';
      const link = `${SITE}/tdi-admin/funding/${item.pursuit_id}`;

      // 1. The Write to the school button resolves to nobody.
      //
      //    Resolved exactly the way send-nudge does, so this cannot drift from
      //    the button's real behaviour.
      const recipient = pursuit?.client_contact_email ?? gate?.submitter_email ?? null;
      if (!recipient) {
        findings.push({
          rule: 'no_one_to_write_to',
          what: `"${item.title}" on ${school}`,
          why: 'There is no school contact on this pursuit, so Write to the school opens a preview with nobody in it. Add a client contact to the pursuit.',
          link,
        });
      }

      // 2. The email would name nothing.
      //
      //    Bella caught this one herself on 9 September, mid-send: the gates
      //    correctly reject "Check if..." titles, so the school was told only
      //    that "this funding step" was due. Naming the grant fixed most of
      //    them. What is left is a task with no grant attached either.
      const opportunityName = oppById.get(item.opportunity_id)?.name ?? null;
      const label = clientTaskLabel(item.title ?? '', item.client_label, opportunityName);
      if (recipient && label === NEUTRAL_TASK_LABEL) {
        findings.push({
          rule: 'email_says_nothing',
          what: `"${item.title}" on ${school}`,
          why: 'Sending this tells the school only that "this funding step" is due, and there is no grant name to fall back on. Set a client label a school could read.',
          link,
        });
      }

      // 3. Nothing tells the person what the task actually is.
      const description = (item.description ?? '').trim();
      if (!description) {
        findings.push({
          rule: 'no_instructions',
          what: `"${item.title}" on ${school}`,
          why: 'The task has a title and nothing else, so whoever opens it has to guess what finishing it means.',
          link,
        });
      }
    }
  }

  // --- Grants that were sent and then forgotten ------------------------------
  //
  // funding-next-actions skips an opportunity once forwarding_email_status is
  // 'sent', so a sent grant with no open follow-up is invisible everywhere. It
  // reads as finished. Title II-A for Saunemin was sent on 17 August, filed as
  // complete, and sat unsubmitted for nine days exactly like this.
  const { data: sentOpps, error: sentErr } = await supabase
    .from('funding_opportunities')
    .select('id, name, pursuit_id, status, forwarding_email_status')
    .eq('forwarding_email_status', 'sent');

  if (sentErr) {
    errors.push(`sent opportunities: ${sentErr.message}`);
  } else {
    const live = (sentOpps ?? []).filter(
      (o: any) => !['awarded', 'denied', 'closed', 'not_applicable'].includes(String(o.status ?? ''))
    );

    if (live.length > 0) {
      // Any open item counts, not only category 'follow_up'.
      //
      // The first version of this rule looked at follow_up alone and reported
      // four grants. Three of them were being tracked perfectly well under
      // 'documentation', as "Information needed for X". Reporting those would
      // have taught the reader to skim, and a skimmed report is the same as no
      // report. Caught before this ever posted, by checking the four by hand.
      const { data: openItems } = await supabase
        .from('funding_action_items')
        .select('opportunity_id')
        .in('status', ['pending', 'blocked'])
        .in('opportunity_id', live.map((o: any) => o.id));

      const chased = new Set((openItems ?? []).map((f: any) => f.opportunity_id));

      for (const opp of live) {
        if (chased.has(opp.id)) continue;
        findings.push({
          rule: 'sent_but_nobody_chasing',
          what: `${opp.name}`,
          why: 'It went to the school and nothing is asking whether they submitted it. The board skips a grant once it reads as sent, so this is invisible rather than done.',
          link: `${SITE}/tdi-admin/funding/${opp.pursuit_id}`,
        });
      }
    }
  }

  // --- Follow-ups that are not attached to the grant they are about ----------
  //
  // "Track NEA application decision" sits on Allenwood with opportunity_id null.
  // It is real work and somebody is doing it, but nothing can attribute it, so
  // every check that asks "is this grant being chased" answers no. That is how
  // a tracked grant reads as untracked, and it is what made the rule above
  // report a false positive on its first run.
  const { data: unlinked, error: unlinkedErr } = await supabase
    .from('funding_action_items')
    .select('id, title, pursuit_id, opportunity_id, category, status')
    .eq('category', 'follow_up')
    .is('opportunity_id', null)
    .in('status', ['pending', 'blocked']);

  if (unlinkedErr) {
    errors.push(`unlinked follow-ups: ${unlinkedErr.message}`);
  } else {
    for (const item of unlinked ?? []) {
      findings.push({
        rule: 'followup_not_linked_to_a_grant',
        what: `"${item.title}"`,
        why: 'This chases a grant but is not attached to one, so nothing can tell which grant is covered. Any check asking whether that grant is being chased will answer no.',
        link: `${SITE}/tdi-admin/funding/${item.pursuit_id}`,
      });
    }
  }

  return { findings, errors };
}

/** Groups findings by rule, so the report reads as a list of problems. */
export function groupUnfinishable(findings: Unfinishable[]): Map<string, Unfinishable[]> {
  const out = new Map<string, Unfinishable[]>();
  for (const f of findings) {
    const list = out.get(f.rule) ?? [];
    list.push(f);
    out.set(f.rule, list);
  }
  return out;
}
