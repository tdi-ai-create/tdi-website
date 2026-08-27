import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { calculateFundingAlerts } from '@/lib/tdi-admin/funding-alert-rules'
import { syncGateActionItems } from '@/lib/funding-gate-sync'
import { loadSettings } from '@/lib/funding-slack'
import { guardCron } from '@/lib/cron-guard'
import { NOT_TERMINAL_FILTER } from '@/lib/funding/task-status'

/**
 * Daily cron endpoint for funding reminders.
 * - Computes alerts across all pursuits
 * - Sends internal digest email to rae@teachersdeserveit.com
 * - Auto-drafts nudge emails for critical deadlines
 *
 * Call via Vercel cron or external scheduler.
 * Protected by CRON_SECRET header.
 */
export async function GET(request: NextRequest) {
  // guardCron rather than a hand-rolled check: it fails closed when CRON_SECRET
  // is unset (the old check let anyone through in that case) and it gives us
  // ?dryRun=1 for free.
  //
  // Dry run computes every decision and reports it while sending nothing and
  // writing nothing. Worth stating plainly what this cron can reach even on a
  // real run: the digest goes to Rae, nudges are inserted as status 'draft' and
  // are never sent, and Slack goes to the internal webhook. Nothing here has
  // ever reached a school contact.
  const guard = guardCron(request)
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status ?? 401 })
  }
  const { dryRun } = guard

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch all active data. Archived pursuits are excluded here and their
    // opportunities and action items filtered out below — otherwise the daily
    // digest reports on schools we are no longer working with.
    const [pursuitRes, oppRes, actionRes] = await Promise.all([
      supabase.from('funding_pursuits').select('*').neq('archived', true),
      supabase.from('funding_opportunities').select('*').not('status', 'in', '("awarded","denied")'),
      supabase.from('funding_action_items').select('*').not('status', 'in', NOT_TERMINAL_FILTER),
    ])

    const pursuits = pursuitRes.data || []
    const activeIds = new Set(pursuits.map(p => p.id))
    const opportunities = (oppRes.data || []).filter(o => activeIds.has(o.pursuit_id))
    let actionItems = (actionRes.data || []).filter(a => activeIds.has(a.pursuit_id))

    // Reconcile gate gaps into client action items before computing alerts.
    // The gate PUT does this going forward, but a pursuit whose gate was shut
    // and never touched again would otherwise never surface its blockers. That
    // is exactly how St. Peter Chanel went 23 days with nothing happening.
    let gateItemsCreated = 0
    const { data: gates } = await supabase
      .from('pursuit_gate')
      .select('*')
      .in('pursuit_id', Array.from(activeIds))

    const gateByPursuit = new Map((gates || []).map(g => [g.pursuit_id, g]))
    for (const p of pursuits) {
      // Writes client action items, so it is skipped entirely on a dry run.
      if (dryRun) continue
      const res = await syncGateActionItems(supabase, p.id, gateByPursuit.get(p.id) ?? null)
        .catch(() => ({ created: 0, resolved: 0 }))
      gateItemsCreated += res.created
    }

    // Re-read action items if the reconcile added any, so the digest sees them
    if (gateItemsCreated > 0) {
      const { data: refreshed } = await supabase
        .from('funding_action_items')
        .select('*')
        .not('status', 'in', NOT_TERMINAL_FILTER)
      actionItems = (refreshed || []).filter(a => activeIds.has(a.pursuit_id))
    }

    const alerts = calculateFundingAlerts({ pursuits, opportunities, actionItems })

    const critical = alerts.filter(a => a.severity === 'critical')
    const warnings = alerts.filter(a => a.severity === 'warning')

    // Build digest email
    if (alerts.length > 0) {
      const digestHtml = buildDigestEmail(critical, warnings, pursuits)

      const resendKey = process.env.RESEND_API_KEY
      if (resendKey && !dryRun) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'TDI Funding <noreply@teachersdeserveit.com>',
            to: ['rae@teachersdeserveit.com'],
            subject: `Funding Digest: ${critical.length} critical, ${warnings.length} warnings`,
            html: digestHtml,
          }),
        })
      }
    }

    // Auto-draft nudge emails for critical deadline alerts
    let draftCount = 0
    const draftFailures: string[] = []
    for (const alert of critical) {
      if (alert.category !== 'deadline' || !alert.opportunity_id) continue

      // Find the pursuit to get client contact
      const pursuit = pursuits.find(p => p.id === alert.pursuit_id)
      if (!pursuit?.client_contact_email) continue

      // Check if a nudge was already drafted/sent in the last 3 days
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

      const { data: recentEmails } = await supabase
        .from('funding_email_log')
        .select('id')
        .eq('opportunity_id', alert.opportunity_id)
        .in('email_type', ['nudge', 'deadline_reminder'])
        .gte('created_at', threeDaysAgo.toISOString())
        .limit(1)

      if (recentEmails && recentEmails.length > 0) continue

      // Auto-draft a nudge. status 'draft', never sent by this cron.
      const { error: draftErr } = dryRun
        ? { error: null }
        : await supabase.from('funding_email_log').insert({
        pursuit_id: alert.pursuit_id,
        opportunity_id: alert.opportunity_id,
        template_id: 'deadline_reminder',
        subject: `Heads up: ${alert.opportunity_name} deadline approaching`,
        body: `Hi ${pursuit.client_contact_name || 'there'},\n\nWanted to flag that the ${alert.opportunity_name} application window is closing soon. Everything is prepped on our end.\n\nCan we find 15 minutes to get this submitted together?\n\nRae`,
        to_email: pursuit.client_contact_email,
        to_name: pursuit.client_contact_name,
        status: 'draft',
        sent_by: 'system',
        email_type: 'deadline_reminder',
      })

      // Counted only once the row exists. Counting the attempt is how the
      // eligibility audit reported six questions raised and wrote zero.
      if (draftErr) {
        console.error('[funding-reminders] Could not draft nudge:', draftErr)
        draftFailures.push(`${alert.opportunity_name}: ${draftErr.message}`)
      } else {
        draftCount++
      }
    }

    // ── Local funder discovery: give the agents something to actually research ──
    //
    // Every school receives the same six national programmes and no local money
    // has ever been researched for anyone. The reason is structural, not a
    // dormant switch.
    //
    // find_work's research branch is keyed on an existing opportunity with
    // research_status 'requested'. So the only research the system can express
    // is "look into this funder we already know about". There is no shape for
    // "go find funders for this school", which is the thing we actually need,
    // and the one button that sets research_status can only be clicked on a row
    // that already exists. research_status reads 'none' on every opportunity
    // ever created.
    //
    // This creates the missing shape: one placeholder opportunity per pursuit
    // that has no local source yet, already marked as research requested, so
    // find_work hands it to an agent on the next sync. The agent researches the
    // families named in the description and creates real opportunities from
    // what it finds.
    //
    // Created once per pursuit and never duplicated. It is visible in the
    // opportunities list on purpose: a placeholder somebody can see and close is
    // better than a silent gap, which is what we have had.
    let discoveryCreated = 0
    const discoveryFailures: string[] = []
    // On a dry run these are what a person needs to read before any agent acts.
    const discoveryBriefs: { school: string; brief: string }[] = []
    const SEEDED_NATIONAL = /(NEA Learning|Walmart Spark)/i
    const DISCOVERY_NAME = 'Local funder discovery'

    // How often we go looking again. Local money is not a fixed list: budgets
    // are adopted, foundations open cycles, a district's circumstances change.
    // Rae's framing is that the system should always be looking, so absence of
    // a grant this month is never evidence there is nothing to find.
    const DISCOVERY_INTERVAL_DAYS = 30
    const nowMs = Date.now()

    for (const p of pursuits) {
      const oppsHere = opportunities.filter(o => o.pursuit_id === p.id)
      if (oppsHere.length === 0) continue

      // When did anyone last look for local money for this school?
      //
      // This replaces two guards that each locked discovery off permanently
      // rather than pausing it. The first skipped any pursuit that already had
      // a placeholder, and the placeholder is never deleted, only closed. The
      // second skipped any pursuit that had a local opportunity, so the moment
      // discovery succeeded it disqualified the school from ever running again.
      // Together they meant discovery could run exactly once per school, which
      // is what happened: three placeholders on 19 August and nothing since.
      //
      // Both questions collapse into one that is actually about time. A closed
      // placeholder and a real local grant are both evidence that somebody
      // looked, and both go stale.
      const lastLookedAt = oppsHere.reduce<number>((newest, o) => {
        const isPlaceholder = (o.name || '').startsWith(DISCOVERY_NAME)
        const cat = (o.plan_category || '').toUpperCase()
        const isLocalFind =
          (cat === 'C' || cat === 'D') && !SEEDED_NATIONAL.test(o.name || '')
        if (!isPlaceholder && !isLocalFind) return newest
        const at = o.created_at ? new Date(o.created_at).getTime() : 0
        return at > newest ? at : newest
      }, 0)

      // If last cycle's placeholder is still open, the work is queued and not
      // yet done. Adding a second one does not make an agent more likely to
      // pick it up; it just stacks unworked rows on the school. Wait.
      const openPlaceholder = oppsHere.some(
        o =>
          (o.name || '').startsWith(DISCOVERY_NAME) &&
          !['closed', 'awarded', 'denied', 'archived'].includes(
            (o.status || '').toLowerCase()
          )
      )
      if (openPlaceholder) continue

      const daysSinceLook = lastLookedAt
        ? Math.floor((nowMs - lastLookedAt) / 86400000)
        : Infinity
      if (daysSinceLook < DISCOVERY_INTERVAL_DAYS) continue

      const school = (p.district_name || p.pursuit_name || '')
        .replace(/^\(RENEWAL\)\s*/i, '')
        .replace(/\s*[-–]\s*Grant Fund(ing|ed)$/i, '')
        .trim()

      // Place and sector are what make this searchable at all. Without them the
      // brief reduces to "find local funders", which is why the ten families
      // below have never produced a single candidate.
      const place = [p.city, p.county, p.state_code].filter(Boolean).join(', ')
      const context = [
        place && `Location: ${place}.`,
        p.sector && `Sector: ${p.sector}.`,
        p.authorizer && `Governing body: ${p.authorizer}.`,
        p.employer_base && `Employers in or near the county: ${p.employer_base}.`,
      ].filter(Boolean).join(' ')

      // Built once, so what is shown on a dry run is byte for byte what gets
      // stored on a real one. A preview of something else is worthless.
      const brief =
          `Find local funding sources for ${school}. ` +
          (context ? `${context} ` : `No structured location on file. Establish city, county and sector first, or this search cannot be done properly. `) +
          `Work through: service clubs ` +
          `(Rotary, Lions, Kiwanis, Elks, Knights of Columbus); veteran posts ` +
          `(American Legion, VFW); the local employer base including plants and ` +
          `regional headquarters inside the county; county and regional community ` +
          `foundations; utility and rural electric cooperative funds; county farm ` +
          `bureaus; diocesan or denominational education offices where the school ` +
          `is faith-based; state and local union affiliates distinct from national ` +
          `NEA; pro sports team foundations near the county; and store-level retail ` +
          `or grocery community programmes. ` +
          `For each candidate confirm it is real and currently open before adding ` +
          `it: name, what it funds, typical award size, deadline or cycle, and how ` +
          `to apply. An unverified list is worse than no list. Create a real ` +
          `opportunity for each verified candidate, then close this placeholder.`

      const { error: discErr } = dryRun
        ? { error: null }
        : await supabase.from('funding_opportunities').insert({
        pursuit_id: p.id,
        name: `${DISCOVERY_NAME} — ${new Date(nowMs).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        plan_category: 'C',
        status: 'not_started',
        waiting_on: 'tdi',
        narrative_status: 'not_started',
        window_status: 'open',
        research_status: 'requested',
        assigned_agent: 'amara',
        // next_action, not notes. funding_opportunities has no notes column, so
        // every one of these inserts failed with an undefined-column error and
        // the only trace was a console line. That is why local funder discovery
        // has never run once. next_action is also the right home: this brief IS
        // what happens next.
        next_action: brief,
      })

      discoveryBriefs.push({ school, brief })

      if (discErr) {
        // Collected and returned, never only logged. A silent failure here cost
        // the system its entire local-funder capability for weeks.
        console.error('[funding-reminders] Failed to create discovery opportunity:', discErr)
        discoveryFailures.push(`${school}: ${discErr.message}`)
      } else {
        discoveryCreated++
        console.log('[funding-reminders] Requested local funder discovery for', school)
      }
    }

    // ── Signed contracts that were never linked to a gate ──
    //
    // This is the failure that cost the most and was hardest to see. St. Peter
    // Chanel signed on 11 June and 8 July. Nobody linked either quote to her
    // gate, so contract1_signed and contract2_signed stayed false, the gate
    // stayed shut, and find_work hid every drafting task from every agent for
    // eighteen days. Nothing reconciled it, nothing alerted on it, and the one
    // alert that did fire told Bella to chase Paula for signatures she had
    // already given.
    //
    // Deliberately detects rather than links. There is no reliable join from a
    // pursuit to its quotes: funding_pursuits keys on partnership_id, quotes key
    // on district_id, and partnerships carry no district_id at all. The only
    // available match is the organisation name, and auto-linking a contract on a
    // fuzzy name match is exactly the kind of inference that produced the wrong
    // records this whole cleanup has been unpicking.
    //
    // So it names the candidate quote and asks a person to confirm. One click
    // for them, no chance of binding the wrong contract to the wrong school.
    let unlinkedContracts = 0
    const unlinkedLines: string[] = []
    for (const p of pursuits) {
      const gate = gateByPursuit.get(p.id)
      if (!gate) continue
      const needsC1 = !gate.contract1_quote_id
      const needsC2 = !gate.contract2_quote_id
      if (!needsC1 && !needsC2) continue

      // Strip the bookkeeping the pursuit name carries so it can match a quote's
      // organisation field.
      const school = (p.district_name || p.pursuit_name || '')
        .replace(/^\(RENEWAL\)\s*/i, '')
        .replace(/\s*[-–]\s*Grant Fund(ing|ed)$/i, '')
        .trim()
      if (school.length < 4) continue

      const { data: candidates } = await supabase
        .from('quotes')
        .select('id, quote_number, contract_type, signed_at, contact_organization')
        .eq('status', 'signed')
        .ilike('contact_organization', `%${school}%`)

      for (const q of candidates || []) {
        const wantedType = needsC1 && q.contract_type === 'minimum'
          ? 'first agreement'
          : needsC2 && q.contract_type === 'grant_funded'
            ? 'second agreement'
            : null
        if (!wantedType) continue
        unlinkedContracts++
        unlinkedLines.push(
          `  • ${school}: ${q.quote_number} (${q.contract_type}) signed ` +
            `${(q.signed_at || '').split('T')[0]} is not linked as the ${wantedType}`,
        )
      }
    }

    // ── One daily message to Bella: what is waiting for her to send ──
    //
    // The follow-up cron no longer emails schools. It writes a draft and stops,
    // which makes her queue the place work waits. Nothing told her it was there.
    //
    // That gap is not theoretical. funding_email_log held 56 rows and every one
    // was 'sent', meaning no draft had ever existed before the drafting rule
    // shipped, and the queue had never been somewhere anyone needed to look.
    // Two finished Saunemin applications also sat unapproved for a day because
    // nothing announced them.
    //
    // Deliberately one message per day rather than one per draft. The last
    // notification problem in this system was volume, and a per-draft ping on a
    // busy afternoon rebuilds it in a new place.
    //
    // This cron runs once daily on its own schedule, so no hour guard is needed
    // here, unlike the agent-overdue digest which fakes "daily" with an hour
    // equality inside an hourly job.
    // ── Shared helper: schools, not bookkeeping ──
    // "(RENEWAL) Allenwood Elementary - Grant Funded" is internal. Bella reads
    // this every morning, so it should say the school's name and nothing else.
    const tidySchool = (raw: string | null | undefined) =>
      (raw || '')
        .replace(/^\(RENEWAL\)\s*/i, '')
        .replace(/\s*[-–]\s*Grant Fund(ing|ed)$/i, '')
        .trim() || 'unknown school'
    const nameFor = new Map(
      pursuits.map(p => [p.id, tidySchool(p.district_name || p.pursuit_name)]),
    )

    const { data: pendingDrafts } = await supabase
      .from('funding_email_log')
      .select('id, subject, to_name, to_email, pursuit_id, created_at')
      .eq('status', 'draft')
      .order('created_at', { ascending: true })
    const draftsWaiting = pendingDrafts?.length ?? 0

    const { data: openQuestions } = await supabase
      .from('funding_action_items')
      .select('id, title, client_label, pursuit_id, due_date')
      .eq('requires_answer', true)
      .is('answer', null)
      .in('status', ['pending', 'in_progress'])

    // ── ONE message to Bella, ordered by what it costs to ignore ──
    //
    // This replaces three separate Slack posts, and it exists because the
    // alerting we already had failed in exactly the way more posts would.
    //
    // Stall detection works. It fired every single day for four weeks on a
    // school that had completely stopped moving, and nothing happened. Three
    // reasons, none of them detection: the digest is addressed to Rae rather
    // than to Bella who owns the work, it arrives carrying twenty-odd items,
    // and a school frozen for a month is weighted the same as a window that
    // needs confirming.
    //
    // So: one message, to the person who owns it, sections ordered by cost,
    // and everything routine collapsed into a count rather than a list. If she
    // reads only the first section, she has done the most valuable thing
    // available to her that day.
    const sections: string[] = []
    const cap = (arr: string[], n: number) =>
      arr.length > n ? [...arr.slice(0, n), `  • and ${arr.length - n} more`] : arr

    const decisions = opportunities
      .filter(o => o.narrative_status === 'escalated')
      .map(o => `  • ${nameFor.get(o.pursuit_id) ?? 'unknown'}: ${o.name} needs a decision`)
    if (decisions.length) sections.push(`*Needs a decision from you (${decisions.length})*\n${cap(decisions, 6).join('\n')}`)

    const approvals = opportunities
      .filter(o => o.narrative_status === 'approval')
      .map(o => `  • ${nameFor.get(o.pursuit_id) ?? 'unknown'}: ${o.name} passed QA and is waiting`)
    if (approvals.length) sections.push(`*Finished, waiting on your approval (${approvals.length})*\n${cap(approvals, 6).join('\n')}`)

    const draftLines = (pendingDrafts ?? []).map(d =>
      `  • ${d.to_name || d.to_email || 'unknown'}, ${nameFor.get(d.pursuit_id) ?? 'unknown'}: ${d.subject}`)
    if (draftLines.length) sections.push(`*Written and waiting for you to send (${draftLines.length})*\n${cap(draftLines, 6).join('\n')}`)

    if (unlinkedContracts > 0) {
      sections.push(
        `*Signed contracts that may not be linked (${unlinkedContracts})*\n` +
        `${cap(unlinkedLines, 6).join('\n')}\n` +
        `  _a shut gate stops all drafting silently_`)
    }

    const questionLines = (openQuestions ?? []).map(q =>
      `  • ${nameFor.get(q.pursuit_id) ?? 'unknown'}: ${q.client_label || q.title}`)
    if (questionLines.length) sections.push(`*Asked and not answered (${questionLines.length})*\n${cap(questionLines, 6).join('\n')}`)

    // Paths the stop rule refused. This is the safety net for blocking being on
    // from day one: if a rule is wrong it surfaces here within a day, rather
    // than quietly holding a real path for weeks.
    const { data: stopped } = await supabase
      .from('funding_opportunities')
      .select('name, pursuit_id, eligibility_verdict, eligibility_reason')
      .in('eligibility_verdict', ['stop', 'ask_first'])
      .eq('eligibility_overridden', false)
      .not('eligibility_checked_at', 'is', null)

    const stoppedLines = (stopped ?? [])
      .filter(o => activeIds.has(o.pursuit_id))
      .map(o => `  • ${nameFor.get(o.pursuit_id) ?? 'unknown'}: ${o.name}: ${o.eligibility_reason}`)
    if (stoppedLines.length) {
      sections.push(
        `*Paths stopped before drafting (${stoppedLines.length})*\n` +
        `${cap(stoppedLines, 5).join('\n')}\n` +
        `  _if any of these looks wrong, the rule is wrong, and it can be overridden_`)
    }

    // Applications sitting with a funder past the point where a decision would
    // normally have landed. This is the only section about money already in
    // play, and it is the one place where the answer may already exist and
    // simply never reached us: the funder replies to the school, not to TDI, so
    // an award can sit unrecorded indefinitely with nothing prompting anyone to
    // ask. Criticals are listed; the softer 30-day check-ins roll into the tail
    // count so this section stays short enough to act on.
    const awaitingDecision = alerts.filter(
      a => a.category === 'submission' && a.severity === 'critical')
    if (awaitingDecision.length) {
      const decisionLines = awaitingDecision.map(a =>
        `  • ${tidySchool(a.pursuit_name)}: ${a.title.replace(`${a.opportunity_name} `, `${a.opportunity_name}, `)}`)
      sections.push(
        `*Waiting on a funder's answer (${awaitingDecision.length})*\n` +
        `${cap(decisionLines, 6).join('\n')}\n` +
        `  _ask the school what they have heard, then record the award or denial_`)
    }

    const stalled = alerts.filter(a => a.category === 'stalled')
    if (stalled.length) {
      const byPursuit = new Map<string, number>()
      for (const a of stalled) byPursuit.set(a.pursuit_name, (byPursuit.get(a.pursuit_name) ?? 0) + 1)
      const stallLines = [...byPursuit.entries()].map(([name, n]) =>
        `  • ${tidySchool(name)}: ${n} path${n === 1 ? '' : 's'} with no movement`)
      sections.push(`*Not moving (${stalled.length})*\n${cap(stallLines, 6).join('\n')}`)
    }

    // Everything else becomes a number, not a list. This is the part that stops
    // the message turning back into wallpaper.
    const accountedFor =
      decisions.length + approvals.length + stalled.length + awaitingDecision.length
    const remaining = Math.max(0, alerts.length - accountedFor)

    let digestPosted = false
    if (sections.length > 0) {
      const settings = await loadSettings()
      if (settings.slack_enabled && settings.slack_webhook_url && !dryRun) {
        const mention = settings.bella_slack_handle ? ` <@${settings.bella_slack_handle}>` : ''
        const portalUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.teachersdeserveit.com'
        const tail = remaining > 0
          ? `\n_${remaining} other open alert${remaining === 1 ? '' : 's'} in the portal, none urgent._`
          : ''
        await fetch(settings.slack_webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text:
              `*Grant work for today*${mention}\n\n` +
              `${sections.join('\n\n')}\n` +
              `${tail}\n` +
              `<${portalUrl}/tdi-admin/funding|Open the funding portal>`,
          }),
          // Loud on failure. Silence here means she is never told and the work
          // sits unseen, which is the failure this exists to prevent.
        }).catch(err => console.error('[funding-reminders] Daily digest post failed:', err))
        digestPosted = true
      } else {
        console.log('[funding-reminders] Slack disabled — would have posted', sections.length, 'section(s)')
      }
    }

    return NextResponse.json({
      success: true,
      alerts_count: alerts.length,
      critical_count: critical.length,
      warning_count: warnings.length,
      drafts_created: draftCount,
      drafts_waiting: draftsWaiting,
      digest_posted: digestPosted,
      digest_sections: sections.length,
      unlinked_contracts: unlinkedContracts,
      dryRun,
      wouldSend: dryRun
        ? 'Nothing was sent and nothing was written. On a real run the digest goes to Rae, nudges are inserted as drafts and never sent, and Slack posts to the internal webhook. No school contact is ever emailed by this cron.'
        : undefined,
      drafts_failed: draftFailures.length,
      draft_failures: draftFailures,
      discovery_requested: discoveryCreated,
      discovery_briefs: discoveryBriefs,
      discovery_failed: discoveryFailures.length,
      discovery_failures: discoveryFailures,
      digest_sent: alerts.length > 0,
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function buildDigestEmail(
  critical: any[],
  warnings: any[],
  pursuits: any[]
): string {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  let html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1B365D; color: white; padding: 20px 24px; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; font-size: 18px; font-weight: 700;">Funding Daily Digest</h1>
        <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.8;">${today}</p>
      </div>
      <div style="background: white; padding: 20px 24px; border: 1px solid #E5E7EB; border-top: none; border-radius: 0 0 12px 12px;">
  `

  if (critical.length > 0) {
    html += `<h2 style="color: #DC2626; font-size: 14px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">Critical (${critical.length})</h2>`
    critical.forEach(a => {
      html += `
        <div style="padding: 10px 14px; margin-bottom: 8px; background: #FEF2F2; border-radius: 8px; border-left: 3px solid #DC2626;">
          <p style="margin: 0; font-size: 13px; font-weight: 600; color: #1e2749;">${a.title}</p>
          <p style="margin: 2px 0 0; font-size: 11px; color: #6B7280;">${a.pursuit_name} &middot; ${a.description}</p>
          <p style="margin: 4px 0 0; font-size: 11px; color: #DC2626; font-weight: 600;">Action: ${a.action}</p>
        </div>
      `
    })
  }

  if (warnings.length > 0) {
    html += `<h2 style="color: #D97706; font-size: 14px; margin: 16px 0 12px; text-transform: uppercase; letter-spacing: 0.5px;">Warnings (${warnings.length})</h2>`
    warnings.forEach(a => {
      html += `
        <div style="padding: 10px 14px; margin-bottom: 8px; background: #FFFBEB; border-radius: 8px; border-left: 3px solid #F59E0B;">
          <p style="margin: 0; font-size: 13px; font-weight: 600; color: #1e2749;">${a.title}</p>
          <p style="margin: 2px 0 0; font-size: 11px; color: #6B7280;">${a.pursuit_name} &middot; ${a.description}</p>
        </div>
      `
    })
  }

  html += `
        <p style="margin: 20px 0 0; font-size: 11px; color: #9CA3AF; text-align: center;">
          ${pursuits.length} active pursuits &middot; View details at /tdi-admin/funding
        </p>
      </div>
    </div>
  `

  return html
}
