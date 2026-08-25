/**
 * Re-exported from the canonical implementation rather than reimplemented.
 *
 * This module used to query a table named `team_members`. That table does not
 * exist in this database. The only table is `tdi_team_members`. The failing
 * query was wrapped in `try { ... } catch { return false }`, so the missing
 * table never surfaced as an error: it just returned false forever for anyone
 * whose address did not end in @teachersdeserveit.com.
 *
 * Nine routes import this, all of them the leadership detail pages behind
 * /tdi-admin/leadership/[id] plus the sales coach evaluator. The comment it
 * shipped with claimed it existed to let "external team members (like Omar)"
 * through, which is the exact thing it could never do.
 */
export { isTDIAdmin } from '@/lib/is-tdi-admin'
