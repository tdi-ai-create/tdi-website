# Leadership Dashboard Standard

First draft, 30 September 2026. Canonical copy. The readable version is published
at https://claude.ai/code/artifact/56c3c43c-77f2-410e-80de-90d58221b245 and must
be republished from this file's content when this changes.

What every partner dashboard must contain, how it must be laid out, which numbers
it is allowed to show, and what must be answered before one can be built.

Written from a full audit of Addison SD4, where roughly a dozen distinct failures
were found on one live dashboard in a single day. Every rule cites the failure
that produced it. **Report findings by rule ID**, for example "glen-ellyn fails
L4.1".

---

## L0. What a leadership dashboard is for

A partner dashboard exists so that a school leader, alone, at nine at night, can
see what their investment produced and decide to continue it.

Three readers, in priority order: the leader, the leader's board or cabinet, and
us last.

**The two laws.** Highlight what is going well. And an unfavourable number never
renders without a TDI solution beside it that makes the fix easy for the leader.

**The renewal test.** Every component helps the leader decide, act, or report
upward. One that does none is decoration and comes out.

---

## L1. Intake: what must be answered before a dashboard exists

Unanswered, each of these guarantees a specific break.

**The partnership.** What they bought as line items with counts. Contract start
and end, and whether it is a full school year. School or district, and if a
district, the buildings. Which deliverables are used and which remain.

**The people.** Who is on staff, by email. Which building each person works in.
Each person's role in our vocabulary. Whether every seat holder is on the roster
and every roster member holds a seat.

**The goals.** What the leader wants to change this year in their words. The
instrument for each, and whether we already have it. The baseline and when it was
taken. The target and why that number. What the instrument cannot see. What TDI
is doing about it.

**History and measurement.** Whether a prior year record exists. Whether
instruments changed between years, including direction and scale. Who reads this,
how often, and what decision it feeds. What this leader has already told us they
cannot see.

**The intake rule.** An unanswered question renders as a labelled blank naming
who owes the answer. Never a zero and never silence. A fact only the district
knows becomes a labelled blank; anything we could have found out ourselves stays
our job.

---

## L2. Information architecture

Canonical order: Overview, one tab per school year oldest to newest, Reports,
Schools, Team. The story, then the people.

- **L2.1** Overview is first and is a snapshot, never a dumping ground.
- **L2.2** One tab per school year, chronological, each badged. `Complete` grey,
  `Live` teal, `Proposed` gold. Exactly one Live.
- **L2.3** The live year carries the partnership, not a separate tab. For a year
  in progress, the plan is the record.
- **L2.4** Within the live year: hero, numbers, what stood out, who is still to
  reach, what the team is working on, what the partnership includes, history, the
  recommendation, the timeline, then what districts add next. Results precede
  context; context precedes anything we sell.
- **L2.5** No tab may be a placeholder for a partnership past month one.
- **L2.6** Every tab has a panel and every panel has a tab.
- **L2.7** A tab's `aria-controls` names a panel that exists.
- **L2.8** Conditional tabs appear only when their data exists.

---

## L3. Component standards

- **L3.1** Identity header: name, type, phase, contract period, two actions.
  Months when the contract sits inside one calendar year; never two identical
  years.
- **L3.2** Every goal carries five parts: label, current against target, how it is
  measured, where the number comes from, and what TDI is doing about it.
- **L3.3** A goal without a baseline shows a dashed bar and the target.
- **L3.4** Three to four goals, and no goal we cannot measure.
- **L3.5** A year record opens with a sentence, not a number.
- **L3.6** Years are mirrored in shape so they read against each other.
- **L3.7** A proposed year is visibly a proposal.
- **L3.8** Engagement ranks content by distinct people, not events, and says
  nobody assigned it.
- **L3.9** The roster is the denominator and reconciles to the seat list both ways.
- **L3.10** A building with no staff mapping says so and says what would fix it.
  A building with a mapping shows its own figures, and opens into its own people
  and its own content. Never an indicator fed a hardcoded null: every building on
  every dashboard read "Awaiting Data" for months because of exactly that.
- **L3.10a** Content inside a school panel is reported as a share of that
  school's team, never a headcount. In a building of one, "1 person" names them.
- **L3.11** A report is locked only by a rolling measure, and the lock tells the
  truth.
- **L3.12** Every offer is a real TDI service. An unused contracted deliverable
  outranks a new purchase.
- **L3.13** No prices in any client-facing component.
- **L3.14** Every blank is labelled, attributed, and actionable.
- **L3.15** Messages to staff come from the leader, not from us.

---

## L4. Data integrity laws

- **L4.1** Empty and zero are different and are never stored interchangeably.
- **L4.2** Activity windows are rolling, never calendar-to-date.
- **L4.3** One definition per concept across the whole dashboard.
- **L4.4** A field may not be read unless something writes it.
- **L4.5** Every displayed number names its instrument and its window.
- **L4.6** Scale direction is declared; two scales never share a trend line.
- **L4.7** Cross-database facts join on lowercased email, never with an embed.
- **L4.8** A sample too small to mean anything is reported as a sample.
- **L4.9** Every write takes its error; no success message precedes a confirmed
  write.
