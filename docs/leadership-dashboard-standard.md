# Leadership Dashboard Standard

Second draft, 1 October 2026. Canonical copy. The readable version is published
at https://claude.ai/code/artifact/56c3c43c-77f2-410e-80de-90d58221b245 and must
be republished from this file's content when this changes.

What every partner dashboard must contain, how it must be laid out, which numbers
it is allowed to show, and what must be answered before one can be built.

Written from a full audit of Addison SD4, then revised after bringing all nine
live dashboards to standard on 1 October. Every rule cites the failure that
produced it. **Report findings by rule ID**, for example "glen-ellyn fails L4.1".

L10 is how a new dashboard gets built. Read it before starting one, because the
order of its steps is the order the failures happened in when it was skipped.

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
- **L3.4a** **A target must exceed the baseline.** Saunemin's "Hub PD applied in
  the classroom" carried a 50% target against 100% achieved last year, so the goal
  asked for half of what they had already delivered and would have rendered as
  achieved. Check every target against the prior year before it ships.
- **L3.4b** **Last year's figure is never this year's current value.** Saunemin hit
  100% with 12 paras; this year the population is 27 including teachers new to us.
  The bar stays unmeasured and the card explains why holding it is harder.
- **L3.4c** **For a tiny staff, a goal target counts people rather than percent.**
  With two para-educators a percentage is noise, because one person is 50%.
  Tidioute's targets read "2 of 2". This covers goal targets and nothing else. A
  target is what the school agreed to, read back to them. Behaviour is not, and
  L4.13 governs it: in the same school, content a person opened shows a
  direction and no number at all, because "1 of 2" there says which of the two.
  Rae resolved the collision on 2 October 2026.
- **L3.4d** **A goal may be suggested before it is agreed.** Where a school has had
  no onboarding meeting, propose goals from what their own staff are already doing,
  store them as `status = 'suggested'`, and badge the card. The badge is derived, so
  marking them active clears it with no copy to rewrite.
- **L3.5** A year record opens with a sentence, not a number.
- **L3.6** Years are mirrored in shape so they read against each other.
- **L3.6a** **Year labels follow the contract, not the calendar.** Roosevelt runs
  11 March to 11 March, so its first phase is labelled "Spring 2026" rather than
  forced into a school year that would be wrong.
- **L3.6b** **A reconstructed year says it is reconstructed.** Where last year ran
  on the previous platform, the record is built from files and correspondence and
  the hero says so. Prior-year data lives in three places and they disagree:
  `partnership_year_snapshots` (Addison, St Peter Chanel, Tidioute, WEGO),
  `timeline_events` (Saunemin), and email only (Allenwood). Check all three before
  concluding nothing was saved.
- **L3.7** A proposed year is visibly a proposal.
- **L3.8** Engagement ranks content by distinct people, not events, and says
  nobody assigned it. It ranks by that count and never prints it. See L4.13.
- **L3.9** The roster is the denominator and reconciles to the seat list both ways.
- **L3.9a** **Deduplicate people before counting them.** One person with two
  addresses inflates the denominator and halves the percentage. Tidioute carried
  "Jim Guerra" and "James Guerra", and only one had a Hub account. St Peter Chanel
  carried five duplicates in a second email format, already deactivated.
- **L3.10** A building with no staff mapping says so and says what would fix it.
  A building with a mapping shows its own figures, and opens into its own people
  and its own content. Never an indicator fed a hardcoded null: every building on
  every dashboard read "Awaiting Data" for months because of exactly that.
- **L3.10a** Content is reported as a share, never a headcount, in the district
  list and the school panel alike. In a building of one, "1 person" names them.
  Both lists render `PopularityIndicator`, and both divide by the people who
  actually signed in during the window rather than by the roster, so a share
  cannot exceed 100% when half a roster has been dormant since last term. One
  component, because the two lists disagreed for two days in October 2026: the
  district list printed "8 people" while the panel below it printed "33%".
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
- **L4.11** No comparative statistic is ever hand written. A figure describing
  other schools, a national average, an industry benchmark or a typical partner
  is computed from live data or it does not appear. Until 1 October 2026 the
  engagement report asserted "the typical TDI partner benchmark of 60% in the
  first quarter", plus two more invented adoption figures, hardcoded into a
  document a principal hands to a school board. The measured median is 56%, so
  the invented number was also wrong. The same rule governs a model: every
  report prompt forbids inventing a statistic, and permits only repeating
  figures already in the data or the template.
