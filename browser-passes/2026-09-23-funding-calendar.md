# Browser pass

## What this change touches

A third new screen, `/tdi-admin/funding/calendar`, and the route behind it.
Nothing existing changes. Like the schools screens, it is served only when
`funding_config.new_pages` is on, and that flag is off.

## What I did

- Opened: http://localhost:3000/tdi-admin/funding/calendar
- Deferred: the admin portal authenticates against a Supabase session cookie
  scoped to the live domain, so a local server answers with a login screen. The
  flag is also off, so the route returns 404 even after deploy.
- Verify after deploy: https://www.teachersdeserveit.com/tdi-admin/funding/calendar

## The prediction

Written before looking, from the engine run against live data.

September 2026 shows **18 entries**, October shows **1**. Across all months there
are 24, of which 15 are confirmed and 9 predicted.

The confirmed ones sit where the obligations are. Five decisions bunched on
15 September, all now a week late. Cox Charities on the 18th. The named teacher
question on the 22nd. Illinois Prairie and Ourso both closing on the 30th, and
Cox Charities closing on 1 October, which is the only October entry.

The predicted ones are italic and grey. Illinois Prairie and Ourso both show an
approval due on 24 September, two days after each passed QA. Cox Charities shows
a packet due to the school on 17 September and the IAA Foundation on
10 September, both already past, which is the honest picture: those are finished
applications nobody has sent.

The line above the grid should read that **5 of 21 live grant paths have a
confirmed deadline**, and say that the rest cannot appear until somebody
confirms a window. If that line is missing, the screen is quietly pretending a
sparse month means a calm month.

## The pass, run on production (23 September 2026)

Deploy from overnight, Ready. The flag `funding_config.new_pages` is on.

- Opened: https://www.teachersdeserveit.com/tdi-admin/funding/calendar signed in as Rae
- Saw: September 2026 with the grid rendering as predicted. Five blue entries
  stacked on the 15th, reading "Caseys Cash for Classrooms Grant:", "Corn Belt
  Energy - Education Gran...", "MGM National Harbor / Community F...", "Track NEA
  application decision" and "Washington Commanders Charitable ...". Cox Charities
  on the 18th. "NEA and IEA SCORE: get one named ..." on the 22nd. "Send the IEA
  Foundation SCORE Gra..." on the 23rd, which is highlighted and labelled "23
  today". Two red entries on the 30th: "E.J. and Marjory B. Ourso... closes" and
  "Illinois Prairie Communit... closes".
- Saw: the grey italic predictions where they should be. "IAA Foundation - Illi...
  packet to school" on the 10th, "Cox Charities Fund Ed... packet to school" on the
  17th, and on the 24th both "E.J. and Marjory B. O... approval due" and "Illinois
  Prairie Comm... approval due".
- Saw: the coverage line above the grid reads "5 of 21 live grant paths have a
  confirmed deadline. The rest have no date yet, so they cannot appear here until
  somebody confirms a window." That line is the point of the screen and it is
  there.
- Pressed: the grey "Illinois Prairie Comm... approval due" entry on the 24th.
- Saw: a panel headed "PREDICTED, NOT CONFIRMED", subtitled "Saunemin CCSD #438 ·
  2026-09-24", with a box headed "HOW THIS DATE WAS WORKED OUT" reading "Passed QA
  on 2026-09-22 and waiting on a person. 2 days is the allowance before it reads as
  stuck." Below it: "Nothing is due on this date. A predicted entry never chases
  anyone and disappears the moment a real date exists." and a link reading "Open
  Saunemin CCSD #438".

## The routing risk did not materialise

Before deploy, this URL fell through to the dynamic `[pursuitId]` route and tried
to load a school called "calendar", rendering an error and later hanging. Once
deployed the static segment wins, as expected. Worth keeping in mind that a build
failure on this page would resurface as a broken pursuit page rather than a 404.

## What I did not press

Nothing that writes. There are no actions on this screen yet: the popups explain
and link to the school, and the controls that complete an action are the next
piece of work.

## What I will press

A predicted entry, which should open a panel headed "Predicted, not confirmed"
containing a "How this date was worked out" box. For the Illinois Prairie
approval that box should name the date it passed QA and the two day allowance.

Nothing on this screen writes anything. There are no actions in it yet: the
popups explain and link to the school, and the controls that complete an action
come next.

## Checked without the browser

- `npm run typecheck` exits 0.
- The engine was run directly against the live database twice, before and after
  routing it through `isLive` and `isSchoolOwned`. Identical both times: 24
  entries, 15 confirmed, 9 predicted, 18 in September and 1 in October.
- **Zero predicted entries lack a derivation.** That was the rule this file was
  written to hold, and it is checked rather than assumed.
- `check:definitions` caught two places deciding an owned question and both were
  fixed rather than allowlisted. Staging the files before running the gates is
  what surfaced it locally this time instead of in CI.

## What I could not verify

How a month with almost nothing in it feels. October has one entry, because
most grants have no confirmed date. The coverage line is meant to carry that,
but nobody has looked at an empty grid with one box in it and judged whether the
explanation lands.

Also unverified: whether a predicted date in the past reads as useful or as
noise. Two of them are already overdue, which is true and worth knowing, but
"predicted" sitting on a day that has already gone is a wording nobody has
tested on a real reader.
