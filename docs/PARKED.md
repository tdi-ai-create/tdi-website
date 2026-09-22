# Parked: found during the recommendation-signals work, deliberately not fixed

Opened 21 Sep 2026. Everything here is real. None of it is in scope for
`fix/hub-recommendations-signals`. Hand back to Rae at the end.

| Finding | Evidence | Why parked |
|---|---|---|
| `hub_user_goals` is empty | 0 rows, 0 distinct users | Its category map is broken by the same string bug, but with no rows, repairing it changes nothing for anyone |
| `components/hub/EducatorQuiz.tsx` is dead | Imported nowhere; every surface uses `QuizEngine` | Cleanup, unrelated to recommendation quality |
| Two quizzes have never been taken | `management_style`, `arts_culture`: 0 rows in `hub_quiz_results` | Content/placement decision for Rae, not a code fix |
| Five quizzes lack recommendation mappings | `tech_comfort`, `creator_ready`, `management_style`, `arts_culture`, `sel_strategy` | 38 people combined. `educator_type` (154 people) is in scope; these are not |
| Quiz discovery cliff | `educator_type` 154 takes because it sits in onboarding; next highest is 33 | Placement problem, addressed by step 3's design, not by this PR |

## Added 22 Sep 2026

| Finding | Evidence | Why parked |
|---|---|---|
| Onboarding still owns a second copy of the goal labels | `GRID_GOALS_DATA` in `app/hub/onboarding/page.tsx` duplicates `GOAL_LABELS` in `lib/hub/goals.ts` | Unifying them edits the onboarding screen, which cannot be driven locally and cannot be re-run against a real account without altering someone's profile. `npm run check:goals` fails the build if they drift, so the risk is held mechanically rather than by a comment |
| 47,747 profiles are marked onboarded with zero goals | `onboarding_completed = true` and an empty `onboarding_data.goals`, against 199 with goals | The onboarding goal step cannot be skipped, so these were bulk-marked by the import and never ran it. Decides who the "Set a goal" empty state is really for, which is a product question for Rae |
| The profile goal editor discards its insert error | `app/hub/settings/profile/page.tsx:775` inserts into `hub_user_goals` with no error check, and that table has zero rows | Silent-write shape from CLAUDE.md. Recommendations read `onboarding_data` so they are unaffected, but "Update my goals" may not do everything it claims |
| `role_support` may deserve a mapping after all | Its tile reads "Support my team", which is far less ambiguous than the key name suggested when it was left unmapped | Rae chose map-11-skip-2 on 21 Sep against a worse description of this goal. Worth re-asking with the real wording rather than quietly reversing her call |