- **L4.12** A peer comparison carries its own distortion. Rosters in our
  community run from two people to a hundred and fifty, so a median of per
  school percentages weighs a two person school at full activation the same as
  a large district at a third. Rae's decision, 1 October 2026, was to keep the
  comparison and say so on the page rather than hide it or imply precision, and
  to point the reader at the team. A comparison that cannot carry that sentence
  does not ship.

- **L4.13** **A client-facing surface shows a share of people, never a count of
  them.** Rae, 2 October 2026: a leadership dashboard does not need to say how
  many people, it needs to say that something is catching on. This governs the
  screen, the printable report, the CSV export, every generated report a leader
  forwards, and every email we send a school. It does not govern `/tdi-admin`,
  where raw counts are correct.

  Three parts, and the third is the one that gets forgotten.

  Enrolment is not activity and stays. "Learning Hub access for 24 educators" is
  what a school bought, and a board reading a funding document needs it. "18
  educators have logged in" is behaviour and becomes a share. A denominator
  inside an activity sentence counts as behaviour, because "75% of 24 educators
  are engaging" hands back the 18 by multiplication.

  A derived count is still a count. "6 educators have not yet logged in" was
  reached by subtraction and names them just as precisely in a school of eight.
  Use `remainderPct`.

  Below `MIN_SHARE_POPULATION`, which is 3 and the same floor and the same
  reason as `VIBE_MIN_PEOPLE`, no number is printed at all. Converting counts to
  percentages does not protect a small school on its own: the arithmetic is
  reversible whenever the denominator is small enough to hold in your head, and
  most of our community is that small. Tidioute has a roster of two, and its
  dashboard printed "100%" against a tool one person opened.

  `sharePct`, `contentSharePct` and `remainderPct` in `lib/partners/popularity.ts`
  are the only implementations. `npm run check:headcounts` is the gate.

- **L4.14** **No trend is claimed on a truncated read.** Activity rows come back
  newest first under a row cap, so a truncated read loses the older half of any
  comparison and every item on the board points upward. `engagementTrend` returns
  no direction when the read hit its cap, and the arrow is absent rather than
  flattering. The same caution applies to any figure computed from two windows
  where only one of them is guaranteed complete.

---

## L5. Voice

- **L5.1** No emojis, no em dashes, no double hyphens. The exception is Vibe Check
  options, where the emoji is the answer.
- **L5.2** The team, never a person's name. A signed email is the exception.
- **L5.3** Name things as the reader recognises them.
- **L5.4** Never display total course time, difficulty labels, or PD hours.
- **L5.5** Quotes are attributed by school, never by person.
- **L5.6** Every reader-facing string goes through `tUI()`.
- **L5.7** Our schools are "in our community". Never "the schools we work with",
  never a count of them, never a name. Rae, 1 October 2026, on both the wording
  and the disclosure: we do not tell one school building how many others we work
  with. The count, the ranking and the strongest performer are computed because
  the median needs them, and none of the three is returned to the browser.

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
- **L7.6** A rule worth keeping becomes a gate. `npm run check:quarantine` was
  the first one built from this document: it fails when changed code reads a
  quarantined field without a `quarantine-ok` comment. It caught two real errors
  within an hour of existing, one of them mine.

  `npm run check:headcounts` enforces L4.13. It judges the lines a change wrote
  rather than the files it touched, because the partner dashboard is nine
  thousand lines and a file-level ratchet drops its whole backlog on whoever
  edits it. Around twenty-two renders predate the rule and `-- --all` lists them.
  Escape with `headcount-ok` and a reason.

  `npm run check:popularity` replays real activity rows for every live
  partnership through the exported rules and asserts that no share exceeds 100%,
  that no real activity reads as zero, and that no direction is claimed on a
  truncated read. It is what found Tidioute.

  Both were written with a deliberate violation planted first, to confirm they
  fail. `check:headcounts` passed that planted violation on the first attempt,
  because a case-sensitive pattern missed `staffLoggedIn`, and it would have
  shipped guarding nothing.

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

