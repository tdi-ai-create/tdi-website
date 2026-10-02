/**
 * Whether the In Practice tab is reachable on a partner dashboard.
 *
 * Default off. This adds a tab to every one of the nine live partnerships the
 * moment it is true, because there is one dashboard component and no per-client
 * branching, which is the feature and also the blast radius.
 *
 * The order is: deploy the reading code with this off, check the tab renders
 * for all nine including the three that cannot assign yet, then set it. Rolling
 * back is unsetting one variable and needs no deploy.
 *
 * Three of the nine cannot assign on the day this goes on, and that is expected
 * rather than a reason to wait. Allenwood has no roster, Oak Grove has no goals,
 * and Tidioute has three goals drafted and none accepted. A10.1 says each is
 * shown the single thing that unblocks it, so the tab is useful to them before
 * it is usable by them.
 */
export function isAssignTabOn(): boolean {
  return process.env.IN_PRACTICE_TAB === 'true'
}
