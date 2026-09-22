# Browser pass

## What this change touches

The Hub home page, `app/hub/page.tsx`. A new course band called "Next for you"
appears under Continue where you left off, above New this month. It renders
recommendations the page has always loaded and has never displayed.

## What I did

- Opened: http://localhost:3000/hub
- Deferred: localhost bounces to `/hub/login?returnUrl=%2Fhub` and cannot be
  signed in to. Rae confirmed on 21 Sep 2026 that local sign-in "never works".
  Her live session does not carry to localhost because the Supabase session
  cookie is scoped to the live domain, and I will not handle her password.
- Verify after deploy: https://www.teachersdeserveit.com/hub

## The pass, run on production after deploy (21 Sep 2026)

Deploy `teachersdeserveit-fbt4xfs58` reached Ready before this was run.

- Opened: https://www.teachersdeserveit.com/hub signed in as Rae
- Saw: the band "Next for you" above New this month, noted "Chosen from what you
  have told us so far", with exactly the three predicted cards in the predicted
  order. "Mentoring Made Simple – How to Guide Educators" chipped "Toward your
  goal to grow your team"; "Executive Functioning Made Simple: Tools for K-5
  Classrooms" chipped "Recommended for your role"; "How to Grow Your Personal
  Brand as a Teacher (Hint: It Landed Me a TED Talk)" chipped "Toward your goal
  to grow your team". No wellness card, which is correct at a stress score of 1.
  The prediction was written above before the page was opened.
- Pressed: the "Mentoring Made Simple – How to Guide Educators" card
- Saw: navigation to
  https://www.teachersdeserveit.com/hub/courses/mentoring-made-simple-how-to-guide-educators
  and the course page rendered with "17 lessons", "16 check-ins" and a
  "Start Learning" button.
- Pressed: nothing on the Vibe Check overlay deliberately, but a first click
  aimed at the card landed on its backdrop and dismissed it. No answer was
  submitted, and `hub_assessments` gained no row.

## A defect this pass found

The category label on the new cards renders the raw database slug. The band
shows "CLASSROOM-MANAGEMENT" with a hyphen, directly above New this month
showing "CLASSROOM MANAGEMENT" with a space, in the same screenshot. Every
other band on the page renders prose because Quick Wins store prose, while
`hub_courses.category` stores slugs and this band prints it unchanged.

Cosmetic, live, and mine. Fixed on `fix/hub-band-category-label`.

This is the argument for the gate. Typecheck passed, three other checks passed,
the function returned exactly the right courses, and the page still shipped
looking wrong in a way only opening it would show.

## The prediction this pass exists to test

Running `getRecommendations()` against Rae's own account
(`66b1ed58-6a3e-49fc-86b2-7bd5c5d199cf`, role `para`, goals
`figure_out_whats_next, reduce_stress, team_growth, find_joy`, latest
`stress_score` 1) returns the heading "Next for you" and exactly three cards:

1. Mentoring Made Simple, chip "Toward your goal to grow your team"
2. Executive Functioning Made Simple, chip "Recommended for your role"
3. How to Grow Your Personal Brand as a Teacher, chip "Toward your goal to grow your team"

Her stress score is 1, so the Vibe Check rule must stay silent. If the page
shows anything else, the render is wrong.

Writing the prediction down before looking is the point. A pass that decides
what it expected after seeing the screen proves nothing.

## Before state, read off production on 21 Sep 2026

Rae's own screenshot of https://www.teachersdeserveit.com/hub shows the bands
"New this month" and "Written for paras", the latter noted "Chosen for your
role rather than ranked by clicks". There is no recommendations band anywhere
on the page, which is the defect this change fixes: the dashboard has been
calling `getRecommendations()` on every load and writing the result into state
that no JSX reads.

## What I could not verify

Still unverified in any browser: the Spanish rendering of the new band, and the
"From the Hub library" heading a reader with no role, goals or Vibe Check data
would see. Both were confirmed at the function level only, against the account
`cbc68a9f-bb02-4825-a7ec-bb4fd155ebff`, which returned `personalized: false`
and three cards all reasoned "Chosen from the Hub library".

Reaching either state in a browser needs an account that is not Rae's, so it
waits for someone who can sign in as one.

## Follow-up pass after the label fix deployed (22 Sep 2026)

Deploy `teachersdeserveit-nwcj5gnvt`, Ready.

- Opened: https://www.teachersdeserveit.com/hub signed in as Rae
- Saw: the middle card's category now reads "CLASSROOM MANAGEMENT" with a space,
  matching "CLASSROOM MANAGEMENT" in New this month directly beneath it. The
  hyphenated slug is gone.
- Saw: the chips still read "Toward your goal to grow your team", which is the
  separate wording defect. The tile Rae actually pressed says "Grow as a
  leader". Fixed on `fix/hub-goal-chip-labels`, not yet deployed at the time of
  this observation.

## What I did not press

The Vibe Check overlay, again. No answer submitted.
