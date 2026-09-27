# Browser pass

## What this change touches

The Overview tab of the client dashboard at `/partners/<slug>`. The four goal
rings that used to render eighth down the page with no heading are replaced by a
named "Your Goals" block sitting directly under the hero.

## What I did

- Opened: http://localhost:3007/partners/roosevelt-school
- Saw: a navy gradient and nothing else, page title "Partner Portal | Teachers
  Deserve It". The dev log recorded three `GET /partners/roosevelt-school 200`
  and no request for `/partners/login`, so the page is sitting in its loading
  state waiting on `supabase.auth.getSession()`.
- Pressed: nothing. There is nothing on the screen to press.

I could not sign in. The dashboard authenticates against a Supabase session on
the live project (`tauzahhnawejouvtbvuw`), so a partner session cannot be
established from localhost, and signing in as a real school is not something I
should do regardless.

What I checked instead, with exit codes rather than empty output:

- `npx tsc --noEmit` exited 0, both before and after the change, in a worktree
  where `node_modules` is linked and `tsc` genuinely runs.
- `npm run build` exited 0. "Compiled successfully in 30.0s", 400 of 400 static
  pages generated, and `/partners/[dashboardSlug]` appears in the route manifest
  as a dynamic route.
- `npx eslint` on the changed file reports the same 6 errors before and after.
  All 6 are pre-existing `react/no-unescaped-entities` on lines this change does
  not touch.
- `check:writes`, `check:reachable` and `check:schema` each exited 0.

The layout itself was reviewed as a mockup built from the same live rows, which
Rae approved on 27 September: https://claude.ai/code/artifact/dfd6758f-c148-4ffd-952e-a3893c7e9e33

- Deferred: the partner dashboard authenticates against a live Supabase session,
  so localhost renders a loading screen that never resolves and cannot be signed
  into.
- Verify after deploy: https://www.teachersdeserveit.com/partners/roosevelt-school

## Deferred pass, now performed on production

Merged as e2146827 and deployed to the `teachersdeserveit` project at
2026-09-27T19:02:22Z, deployment status success.

- Opened: https://www.teachersdeserveit.com/partners/roosevelt-school
- Saw: "Your Goals" as the first card under the hero, above "Your Next Steps",
  with "Written with you on your onboarding call" on the right of its header.
  Hero above it reads "Roosevelt School", "2026-2027", "Phase 1 . IGNITE".
- Saw: all four labels in full, no ellipsis. "Staff using the Hub in their own
  classrooms", "MTSS strategies in continuous use", "Staff supported on stress
  and burnout", "Positive parent engagement".
- Saw: the first goal reads "24% of 70%" with a navy bar filled roughly a third
  of the way. The other three show dashed tracks and read "Target 60%",
  "Target 3.5of 5" and "Target set with your team".
- Pressed: "How we measure this" on the first goal.
- Saw: the chevron rotated and the panel opened inline, starting "The share of
  your staff who have signed in and actually used the Hub, not just been handed
  an account", then "Today that is 24 percent, four of your seventeen staff".
  The old duplicated "How we measure this." opening sentence is gone, so
  `howBody()` is doing its job on real rows.
- Saw: below the paragraphs, "WHAT THIS DOES NOT SHOW" followed by "This goal is
  measured by asking your team rather than by watching a classroom", then
  "The Focus is built for this." with a "Read about The Focus" link.

### One bug found by looking

"Target 3.5of 5" is missing a space. `target_unit` for that goal is the word
"of 5", and the template put the number and the unit straight together. "%" was
fine, which is why it survived every check up to this one. Fixed by a `withUnit()`
helper in `lib/partners/goal-measurement.ts` that spaces a worded unit and keeps
"%" tight, used by both the target and `goalProgress().display` so the two halves
of a row can never disagree.

- Opened again after the fix deployed as b8cfbb5b: https://www.teachersdeserveit.com/partners/roosevelt-school
- Saw: the same goal row now reads **"Target 3.5 of 5"** with the space. Read off
  the live DOM rather than a screenshot, because this page paints late and a
  screenshot taken a moment early shows the loading screen.

## Empty state, also checked on production

- Opened: https://www.teachersdeserveit.com/partners/oak-grove-sd-68
- Saw: a "Your Goals" heading followed by "Your goals are written together on
  your onboarding call, against your own data, and in your words." Oak Grove has
  no rows in partnership_kpis, so this is the empty state.
- Saw: no goal rings in that slot. The only metric blocks on the page are the
  ordinary "Team Activation", "Partnership Intelligence" and "Partnership
  Momentum" sections, so the four generic gauges that used to impersonate goals
  are gone.

## What I did not press

Nothing was pressed anywhere in production. No row in `partnership_kpis` or
`partnerships` was written, read-only queries only.

## What I could not verify

- What a school sees rather than what a TDI admin sees. This was viewed through
  Rae's own signed-in session, which takes the `viewerIsAdmin` path. The goals
  block does not branch on that flag, so the rendering is the same, but nobody
  has loaded it as a principal.