Enforced by `npm run check:quarantine`, which fails when changed code reads one
without a `quarantine-ok` comment.

- **L8.1** Cross-database facts join on lowercased email, in code, never as an
  embed.
- **L8.1a** **Match on the roster, never on the email domain.** A client's domain
  is often district wide. `lodi.k12.nj.us` holds 29 Hub profiles and Roosevelt is
  one school with 17 staff; `pgcps.org` holds 806 and Allenwood is one school with
  14. Reading a domain gives you a different school's numbers.
- **L8.1b** **Every roster read filters `is_active`.** Omitted, departed staff are
  counted as staff. Saunemin's setup card read 29 while its own year tab read 27,
  and Tidioute read 3 for a two person school. It also deflates every percentage
  forever, because activation is active people over roster size. Two routes had
  this missing and 21 files still do.
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
- **L9.4** Badges carry one meaning each and a fixed colour. `Complete` grey,
  `Live` teal, `Proposed` gold, `Suggested` gold.
- **L9.5** **A column or tile with nothing in it does not render.** A finished year
  has nothing in progress, so printing "Nothing here" twice under St Peter
  Chanel's completed record read as a broken feature rather than a year that
  ended.
- **L9.6** **A count that clamps at zero lies.** `max(0, contracted - assigned)`
  told Saunemin it had "0 of 23 remaining" when 27 people had access. Show the
  real state in all three directions: under, exactly at, and over. Over is good
  news and reads as such: "all 23 assigned, plus 4 more at no extra cost".
- **L9.7** **Internal naming never reaches the client.** Allenwood's dashboard
  called them "Allenwood Elementary (2026-27)", which is our contract-year
  bookkeeping shown to their principal.

---

## L10. Creating a new dashboard

The spec above judges a dashboard. This builds one. The order matters, because
each step is the denominator of the next, and the whole fleet audit on 1 October
went wrong wherever this order was skipped.

Nine dashboards were brought to standard this way. Expect three hours for the
first of a new shape and under an hour once the shape is known.

### 1. Establish who the people are, before anything else

Pull the roster. Reconcile it against live Hub seats in **both** directions:
seat holders missing from the roster, and roster members with no seat. Match on
lowercased email and never on the email domain (L8.1a). Deduplicate humans
(L3.9a). Confirm `is_active` is honest.

Nothing downstream is trustworthy until this number is right, because it is the
denominator of every percentage on the page.

### 2. Establish what they bought

Line items with counts, dates, and what has actually been delivered. Check
`contract_deliverables` for delivered-and-invoiced rows, which is how we found
that Allenwood had been invoiced for 13 memberships that were never switched on.

### 3. Find last year

Check all three sources (L3.6b). A partnership in ACCELERATE or with a year
suffix in its name almost certainly has a prior year even when no record exists.
Ask Rae before concluding there is nothing; on Allenwood the answer was in email
and on Saunemin it was in `timeline_events`.

### 4. Set or propose the goals

Three to four, each measurable with the instruments this contract actually has
(L3.4). Where there has been no onboarding meeting, propose from what their staff
are already doing and mark them suggested (L3.4d). Check every target against the
prior year (L3.4a).

Ask for baselines one at a time. A baseline can be a stated figure rather than a
measured one, labelled as stated, the way Saunemin's four were.

### 5. Build the year records

One per year, oldest first, badged. Results before context, context before
anything we sell (L2.4). The live year leads with its strongest true fact.

### 6. Say the unfavourable thing, with the fix beside it

Every dashboard has one. Addison's 34% activation, St Peter Chanel's drop from
100% to 10 of 30, Roosevelt's 4 of 17. In each case the page states it plainly
and names the cause, and where the cause is ours it says so. Roosevelt's reads
"That is ours to fix, not yours".