- **L4.10** Dates are built from their parts, never parsed from a string.

---

## L5. Voice

- **L5.1** No emojis, no em dashes, no double hyphens. The exception is Vibe Check
  options, where the emoji is the answer.
- **L5.2** The team, never a person's name. A signed email is the exception.
- **L5.3** Name things as the reader recognises them.
- **L5.4** Never display total course time, difficulty labels, or PD hours.
- **L5.5** Quotes are attributed by school, never by person.
- **L5.6** Every reader-facing string goes through `tUI()`.

---

## L6. Lifecycle states

| State | Trigger | Must be true | Must not appear |
|---|---|---|---|
| Onboarding | Signed, before kickoff | Roster requested, buildings created, access dates stated | Any metric, bar, or zero |
| Month one | Seats delivered | Welcome state, what is coming. Placeholder tabs correct here only | Goal bars, reports, trend claims |
| In year | Baseline taken | Live year tab results first, goals with baselines, engagement, reports, nudge | Future-tense copy, placeholder tabs |
| Returning | A prior year record exists | One tab per year, badged, mirrored | Anything implying we have not started |
| Renewal window | 60 days from contract end | Proposed year tab, unused deliverables surfaced | Silence about what happens next |

- **L6.1** State is derived from data, never set by hand.

---

## L7. Verification

- **L7.1** Verify the outcome a person experiences, not the presence of code.
  Confirm commands by exit code.
- **L7.2** Every dashboard change ends in a browser with figures written down.
- **L7.3** Label every claim measured, derived, or unverified.
- **L7.4** Sweep the whole surface, not only the reported defect.
- **L7.5** Deploy names the project explicitly.
- **L7.6** A rule worth keeping becomes a gate. `npm run check:quarantine` is
  the first one built from this document: it fails when changed code reads a
  quarantined field without a `quarantine-ok` comment. It caught two real errors
  within an hour of existing, one of them mine.

---

## L8. Component contracts: what is wired to what

The **portal** holds the partnership. The **Hub** holds behaviour. Separate
Supabase projects, no foreign keys between them. The dashboard route holds a
client for each and is the only place they meet.

Before a component ships, its row here is complete and every cell verified by
reading code: something writes the column, the route selects it, state holds it,
the component renders it. Break any link and the failure is silent.

| Component | DB | Source | Route | State | Breaks when |
|---|---|---|---|---|---|
| Identity header | Portal | `partnerships`, `organizations` | `dashboard/[id]` | `partnership`, `contract` | Dates parsed from strings; both years identical |
| Goals card | Portal | `partnership_kpis` | `dashboard/[id]` | `partnershipKpis` | `current_value` stored 0 instead of empty |
| Year record | Portal | `partnership_semester_data` | `semester-data` | `semesterList` | `is_proposal`/`badge`/`sort_order` not selected; status enum drift |
| Engagement | **Hub** | `hub_activity_log`, `hub_profiles` | `dashboard/[id]` | `engagement` | Embed instead of two queries; window or row cap unstated |
| Team and roster | Both | `staff_members` + `hub_profiles`, `hub_memberships` | `dashboard/[id]` | `staffStats` | Roster and seats drift either way |
| Schools | Portal | `buildings` | `dashboard/[id]` | `apiBuildings` | Column is `estimated_staff_count`; null renders as 0 |
| Reports readiness | Derived | engagement, rolling 30d | n/a | `reportActiveStaff` | Any calendar-to-date source |
| Report contents | Both | `dataContext` | `hub/insights`, `popular-content` | `dataContext` | AI failure falls back silently |
| Timeline | Portal | `timeline_events` + record | `dashboard/[id]` | `timelineEvents` | Status not completed/in_progress/upcoming |
| Quotes | Portal | `teacher_quotes` + record | `dashboard/[id]` | `teacherQuotes` | Attribution carries a person |
| Action items | Portal | `action_items` | `dashboard/[id]` | `actionItems` | Wrong category strands a completed task |
| Vibe check | **Hub** | `hub_assessments` | `hub-stats` | `hubStats` | Scale direction undeclared; sample too small |

### Quarantined fields

These return a number and must never reach a client-facing figure.

| Field | What it actually is | Use instead |
|---|---|---|
| `hub_profiles.partnership_slug` | Not the link between a person and a partnership. Filled in inconsistently, nothing keeps it current | The roster table, matched on lowercased email |
| `hubStats.logins_this_month` | Sign ins since the first of the calendar month | `engagement.activeThisMonth` |
| `hubStats.hub_login_pct` | The above over provisioned seats | Same arithmetic as Team Activation |
| `hubStats.quick_wins_completed` | An action the Hub never writes. Always 0 | `engagement.distinctContent` |
| `staff_members.hub_login_date` | Written daily by a cron, so it lags up to 24 hours. Two teachers signed in during their own onboarding call and showed as never having logged in | Hub activity read live, this only as a fallback |
| `hub_user_goals` | Dead table | `hub_profiles.onboarding_data` |

