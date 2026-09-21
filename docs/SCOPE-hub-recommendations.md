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

## In scope

- **1a** `lib/hub/recommendations.ts`: fix category matching, rebuild
  `roleToCategoryMap` against real role values, repair the stress rule,
  replace the false popularity label.
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

A person who has taken quizzes sees course recommendations that change based on
their results, and the before/after is shown with a query, not described.

## Rules for this work

1. One PR per step. An unexpected file in the diff is the drift signal.
2. Every step exits on a measured result, not a described one.
3. Hard stop and report between steps. Do not roll into the next one.
4. Scope changes come back to Rae. They are not decided in the worktree.
5. No claim ships without a tier: Measured, Derived, or Unverified.
