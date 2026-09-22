// ---------------------------------------------------------------------------
// What an action item is, declared once.
//
// The database has always been the only place that defines this. Two CHECK
// constraints name every status and every category an action item may hold.
// Nothing in the application ever read them, so each surface invented its own
// vocabulary and its own idea of what "open" means:
//
//   The overdue banner, the Items Due chip and the open badge counted anything
//   that was not completed. The sidebar rendered three hardcoded groups. The
//   weekly digest and the call briefing counted only `pending`. The partner
//   dashboard counted `pending` or `in_progress`. Four definitions, one table.
//
// On 22 September 2026 Saunemin CCSD #438 showed "2 overdue items" above a list
// containing one. The second was a `paused` row the sidebar had no group for,
// so it was counted and could not be seen. The same panel offered six
// categories, five of which the database rejects, over a POST that discarded
// its error, so the add button had been failing in silence.
//
// The rule this file exists to enforce: a state you can count is a state you
// can see. Adding a status here creates its render group, so nothing can ever
// again be counted and invisible.
// ---------------------------------------------------------------------------

/**
 * Every value `action_items.status` may hold.
 *
 * This must stay identical to `action_items_status_check` in the database.
 * `not_applicable` is named here before the constraint allows it, which is the
 * safe direction: code that knows a value nothing writes yet is inert, while a
 * constraint that lands before its code fails every caller instantly. Nothing
 * writes `not_applicable` until the migration widening that constraint is
 * deployed and verified.
 */
export const ACTION_ITEM_STATUSES = [
  'pending',
  'in_progress',
  'completed',
  'paused',
  'not_applicable',
] as const;

export type ActionItemStatus = (typeof ACTION_ITEM_STATUSES)[number];

/**
 * Every value `action_items.category` may hold, matching
 * `action_items_category_check`. The panel used to offer `general`, `hub`,
 * `coaching`, `billing` and `follow_up`. The database has never accepted any of
 * them and no row has ever held one.
 */
export const ACTION_ITEM_CATEGORIES = [
  'onboarding',
  'data',
  'scheduling',
  'documentation',
  'engagement',
] as const;

export type ActionItemCategory = (typeof ACTION_ITEM_CATEGORIES)[number];

/**
 * `status` and `category` are typed as strings rather than as the unions above
 * because they arrive from the database, where a future migration could widen
 * either one without this file being updated. Narrow with `isKnownStatus`
 * before relying on the value, and render anything unknown rather than
 * dropping it.
 */
export interface ActionItem {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  category?: string | null;
  due_date?: string | null;
  completed_at?: string | null;
  paused_at?: string | null;
  paused_reason?: string | null;
  resurface_at?: string | null;
  visible_to_partner?: boolean | null;
  priority?: string | null;
  sort_order?: number | null;
  created_at?: string;
  updated_at?: string;
}

export function isKnownStatus(value: unknown): value is ActionItemStatus {
  return (
    typeof value === 'string' &&
    (ACTION_ITEM_STATUSES as readonly string[]).includes(value)
  );
}

export function isKnownCategory(value: unknown): value is ActionItemCategory {
  return (
    typeof value === 'string' &&
    (ACTION_ITEM_CATEGORIES as readonly string[]).includes(value)
  );
}

/**
 * Terminal states are finished. They are not open, they are never overdue, and
 * they never resurface.
 *
 * `completed` means the work happened. `not_applicable` means a decision was
 * made that the work never will, which is why it carries a reason. Before
 * `not_applicable` existed both of the rows that meant it were stored as
 * `paused` with a null `resurface_at`, so they read as unfinished work on every
 * counter for the life of the contract.
 */
function isTerminal(item: ActionItem): boolean {
  return item.status === 'completed' || item.status === 'not_applicable';
}

/**
 * Open means someone still owes this. An unrecognised status counts as open,
 * because the alternative is a row that silently stops mattering.
 */
export function isOpen(item: ActionItem): boolean {
  return !isTerminal(item);
}

/**
 * Snoozed means open, deliberately quiet, and due back later.
 *
 * A `paused` row with a `resurface_at` in the future is waiting. One whose
 * `resurface_at` has passed is not: the snooze expired and the item should
 * nag again. A `paused` row with no `resurface_at` at all is paused
 * indefinitely, which stays quiet until a person acts on it. That last case
 * only exists in rows written before `not_applicable` did.
 */
export function isSnoozed(item: ActionItem, now: Date = new Date()): boolean {
  if (item.status !== 'paused') return false;
  if (!item.resurface_at) return true;
  return new Date(item.resurface_at) > now;
}

/**
 * Past its due date and still owed, with the snooze respected.
 *
 * `due_date` is a date column, so `new Date(due_date)` reads as midnight UTC.
 * In Chicago that made an item overdue from 7pm the evening before it was due,
 * and the sidebar corrected for it while the banner above it did not. Parsing
 * at `T23:59:59` local gives an item the whole of its due day, everywhere.
 */
export function isOverdue(item: ActionItem, now: Date = new Date()): boolean {
  if (!isOpen(item)) return false;
  if (!item.due_date) return false;
  if (isSnoozed(item, now)) return false;
  return new Date(`${item.due_date}T23:59:59`) < now;
}

/**
 * Where each status appears in the sidebar.
 *
 * This is a `Record` keyed by the status union on purpose. Adding a value to
 * ACTION_ITEM_STATUSES without giving it a row here does not compile, which is
 * the whole mechanism: the reason Saunemin could show "2 overdue items" over a
 * list of one is that `paused` was counted by a rule that took every status and
 * rendered by a list that named three. A status can no longer be counted
 * without also being visible.
 *
 * `collapsed` groups sit behind a disclosure, because finished work should not
 * crowd out work that is still owed.
 */
const STATUS_GROUP_DEFS: Record<
  ActionItemStatus,
  { label: string; collapsed: boolean; order: number }
> = {
  in_progress: { label: 'In progress', collapsed: false, order: 1 },
  pending: { label: 'Pending', collapsed: false, order: 2 },
  paused: { label: 'Paused', collapsed: false, order: 3 },
  not_applicable: { label: 'Not applicable', collapsed: true, order: 4 },
  completed: { label: 'Completed', collapsed: true, order: 5 },
};

export const STATUS_GROUPS: {
  status: ActionItemStatus;
  label: string;
  collapsed: boolean;
}[] = [...ACTION_ITEM_STATUSES]
  .map(status => ({ status, ...STATUS_GROUP_DEFS[status] }))
  .sort((a, b) => a.order - b.order)
  .map(({ status, label, collapsed }) => ({ status, label, collapsed }));

export const CATEGORY_LABELS: Record<ActionItemCategory, string> = {
  onboarding: 'Onboarding',
  data: 'Data',
  scheduling: 'Scheduling',
  documentation: 'Documentation',
  engagement: 'Engagement',
};

export const CATEGORY_COLORS: Record<ActionItemCategory, string> = {
  onboarding: '#8B5CF6',
  data: '#3B82F6',
  scheduling: '#F59E0B',
  documentation: '#6B7280',
  engagement: '#10B981',
};

/**
 * 49 of the 63 action items that exist are onboarding, so it is the default a
 * person is most often about to pick. The old default was `general`, which the
 * database has never accepted.
 */
export const DEFAULT_CATEGORY: ActionItemCategory = 'onboarding';

export function categoryColor(category: string | null | undefined): string {
  return isKnownCategory(category) ? CATEGORY_COLORS[category] : '#6B7280';
}

export function categoryLabel(category: string | null | undefined): string {
  return isKnownCategory(category) ? CATEGORY_LABELS[category] : 'Uncategorised';
}
