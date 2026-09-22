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

## What I did not press

Nothing on production yet. The deploy has not happened.

## What I could not verify

Everything on the list above, until this ships. Also unverified in any browser:
the Spanish rendering of the new band, and the "From the Hub library" heading
that a reader with no role, goals or Vibe Check data would see. Both were
confirmed at the function level only.
