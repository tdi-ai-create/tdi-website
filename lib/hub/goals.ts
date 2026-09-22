// ── Onboarding goals: one source for the wording and the mapping ──────────
//
// Educators pick these from a twelve-card grid on first sign in, plus a
// separate "all of the above" tile. The step cannot be skipped: the complete
// button only renders once at least one goal is selected.
//
// This file exists because the wording drifted. `lib/hub/recommendations.ts`
// carried its own hand-written labels, so a card chip told Rae she had picked
// "grow your team" when the tile she actually pressed said "Grow as a leader".
// Nobody reading either file alone could see the mismatch.
//
// The labels below are verbatim from GRID_GOALS_DATA in
// app/hub/onboarding/page.tsx. If you change one, change it there too. Unifying
// the two is tracked in docs/PARKED.md: doing it here would edit the onboarding
// screen, and that screen cannot be driven locally or re-run against a real
// account without altering somebody's profile.

/** The keys `hub_profiles.onboarding_data.goals` actually stores. */
export type GoalKey =
  | 'reduce_stress'
  | 'save_time'
  | 'classroom_management'
  | 'find_joy'
  | 'team_growth'
  | 'role_support'
  | 'stop_bringing_work_home'
  | 'feel_like_myself'
  | 'make_it_to_summer'
  | 'better_parent_communication'
  | 'fresh_ideas'
  | 'figure_out_whats_next'
  | 'all_of_the_above';

/**
 * The words the educator saw on the tile they pressed.
 *
 * Never paraphrase these when showing someone their own goal back to them.
 * Quoting their choice is the whole point.
 */
export const GOAL_LABELS: Record<GoalKey, string> = {
  reduce_stress: 'Manage my stress',
  save_time: 'Get my time back',
  classroom_management: 'Classroom management',
  find_joy: 'Find the joy again',
  team_growth: 'Grow as a leader',
  role_support: 'Support my team',
  stop_bringing_work_home: 'Stop bringing work home',
  feel_like_myself: 'Feel like myself again',
  make_it_to_summer: 'Make it to summer',
  better_parent_communication: 'Better parent convos',
  fresh_ideas: 'Fresh ideas for my classroom',
  figure_out_whats_next: "Figure out what's next",
  all_of_the_above: 'All of the above',
};

/**
 * Goal to published course category.
 *
 * Categories are the slugs `hub_courses.category` stores, not prose.
 *
 * `role_support` and `figure_out_whats_next` are deliberately absent. Neither
 * points at one category honestly, so those readers fall through to the role
 * rule or to curation rather than being handed a guess. Rae chose this on
 * 21 Sep 2026 over mapping all thirteen.
 *
 * `all_of_the_above` is absent because an entry for it could never be reached.
 * Pressing that tile stores every individual goal as well, measured on all 55
 * people who picked it, and the scorer breaks on the first goal that matches
 * while `all_of_the_above` sorts last. It previously had an entry here, which
 * did nothing and carried a comment claiming it served those 55.
 *
 * Note for later, not a code problem: because those 55 have every goal, every
 * category matches, so the goal slot goes to whichever course scored highest
 * and the chip names whatever goal that course happened to match. Measured on
 * one such account, a coach at stress 4 gets "Your goal: Grow as a leader",
 * which is really their role and their stress talking. Naming a single goal for
 * someone who picked all of them is arbitrary however it is done.
 */
export const GOAL_TO_CATEGORY: Partial<Record<GoalKey, string>> = {
  reduce_stress: 'stress-&-wellness',
  find_joy: 'stress-&-wellness',
  feel_like_myself: 'stress-&-wellness',
  make_it_to_summer: 'stress-&-wellness',
  save_time: 'time-savers',
  stop_bringing_work_home: 'time-savers',
  classroom_management: 'classroom-management',
  fresh_ideas: 'classroom-management',
  better_parent_communication: 'communication',
  team_growth: 'leadership',
};

/** The tile wording for a stored key, falling back to the raw key. */
export function goalLabel(key: string): string {
  return GOAL_LABELS[key as GoalKey] ?? key;
}
