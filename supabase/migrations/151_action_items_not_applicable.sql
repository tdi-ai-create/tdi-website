-- A decision that an action item will never happen is not a pause.
--
-- `paused` was built as a snooze: paused_at, paused_reason, and a resurface_at
-- that brings the item back. Both rows that actually used it were permanent
-- decisions with a null resurface_at, one because the IGNITE contract carries
-- no virtual sessions and one because a Learning Hub membership has no
-- observation days. Stored as a snooze, they read as unfinished work on every
-- counter for the rest of the contract while the sidebar had no group to show
-- them in, which is how Saunemin CCSD #438 came to display "2 overdue items"
-- above a list containing one.
--
-- Widening this constraint accepts a value no caller sends yet, which is the
-- safe direction. The code that reads and renders `not_applicable` is in
-- lib/leadership/action-items.ts and ships with this migration.

alter table action_items drop constraint action_items_status_check;

alter table action_items add constraint action_items_status_check
  check (status = any (array[
    'pending',
    'in_progress',
    'completed',
    'paused',
    'not_applicable'
  ]));

-- paused_at and paused_reason are deliberately kept. They are the record of
-- when the decision was taken and why, and the panel renders the reason under
-- the row so the decision stays visible rather than silently dropping out.
update action_items
   set status = 'not_applicable',
       updated_at = now()
 where status = 'paused'
   and resurface_at is null;
