-- Runs against the CREATOR PORTAL project (tauzahhnawejouvtbvuw).
--
-- funding_action_items.nudge_count is incremented on every automated reminder
-- and is never compared against a maximum anywhere in the codebase. An overdue
-- item therefore emails its owner forever, stopping only when a person marks it
-- done. Two school principals received 41 of these between them; a single item
-- accounted for 18.
--
-- The cadence has since been changed from daily to weekly, which reduces the
-- volume but not the fact that it never terminates.
--
-- A ceiling needs somewhere to record that it has been reached, for one reason:
-- when reminders stop, somebody has to be told, exactly once. Without a marker
-- the cron either re-announces every hour or the item goes quiet and is
-- forgotten, and "goes quiet and is forgotten" is the failure this whole
-- pipeline was rebuilt to remove.
--
-- Deliberately nullable with no default and no constraint. Code that does not
-- know about this column is unaffected, so this can be applied before the
-- change that reads it.

alter table public.funding_action_items
  add column if not exists nudge_ceiling_notified_at timestamptz;

comment on column public.funding_action_items.nudge_ceiling_notified_at is
  'Set once, when automated reminders for this item stop because the nudge ceiling was reached. Null means the ceiling has not been hit. Used to guarantee the handoff to a person fires exactly once rather than every cron cycle.';
