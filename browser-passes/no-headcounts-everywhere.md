# Browser pass

## What this change touches

Every remaining client-facing surface: the partner dashboard screen itself, the
Vibe Check panel, the Hub champion dashboard, the v1 partner dashboard's stat
cards, the four Roosevelt dashboard components, the public Example Dashboard,
and the dashboard illustration on /for-schools.

## What I did

- Opened: http://localhost:3217/partners/saunemin-ccsd-438-dashboard, after
  repairing the local build by pointing npm at its own cache directory and
  installing the missing @next/swc-darwin-arm64 binary.
- Pressed: the close control on the "Welcome to Your Dashboard" modal.
- Pressed: the "2026-2027" tab, badged LIVE.
- Saw: "What your team is working on" reading "26% Active this week" and "41%
  Active this month", against 6 and 10 before the rule existed.
- Saw: its eight content rows, the first "Two Students, One Fight: What a
  Teacher Does Right Now" at "18%" with an upward arrow, six at "9%" with an
  upward arrow, and "Boundaries Without Backlash" at "9%" with a flat dash.
- Saw: the figures this change has NOT fixed, which is what prompted the rest
  of it. "Your next 14" with "13 of 27" and "7 in this week, 6 started, 14 still
  to reach", a "Nudge all 14" button, and the Vibe Check header reading
  "10 people, 37% of your team" with "5 people" under one area. Those are the
  renders this change converts.

## What I did not press

I did not re-open the dashboard after making these edits. The observations above
are the before state, recorded from the live page, which is what identified the
work. The after state is unverified in a browser.

I did not press any report generator, and I did not press "Nudge all", which
opens a mail client addressed to real staff.

## What I could not verify

The after state of everything in this change. That is the honest gap.

- Deferred: the edits landed after the browser session, and re-driving every one
  of eight surfaces was not done.
- Verify after deploy: on the partner dashboard, the Team Activation card should
  read a percentage rather than "18 of 24", the year record's 34px figure should
  read a percentage "of your team", the Vibe Check header should read "37% of
  your team" with no headcount, and the nudge button should read "Nudge the
  rest". On /hub/champion the three activity cards should read percentages while
  "Total team members" stays a count. On /Example-Dashboard and /for-schools the
  illustrations should carry percentages.

## A limit worth recording

Roughly half the headcounts a school reads are not code. The "2026-2027 in
numbers" tiles and the "What stood out" bullets are stored text in
partnership_semester_data, written per school by us. Saunemin's reads "12 people
are already active" and "9 of your staff are completing vibe checks" today, and
no code change touches either. Converting the code without editing those records
leaves one dashboard saying both things.

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