- **L8.1** Cross-database facts join on lowercased email, in code, never as an
  embed.
- **L8.2** A quarantined field is deleted or commented at its definition, never
  just avoided.
- **L8.3** When a figure is fixed, every other consumer of the same source is
  fixed in the same change. Grep the field name across the repo.
- **L8.4** Capped lists expose their true total separately.

---

## L9. Display states

A component is not specified until all five states are.

| State | Means | Renders as | Never |
|---|---|---|---|
| Loading | Request in flight | Skeleton holding the final layout | A zero |
| Never measured | No instrument has run | Dashed bar, target stated, "Soon" | A filled bar at 0% |
| Awaiting the client | Only they hold the fact | Labelled blank naming who owes it | A zero, a dash, or silence |
| Measured | A real reading exists | Figure, instrument, window, what TDI is doing | A number with no provenance |
| Error | The source failed | Plain statement, and what still works | A silent fallback that looks real |

- **L9.1** Zero is only rendered when zero was measured.
- **L9.2** A silent fallback is an error state wearing the populated state's
  clothes.
- **L9.3** A disabled control explains itself truthfully.
- **L9.4** Badges carry one meaning each and a fixed colour.

---

## Appendix A. The Addison audit

Everything found on one live dashboard, 30 September 2026.

Fixed: reports readiness on a calendar counter (L4.2); the Hub Intelligence panel
showing 0% beside 20 active (L4.2, L4.3); "0 tools explored" reading an action the
Hub never writes (L4.4); `how_tdi_delivers` and `data_source` written on all 27
KPI rows and rendered nowhere (L3.2); nine buildings at "0 staff" (L3.10); the
"Next Year" placeholder shown to a second-year client (L2.5); a goal card
promising goals at onboarding while three rendered on Overview (L2.5); two
timelines for one partnership (L2.3); a header reading "2026-2026" (L3.1); the
Schools panel unreachable for months (L2.6); buildings never once saving, wrong
column and swallowed error (L4.9); 130 paraprofessionals labelled classroom
teachers; timeline status enum drift printing "Nothing here" (L4.4); dates a day
early (L4.10); a "Need Attention" stat hardcoded to an em dash (L5.1); all nine
report templates quoting the calendar figure and the phantom field, so a board
report read "0% are actively engaged, 0 tools explored" for a district with 51
active staff (L8.2, L8.3).

Open: the goal prompt never fires for bulk-provisioned accounts, so 150 of 155
were never asked; the Reports tab advertises a panel id that does not exist
(L2.7); staff-to-building mapping unknown, awaiting the client.

## Appendix B. Fleet scorecard

Measured from the database, 30 September 2026. Every dashboard except Addison
still shows the generic plan tab and the Next Year placeholder.

| Partnership | Type | Goals | Years | Roster | Known failures | Priority |
|---|---|---|---|---|---|---|
| st-mary-catholic-school | School | 4 | 0 | 12 | **Three goals render 0%** | 1 |
| allenwood-elementary | School | 4 | 0 | 0 | **Roster empty.** Every denominator zero | 2 |
| glen-ellyn-d41 | District | 4 | **2** | 9 | **Resolved 1 Oct.** Churchill and Hadley created and staffed, roster verified at 9 against 9 working accounts, roles corrected, zero cleared, both year tabs built. One para still has no name on file | Done |
| st-peter-chanel | School | 4 | 0 | 30 | One goal renders 0% | 4 |
| saunemin-ccsd-438 | School | 4 | 0 | 25 | Two seat holders on no roster | 5 |
| tidioute-community-charter | School | 0 | 0 | 3 | No goals at all | 6 |
| oak-grove-sd-68 | School | 0 | 0 | 2 | No goals. Paused, confirm before touching | 7 |
| roosevelt-school | School | 4 | 0 | 17 | Fleet-wide placeholder tabs only | 8 |
| addison-sd4 | District | 3 | 3 | 149 | Reference implementation | Ref |

Glen Ellyn was resolved on 1 October and is the worked example of the loop. Four
of the remaining eight have a goal rendering a literal zero to a client, or no
goals at all.
The rendering code deliberately distinguishes unmeasured from zero; these rows
were stored as zero by hand. It is a data edit, not a deploy.

## Appendix C. Decisions needed

1. Do the four remaining zero-value goals become empty, or do we take real
   baselines first? Glen Ellyn's was cleared by checking the instrument: its
   target reads Quick Win responses and the team has submitted none, so nobody
   had been measured and the stored zero was never a reading.
2. Does every partnership get year tabs, or only those with a stored prior year?
3. Is the proposed-year tab standard in every renewal window, or only where we
   intend to pitch?
4. Which L7.6 candidates become gates this week?
