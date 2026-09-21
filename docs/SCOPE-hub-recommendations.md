# Scope contract: Hub recommendation signals

Branch: `fix/hub-recommendations-signals`
Worktree: `/Users/raehughart/tdi-wt-recs`
Opened: 21 Sep 2026. Approved by Rae.

## Why this work exists

Quizzes should teach us about Hub members and change what we recommend to them.
Today they do not, and the reason turned out to be upstream of the quizzes:
`lib/hub/recommendations.ts` has never personalised anything for anyone.

## The bug (Measured, 21 Sep 2026)

The scorer compares course categories against Title Case literals:

    course.category === 'Stress & Wellness'
    course.category === 'Leadership'
    course.category === 'Classroom Management'

Actual values in `hub_courses` where `is_published = true`:

    classroom-management (13)
    communication         (8)
    leadership            (4)
    stress-&-wellness     (3)
    time-savers           (3)

There is no normalisation in the file. Every comparison is false, so all four
rules fall through to the default branch, every course gets `score = 1` and
`reason = 'Popular with teachers'`, and the function returns an arbitrary
three-course slice in whatever order Postgres returned.

Three further faults behind that one:

1. `New Teacher` is a target category in `roleToCategoryMap`. No such course
   category exists, so that rule would stay dead even with the case fixed.
2. `roleToCategoryMap` has no entry for `classroom_teacher`, which is 526 of
   the 676 people active in the last 90 days.
3. `'Popular with teachers'` counts nothing. It is the fallback string on a
   rule that always fails, presented to every user as a popularity claim.

## Baseline (Measured, 21 Sep 2026, Learning Hub `asdwpkcsbcnpknklchdq`)

| Fact | Value |
|---|---|
| Users receiving a personalised course recommendation | 0 |
| People with quiz results | 163 |
| People with 2+ quiz results | 33 |
| People with an `educator_type` result | 154 |
| People with `daily_check_in` stress data | 371 |
| Rows in `hub_user_goals` | 0 |
| Published courses | 31 |
| People active in last 90 days | 676 (526 `classroom_teacher`) |

Educator Type distribution: architect 42, strategist 35, connector 35,
anchor 24, innovator 18. Balanced, unlike role.

## The second bug (Measured, 21 Sep 2026)

`getRecommendations()` has exactly one caller, `app/hub/page.tsx:511`. Its
result is written to the `recommendations` and `showRecommendations` state
hooks. Neither is read by any JSX in that file. The dashboard has been running
these queries on every load and discarding the answer.

So repairing the scorer is necessary and not sufficient. Without a render site,
steps 1a, 1b and 2 all ship correct logic into a dead end and the measured
outcome stays zero people helped. This is the unreachable-code trap in section
4 of CLAUDE.md.

Rae brought the render site into scope on 21 Sep, amending the original
"no dashboard changes" boundary. That boundary still holds for everything else
on the page: this adds one band, it does not redesign anything around it.

## In scope

- **1a** `lib/hub/recommendations.ts`: fix category matching, rebuild
  `roleToCategoryMap` against real role values, repair the stress rule,
  replace the false popularity label.
- **1c** `app/hub/page.tsx`: render the recommendations that already load.
  Ships in the same PR as 1a, because neither half delivers anything alone.
  Also retire the "Set a goal to get personalised recommendations" empty state,
  which points at a table with zero rows.
- **1b** `lib/hub/recommendations.ts`: add `hub_quiz_results` as a scoring signal.
- **2** `lib/hub/quizRecommendations.ts`: add the `educator_type` mapping,
  all five result keys.
- **3** Combined Educator Type x Career Season x Energy Drain read.
  Design only. Stops for Rae's approval before any build.

## Out of scope. Parked, not forgotten.

Anything below goes in `PARKED.md` with a note. None of it enters the diff.

- Why `hub_user_goals` is empty. Its map is broken by the same bug, but the
  table has no rows, so repairing it changes nothing for anyone.
- Dead component removal (`components/hub/EducatorQuiz.tsx` is imported nowhere).
- The two never-taken quizzes (`management_style`, `arts_culture`).
- The other five quizzes missing recommendation mappings (38 people combined).
- Any dashboard layout or visual change.
- The shareable pyramid chart.

## Done means

A person who has taken quizzes **opens the Hub home page and sees** course
recommendations that change based on their results. Proven by a query for the
scoring and by a browser pass for the surface, not described in either case.

## Gates this work has to clear

- `npm run typecheck`, checked by exit code, never by empty output.
- `npm run check:reachable`. 1c exists because this branch would otherwise fail
  the spirit of that check: logic reaching a state hook nothing reads.
- `npm run check:schema` after the query changes in 1a and 1b.
- `npm run check:browserpass`. 1c touches a screen people operate, so it needs
  a record under `browser-passes/` with a figure or quoted text in it.

Preview deployments return 500 on every route, so there is nowhere safe to
click this before production. Try local first. If the Hub home page cannot be
signed in to locally, record a deferred pass naming the production URL, ship,
then open that URL and write the `Pressed:` and `Saw:` lines into the same
file. One deferral is sequencing. A second one pays for the first.

## Rules for this work

1. One PR per step, except 1a and 1c which ship together because neither half
   delivers anything alone. An unexpected file in the diff is the drift signal.
2. Every step exits on a measured result, not a described one.
3. Hard stop and report between steps. Do not roll into the next one.
4. Scope changes come back to Rae. They are not decided in the worktree.
5. No claim ships without a tier: Measured, Derived, or Unverified.
6. One detail per report, then wait. Not a wall of sections.
