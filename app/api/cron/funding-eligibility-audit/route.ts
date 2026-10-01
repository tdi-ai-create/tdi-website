import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { guardCron } from '@/lib/cron-guard'
import { isAgentWindowWork } from '@/lib/funding-window-work'
import { isOver, isWithFunder } from '@/lib/funding-status'
import { closePathWithReason, cancelWorkOnClosedPath } from '@/lib/funding-path-closure'
import { readTdiFacts, answeredCredential, missingCredentials } from '@/lib/funding/tdi-facts'
import { buildDecisionBrief, renderDecisionBrief } from '@/lib/funding-decision-brief'
import { readFunderViability, viabilityOf } from '@/lib/funding-funder-viability'
import { answeredBefore } from '@/lib/funding-answer-to-fact'
import {
  screenPath,
  isPastDrafting,
  eligibilityQuestionTitle,
  ownerOfBlockedPath,
  deadEndTitle,
  type EligibilityResult,
} from '@/lib/funding-eligibility'
import { NOT_TERMINAL_FILTER } from '@/lib/funding/task-status'

/**
 * The monthly eligibility re-audit.
 *
 * The stop rule has existed since 17 Aug but only ever ran at two moments: when
 * someone requested a draft, and on sync. Measured on 19 Aug: 2 of 26 grant
 * paths had ever been screened. The other 24 had never been checked by any
 * rule, which means a school could be carrying a path it can never win and
 * nothing in the system would say so until an agent had written three drafts.
 *
 * This runs the same rules over every open path on a schedule, so a path that
 * has quietly become unwinnable stops before more work goes into it.
 *
 * Two things it deliberately does NOT do:
 *   - it never overturns a human override. If a person disagreed with a rule
 *     and said so, that decision stands until they change it.
 *   - it never deletes a path. A stopped path keeps its reason, its decider and
 *     its date, and can be reopened.
 *
 * Dry run: /api/cron/funding-eligibility-audit?dryRun=1
 * Computes every verdict and reports the full decision set, writing nothing.
 */

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase credentials')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

/** The school_profile column has been double encoded in places. Tolerate both. */
function readProfile(raw: unknown): Record<string, unknown> {
  try {
    if (!raw) return {}
    const once = typeof raw === 'string' ? JSON.parse(raw) : raw
    return (typeof once === 'string' ? JSON.parse(once) : once) as Record<string, unknown>
  } catch {
    return {}
  }
}

/**
 * Paths that are finished. Re-screening them would churn history for no
 * benefit and could reopen a decision someone already made.
 *
 * This was a local set of five: awarded, denied, closed, submitted, applied.
 * It is the union of two definitions that already have an owner in
 * lib/funding-status.ts, so the local copy was a third answer waiting to drift
 * from the other two. Composed from the owned pair instead.
 *
 * The composition is deliberately wider than the set it replaces. isOver also
 * covers not_applicable, cancelled and archived, which the local set omitted,
 * so those three were being re-screened every month despite being dead. Skipping
 * them is what the comment above always claimed to do.
 */
function isSettled(status?: string | null): boolean {
  return isWithFunder(status) || isOver(status)
}

interface Change {
  school: string
  path: string
  from: string | null
  to: EligibilityResult['verdict']
  rule: string
  reason: string
}