### 7. Walk every tab and sweep

Load the page. Press the controls. Check every tab for em dashes, double hyphens,
zeros, placeholders, empty columns and leaked internal naming. Verify outbound
recipient lists by decoding the link rather than reading the label, and never
press a control that emails real staff.

This step is not optional and it is where the real defects were found. Saunemin
looked finished twice before a sweep found departed staff in its denominators and
a seat count clamped to zero.

### 8. Record what you could not verify

Production if it has not deployed. Any branch verified by reading a condition
rather than loading it. Any figure stated rather than measured.

### The gate before it goes to a client

- Roster reconciles both ways, zero drift
- No zero on the page that is not a real measurement
- Every goal has an instrument that exists, and a target above its baseline
- Every unfavourable number carries its solution
- No placeholder tab, no internal naming, no em dash
- A browser pass recorded with a figure and a pressed control

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

All nine brought to standard on 1 October 2026, except Oak Grove which Rae
parked. Each has its year tabs, no placeholder tabs, and no zero that is not a
real measurement.

| Partnership | Years built | Roster | Goals | Note |
|---|---|---|---|---|
| addison-sd4 | 3 | 149 | 3 | Reference implementation. Schools tab waits on a roster with a school column |
| glen-ellyn-d41 | 2 | 9 | 4 | Churchill and Hadley staffed and clickable. One para still has no name on file |
| st-mary-catholic-school | 2 | 12 | 4 | Strongest activation in the fleet at 83%, and 9 of 12 doing vibe checks |
| allenwood-elementary | 3 | 0 | 4 | Roster never arrived, so the page derives the ask. 14 staff sit on free tier despite 13 paid memberships |
| st-peter-chanel | 3 | 30 | 4 | Year one from the snapshot table. Visit 30 November, prep received |
| tidioute-community-charter | 3 | 2 | 3 suggested | Goals proposed from 18 opens of one de-escalation resource, awaiting their onboarding meeting |
| saunemin-ccsd-438 | 3 | 27 | 4 | Only dashboard with real baselines on three goals: 44%, 15%, 10% |
| roosevelt-school | 3 | 17 | 4 | Quietest in the fleet at 4 of 17. Hub only, no date in the calendar, and the page says that is ours to fix |
| oak-grove-sd-68 | 0 | 2 | 0 | **Parked by Rae.** Partnership paused 7 September |

### Shared defects fixed, all of which were reaching clients

| Defect | Where it showed |
|---|---|
| Calendar-month window used as "recent" | Three separate places, including a board report that would have said "0% are actively engaged" |
| `how_tdi_delivers` and `data_source` rendered nowhere | All 27 KPI rows, on every dashboard |
| Four building health dots fed a hardcoded null | Every building on every dashboard read "Awaiting Data" |
| Empty timeline columns | "Nothing here" twice under a completed year |
| Departed staff counted in every denominator | Two unfiltered routes, 21 files still unfiltered |
| Seat count clamped at zero | A school with 27 of 23 told it had none left |
| Suggested goals could not reach the page | API filtered to `status = 'active'` |
| Placeholder tabs shown to year-two clients | "Next Year", and two goal cards promising onboarding |
| Internal naming leaked | "Allenwood Elementary (2026-27)" |

## Appendix C. Decisions needed

1. **14 Allenwood staff sit on the free tier**, including their principal, while
   the school was invoiced for 13 Learning Hub memberships marked delivered. They
   have paid for access they have never had. Switching them on is a billing and
   access decision.
2. **21 files read `staff_members` with no `is_active` filter.** Two were fixed
   because the dashboard reads them. The rest include `cron/update-kpis`, which
   computes and stores KPI values, and the principal and weekly digest emails.
3. **Melissa Mahaney at Tidioute** is on the free tier, same pattern as Allenwood
   but smaller.
4. **Oak Grove** stays parked until its paused status is resolved.
5. **Which remaining L7.6 candidates become gates.** `check:quarantine` is built.
   Candidates: tab and panel parity, no stored zero without a measurement date, no
   calendar-to-date window in a client-facing figure, no em dash in client-facing
   copy.
