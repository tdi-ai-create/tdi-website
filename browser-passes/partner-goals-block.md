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

## What I did not press

Nothing was pressed anywhere in production. No row in `partnership_kpis` or
`partnerships` was written, read-only queries only.

## What I could not verify

Everything a person actually sees. Specifically, still unproven until the
production check above:

- That "Your Goals" renders above "Set Up Your Partnership" rather than below it.
- That Roosevelt's first goal reads "24% of 70%" and the other three read
  "Target 60%", "Target 3.5 of 5" and "Target set with your team".
- That the four goal labels render in full rather than truncated.
- That the "How we measure this" disclosure opens and the duplicated opening
  sentence is gone.
- That a school with no goals (Addison SD4, Oak Grove SD68, Tidioute) shows the
  one-line block and no longer shows four generic rings in that slot.
