# Browser pass

## What this change touches

"What your team is working on" on the partner leadership dashboard, and the
per school list inside each building row. Both stop printing headcounts. A row
now carries a direction and a share of the staff who signed in this month, and
the two activity tiles above the list carry a share of the roster instead of a
count of it.

## What I did

Opened it locally after repairing the build. `npm i` failed earlier because npm
could not write to `/Users/raehughart/.npm`; pointing it at its own cache
directory avoided that entirely and installed the missing
`@next/swc-darwin-arm64` binary into the worktree. `next dev` then started.

- Opened: http://localhost:3217/partners/saunemin-ccsd-438-dashboard
- Saw: an onboarding modal headed "Welcome to Your Dashboard" covering the page,
  which is why two earlier screenshots looked blank.
- Pressed: the modal's close control.
- Pressed: the "2026-2027" tab, badged LIVE.
- Saw: "What your team is working on", with the three tiles reading "26% Active
  this week", "41% Active this month" and "Oct 2 Most recent sign in". Those
  first two read 6 and 10 before this change.
- Saw: eight content rows. The first is "Two Students, One Fight: What a Teacher
  Does Right Now" at "18%" with an upward arrow. Six more read "9%" with an
  upward arrow. "Boundaries Without Backlash" reads "9%" with a flat dash rather
  than an arrow, which is the steady case rendering as intended.
- Saw: beneath the list, "Percentages are a share of the staff who signed in this
  month. An arrow compares the last 30 days with the 30 days before."
- Cross-checked: these are the same figures `npm run check:popularity` printed
  for saunemin-ccsd-438, "tiles: 26% active this week, 41% active this month
  (roster 27)" and a top row of 18%. The screen and the check agree.

## Evidence short of the browser

Not observations off a screen, and not a substitute for one. Recorded so the
production check knows what it should find.

`npx tsx scripts/integrity/verify-popularity-display.mts` replays the real
hub_activity_log rows for every live partnership through the same exported rules
the dashboard renders with, and prints the rows a school will read. It reported
55 rows across 8 partnerships, "Directions: 43 up, 11 down, 1 steady, 0 no
claim", and asserted that no share exceeds 100%, that no real activity reads as
zero, and that no direction is claimed on a truncated read.

It is also what caught the small school problem. Tidioute has a roster of two,
and before the floor was added its dashboard printed "100%" against
"De-Escalation Strategies for Unstructured Environments", which in a school of
two names the person who opened it.

`tsc` exited 0. Confirmed that figure means something by appending a deliberate
type error to lib/partners/popularity.ts: tsc exited 2 and named
`lib/partners/popularity.ts(84,7)`, then exited 0 again once restored.

## What I did not press

Nothing was pressed anywhere. The district panel has no controls. The building
rows do expand, and that control is exactly what the production check above has
to exercise, because the per school list is one of the two lists this change
rewrites.

## What I could not verify

A downward arrow. Every row on this school reads up or steady, so the grey I
chose for "down" has not been seen on a real dashboard. `check:popularity`
reports 11 downward rows across the fleet, so another school would show it.

Narrow screens. The column is fixed at 4rem and I viewed this at 1440 wide only.

The per school lists inside the building rows. Saunemin is a single school
partnership, so it has no building panel to open.

## Production observations, 2 October 2026

Recorded after #712, #714 and #715 merged and the production build went live at
17:13 UTC.

- Opened: https://www.teachersdeserveit.com/for-schools
- Saw: the dashboard illustration reading "82% of staff responded in November."
  It read "42 of 51 staff responded in November." this morning, drawn into the
  SVG on the page a prospect sees first.

- Opened: https://www.teachersdeserveit.com/Example-Dashboard
- Saw: the Team Activation card reading "87%" beside "of your educators active
  on Hub", and under it "13% of your team haven't logged in yet. A quick
  reminder can help."
- Those two read "223" beside "of 255 educators active on Hub" and "32 educators
  haven't logged in yet" before this work. Both the headline figure and the one
  derived by subtraction are gone, which was the point: a count reached by
  subtraction names people just as precisely as a count printed directly.

- Opened: https://www.teachersdeserveit.com/partners/saunemin-ccsd-438-dashboard
- Saw: "Access Denied". The browser holds no partner session for the live
  domain, and I did not sign in as Rae to get one.

## What is still unverified in production

The authenticated partner dashboard, which is the largest surface in this work.
Everything on it was verified against a local server running the same commit,
recorded in popularity-not-headcount.md, including the engagement panel reading
"26% Active this week" and "41% Active this month" with its arrows and legend.
The screens behind the partner login have not been read on the live domain.

The three client emails. They send on cron and no cron was triggered.
