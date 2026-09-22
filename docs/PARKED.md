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