export async function GET(request: NextRequest) {
  const guard = guardCron(request)
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status ?? 401 })
  }
  const { dryRun } = guard

  try {
    const supabase = getSupabase()

    // Archived schools are excluded, exactly as the daily reminders cron does.
    // Without this the audit raised three questions for Glen Ellyn, a school
    // that is archived because it is not doing grant work at all. Work invented
    // for a school nobody is working with is worse than no work.
    const { data: pursuits, error: pErr } = await supabase
      .from('funding_pursuits')
      .select('id, district_name, sector, county, state_code, school_profile')
      .neq('archived', true)

    if (pErr) {
      console.error('[eligibility-audit] Could not read pursuits:', pErr)
      return NextResponse.json({ error: pErr.message }, { status: 500 })
    }

    const { data: opportunities, error: oErr } = await supabase
      .from('funding_opportunities')
      // assigned_agent and window_checked_at decide whether a window question
      // belongs to the research agent or has already been through her.
      // research_status is what isAgentWindowWork actually keys on. Without it
      // the predicate reads undefined, returns false for everything, and the
      // deferral silently does nothing while looking as though it works. The
      // dry run caught exactly that on the first attempt.
      // application_closes joined this list on 15 Sep 2026, when
      // windowIsUnestablished started counting 'open' with no closing date as
      // unestablished. Omitting it reads undefined, which is falsy, so every
      // open row would look like it had no closing date and the predicate
      // would widen to all of them. Same trap as research_status above, in the
      // opposite direction.
      .select('id, name, pursuit_id, status, client_submitted, research_status, window_status, window_checked_at, application_closes, funder_id, next_action, assigned_agent, eligibility_verdict, eligibility_overridden')

    if (oErr) {
      console.error('[eligibility-audit] Could not read opportunities:', oErr)
      return NextResponse.json({ error: oErr.message }, { status: 500 })
    }

    const bySchool = new Map((pursuits ?? []).map(p => [p.id, p]))

    // What we know about ourselves, read once for the whole run.
    //
    // One screening rule is about TDI rather than about the school: whether we
    // are authorized to deliver under a state administered programme. It used
    // to fire on the grant's name alone, so it re-raised the same question on
    // every school every month and none of those askings could ever be
    // satisfied by another's answer. On Saunemin it stayed open 26 days and was
    // auto-cancelled unanswered when the path closed.
    const { facts: tdiFacts, error: tdiErr } = await readTdiFacts(supabase)
    if (tdiErr) {
      // Not fatal, and deliberately not silent. With no facts the screen
      // behaves exactly as it did before this change: it asks. Reporting it
      // matters because "we asked again" and "we could not tell whether we
      // already knew" look identical from the outside.
      console.error('[eligibility-audit] Could not read what we know about TDI:', tdiErr)
    }

    // The catalogue's viability findings, read once. A funder that is not
    // running a cycle stops every school carrying it, which is the whole point
    // of holding the answer on the funder rather than on each pursuit.
    const { byFunderId: funderViability, error: viabErr } = await readFunderViability(supabase)
    if (viabErr) {
      // Not fatal, and not silent. With no findings the screen behaves as it
      // did before, which is to judge each path on its own merits.
      console.error('[eligibility-audit] Could not read funder viability:', viabErr)
    }

    const statesWeWorkIn = [
      ...new Set(
        (pursuits ?? [])
          .map(p => p.state_code)
          .filter((c): c is string => Boolean(c)),
      ),
    ]

    const changes: Change[] = []
    const questionsToRaise: { school: string; path: string; question: string; because: string }[] = []
    const questionsExisting: string[] = []
    // Questions not asked because this school already answered them. Reported
    // rather than dropped: silence here is indistinguishable from having had
    // nothing to ask.
    const alreadyAnswered: {
      school: string; path: string; question: string; answeredOn: string; answer: string | null
    }[] = []
    // Window questions handed to the research agent instead of to a person.
    const questionsDeferredToAgent: string[] = []
    const questionsFailed: { school: string; path: string; question: string; because: string; error: string }[] = []
    const unchanged: string[] = []
    // Paths the screen ended this run, and the ones it tried to end and could not.
    const closures: { school: string; path: string; rule: string; reason: string; workCancelled?: number }[] = []
    const closureFailures: { school: string; path: string; rule: string; reason: string; error: string }[] = []
    const skipped: { path: string; why: string }[] = []
    const counts = { stop: 0, ask_first: 0, clear: 0 }

    for (const opp of opportunities ?? []) {
      const school = bySchool.get(opp.pursuit_id)
      if (!school) {
        skipped.push({ path: opp.name ?? opp.id, why: 'no school on this path' })
        continue
      }
      if (opp.eligibility_overridden === true) {
        skipped.push({ path: opp.name ?? '', why: 'a person overrode this rule' })
        continue
      }
      if (isSettled(opp.status)) {
        skipped.push({ path: opp.name ?? '', why: `already ${opp.status}` })
        continue
      }

      const profile = readProfile(school.school_profile)

      const result = screenPath(
        {
          name: opp.name ?? '',
          windowStatus: opp.window_status ?? null,
          namedApplicant: (profile.nea_member_name as string) ?? null,
          alreadySubmitted: isPastDrafting(opp.status, opp.client_submitted),
          // One decision, every school. Null for the opportunities with no
          // catalogue link, which behave exactly as they did before.
          funderNotContinuing: (() => {
            const v = viabilityOf(opp.funder_id ? funderViability.get(opp.funder_id) : null)
            return v.stop && v.reason ? { reason: v.reason } : null
          })(),
        },
        {
          sector: school.sector ?? null,
          county: school.county ?? null,
          stateCode: school.state_code ?? null,
          titleIStatus: (profile.title_i_status as string) ?? null,
          designation: (profile.designation as string) ?? null,
        },
        {
          // Scoped to this school's state, falling back to a fact recorded as
          // true everywhere. An Illinois answer says nothing about New Jersey.
          tdiAuthorizationConfirmed: Boolean(
            answeredCredential(tdiFacts, 'approved_provider_status', school.state_code ?? null),
          ),
        },
      )

      counts[result.verdict]++

      // An "ask first" verdict means the system has concluded a person must
      // confirm something. Until now it could reach that conclusion and tell
      // nobody, which is why six paths are waiting on questions that were never
      // asked. Raise it as a real question, owned by a person, that cannot be
      // closed without recording what they were told.
      if (result.verdict === 'ask_first') {
        // The grant leads. Without it a person reading their list sees four
        // rows of the same sentence and has to open each one to find the
        // funder they are looking for.
        const title = eligibilityQuestionTitle(result.rule, opp.name)

        // Do not put an agent's research on a person's list.
        //
        // The `window` rule asks whether a funder is open and when it closes.
        // That is research, and find_work already hands it to the assigned
        // research agent as `confirm_window`. Raising it here as well asks the
        // same question twice, of two different parties, and only the human one
        // is visible, so it looks like the person's job.
        //
        // Bella hit this on 8 Sep 2026 and asked in Slack whether she should
        // just answer them herself. Five window questions were on her list;
        // Amara's queue for the same funders was empty, because the recheck
        // floor keyed on updated_at and any write suppressed it. That floor is
        // fixed separately. This stops the question reaching a person before
        // the agent has had it at all.
        //
        // It comes to a person once the agent has actually looked and still
        // could not establish it, which window_checked_at now records honestly.
        //
        // The test is shared with find_work rather than written twice. Keyed on
        // research_status, not on a named agent: unassigned research is offered
        // to whoever asks, so requiring a name here would have sent Casey's
        // Cash for Classrooms and Corn Belt Energy to Bella while Amara was
        // being offered both.
        if (result.rule === 'window' && isAgentWindowWork(opp)) {
          questionsDeferredToAgent.push(`${school.district_name} · ${opp.name}`)
          continue
        }

        // Idempotent. A monthly re-audit must not stack twelve copies of the
        // same unanswered question.
        const { data: already } = await supabase
          .from('funding_action_items')
          .select('id')
          .eq('opportunity_id', opp.id)
          .eq('requires_answer', true)
          .not('status', 'in', NOT_TERMINAL_FILTER)
          .limit(1)
          .maybeSingle()

        if (already) {
          questionsExisting.push(`${school.district_name} · ${opp.name}`)
          continue
        }

        // Ask once. The check above only sees a question that is still open, so
        // once a school answered, the row went terminal and the next monthly
        // run asked them again. Six of the eight approaches we made to one
        // superintendent were repeats of two questions he had already answered.
        //
        // Keyed on the school rather than the grant, because these are facts
        // about the school. His union membership does not change between
        // grants, so re-raising it on the next grant is the same question
        // wearing a different name.
        const { prior, error: priorErr } = await answeredBefore(
          supabase,
          opp.pursuit_id,
          title,
        )
        if (priorErr) {
          // Failing to find a prior answer and failing to look are opposite
          // things. Treating the second as the first is what produced the
          // seventh asking, so this is reported rather than assumed clear.
          console.error('[eligibility-audit] Could not check for a prior answer:', priorErr)
          questionsFailed.push({
            school: school.district_name ?? '',
            path: opp.name ?? '',
            question: title,
            because: 'Could not check whether this was already answered',
            error: priorErr,
          })
          continue
        }
        if (prior) {
          alreadyAnswered.push({
            school: school.district_name ?? '',
            path: opp.name ?? '',
            question: title,
            answeredOn: prior.answeredAt ? String(prior.answeredAt).slice(0, 10) : 'unknown',
            answer: prior.answer,
          })
          continue
        }

        {
          // What the agent found, when she has already looked.
          //
          // A window question only reaches a person after the research agent
          // has tried and could not establish it, and her finding is the most
          // useful thing on the row: not "we do not know", but "the foundation
          // has no public application process, call 703-726-7000". Without this
          // the person restarts research the agent already did and wrote down.
          //
          // It lives on funding_opportunities.next_action, which is where the
          // sync API puts an agent's note. Trimmed rather than truncated, so a
          // long finding arrives whole.
          const agentFinding =
            result.rule === 'window' && opp.window_checked_at && typeof opp.next_action === 'string'
              ? opp.next_action.trim()
              : ''

          // The finding leads, the standing rule follows.
          //
          // The rule sentence is boilerplate: identical on every one of these
          // apart from the funder name, and the reader has seen it five times
          // already. What the agent found is the only part that tells them what
          // to do next, so it goes first and the rule becomes the footnote it
          // actually is.
          const because = agentFinding
            ? `The research agent already looked, on ${String(opp.window_checked_at).slice(0, 10)}, and could not establish the window. This is what she found:\n\n${agentFinding}\n\nWhy it still blocks drafting: ${result.reason}`
            : result.reason

          const intended = {
            school: school.district_name ?? '',
            path: opp.name ?? '',
            question: agentFinding ? deadEndTitle(opp.name ?? 'This grant') : title,
            because,
            agentAlreadyLooked: Boolean(agentFinding),
            // Named in the dry run, because who it lands on is the thing that
            // changed and a preview that hides it is not a preview.
            owner: ownerOfBlockedPath(Boolean(agentFinding)).ownerName,
            // Surfaced in the preview, because a recommendation nobody can see
            // before it ships is not reviewable.
            recommendation: agentFinding ? buildDecisionBrief(opp).recommendation : null,
          }

          if (dryRun) {
            questionsToRaise.push(intended)
          } else {
            // A dead end goes to Rae as a decision, not to Bella as research.
            //
            // The agent has already looked and could not establish it, so
            // "answer this" is asking a manager to succeed where the research
            // failed. What is actually needed is a call on whether the funder
            // is worth pursuing, which is Rae's. Anything the agent has not
            // yet tried still goes to Bella, because chasing a school is hers.
            const owner = ownerOfBlockedPath(Boolean(agentFinding))
            const itemTitle = agentFinding ? deadEndTitle(opp.name ?? 'This grant') : title
            // The three facts the choice turns on, printed rather than left to
            // be researched. Two of these items sat untouched on Saunemin
            // because answering either one meant going and finding this out
            // first.
            const brief = agentFinding ? buildDecisionBrief(opp) : null

            const closing = agentFinding
              ? `\n\nResearch is exhausted on this one. The choice is to act on what she suggests, ` +
                `drop the path, or pursue it anyway knowing the window is unconfirmed. ` +
                `Nothing will be drafted for "${opp.name}" until that is decided.` +
                (brief ? `\n\n${renderDecisionBrief(brief)}` : '')
              : `\n\nNothing will be drafted for "${opp.name}" until this is answered.`

            const { error: qErr } = await supabase.from('funding_action_items').insert({
              pursuit_id: opp.pursuit_id,
              opportunity_id: opp.id,
              owner_type: 'tdi',
              // Named, not just typed. An item with owner_type 'tdi' and no
              // owner_name renders with an empty owner and cannot be filtered
              // to a person. Eleven of nineteen open items were in that state.
              owner_name: owner.ownerName,
              owner_email: owner.ownerEmail,
              title: itemTitle,
              description: `${because}${closing}`,
              // 'pending' and 'gate' because those are what the CHECK
              // constraints on this table allow. 'open' and 'eligibility' were
              // rejected on every insert, and because the failure was only
              // logged, the run reported six questions raised while writing
              // none. A gate is also the honest description: this is a rule
              // that holds work back until a person answers.
              status: 'pending',
              category: 'gate',
              requires_answer: true,
              due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
            })
            // Only count it once the database has accepted it. Counting the
            // intent is how a run reported six questions raised and created
            // zero, with nothing but a console line to say so.
            if (qErr) {
              console.error(`[eligibility-audit] Could not raise question for ${opp.id}:`, qErr)
              questionsFailed.push({ ...intended, error: qErr.message })
            } else {
              questionsToRaise.push(intended)
            }
          }
        }
      }

      // ── A 'stop' ends the path, and the log says why ──
      //
      // Before this, a stop verdict was recorded on the row and nothing else
      // happened. The path stayed open at whatever status it held, kept its
      // open action items, and kept being offered work: St. Peter Chanel's
      // Community Schools Budget was a private school against a federal
      // programme, verdict 'stop', rule 'sector', and the only thing the
      // portal had to say about it was that an agent should go and establish
      // its window. Nothing anywhere recorded that the school did not qualify.
      //
      // Placed above the unchanged check on purpose. A path that was already
      // 'stop' before this ran is precisely the backlog this is meant to
      // clear, and continuing past it as "unchanged" would leave every
      // existing one open forever.
      if (result.verdict === 'stop' && !isSettled(opp.status)) {
        const intended = {
          school: school.district_name ?? '',
          path: opp.name ?? '',
          rule: result.rule,
          reason: result.reason,
        }
        if (dryRun) {
          closures.push(intended)
        } else {
          const closure = await closePathWithReason(supabase, {
            opportunityId: opp.id,
            reason: result.reason,
            rule: result.rule,
          })
          if (closure.closed) {
            const tidy = await cancelWorkOnClosedPath(supabase, opp.id)
            if (tidy.error) console.error(`[eligibility-audit] ${tidy.error}`)
            closures.push({ ...intended, workCancelled: tidy.cancelled })
          } else {
            // Counted as a failure, never as a closure. A run that reports
            // eight closed and closed six is the reporting bug this codebase
            // keeps paying for.
            console.error(`[eligibility-audit] Could not close ${opp.id}:`, closure.error)
            closureFailures.push({ ...intended, error: closure.error ?? 'unknown' })
          }
        }
      }

      if (result.verdict === opp.eligibility_verdict) {
        unchanged.push(opp.name ?? '')
        continue
      }

      changes.push({
        school: school.district_name ?? '',
        path: opp.name ?? '',
        from: opp.eligibility_verdict ?? null,
        to: result.verdict,
        rule: result.rule,
        reason: result.reason,
      })

      if (!dryRun) {
        const { error: uErr } = await supabase
          .from('funding_opportunities')
          .update({
            eligibility_verdict: result.verdict,
            eligibility_reason: result.reason,
            eligibility_rule: result.rule,
            eligibility_checked_at: new Date().toISOString(),
          })
          .eq('id', opp.id)

        if (uErr) {
          console.error(`[eligibility-audit] Could not record verdict for ${opp.id}:`, uErr)
        }
      }

    }

    return NextResponse.json({
      dryRun,
      scanned: opportunities?.length ?? 0,
      schools: pursuits?.length ?? 0,
      verdicts: counts,
      changed: changes.length,
      changes,
      questionsDeferredToAgent: questionsDeferredToAgent.length,
      deferredToAgent: questionsDeferredToAgent,
      questionsRaised: questionsToRaise.length,
      questions: questionsToRaise,
      questionsAlreadyOpen: questionsExisting.length,
      questionsNotReAsked: alreadyAnswered.length,
      alreadyAnswered,
      // Surfaced in the response, never only in a log. A silent write failure
      // is indistinguishable from success to whoever reads this.
      questionsFailed: questionsFailed.length,
      questionFailures: questionsFailed,
      unchangedCount: unchanged.length,
      // Reported as its own number rather than folded into `changed`. Closing a
      // school's funding path is the most consequential thing this route does
      // and the one a wrong rule would do wholesale.
      pathsClosed: closures.length,
      closures,
      closuresFailed: closureFailures.length,
      closureFailures,
      skipped,
      // What we still do not know about ourselves, across the states we work
      // in. Listed rather than counted: a count says there is a problem, a
      // list says what to go and find out. This is the answer to "why did that
      // grant stop and whose question was it".
      ourOwnOpenQuestions: missingCredentials(tdiFacts, statesWeWorkIn).length,
      aboutUs: missingCredentials(tdiFacts, statesWeWorkIn),
      couldNotReadOurOwnFacts: tdiErr ?? null,
      note: dryRun
        ? 'Nothing was written and nothing was closed. Every verdict and closure above was computed against live data.'
        : 'Verdicts recorded. No path was deleted and no human override was touched.',
    })
  } catch (error) {
    console.error('[eligibility-audit] Failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
