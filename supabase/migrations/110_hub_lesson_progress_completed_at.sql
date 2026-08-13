-- Add the missing hub_lesson_progress.completed_at column.
--
-- useProgressTracking both reads and writes this column, but it was never
-- created. PostgREST rejects each statement with 42703 ("column
-- hub_lesson_progress.completed_at does not exist"):
--
--   * fetchProgress selects it, so the query threw and left progress at its
--     initial zero state. Every lesson page showed 0% no matter what the
--     learner had done, and check-ins never counted toward the total.
--   * markLessonStatus upserts it, so the write threw and "Mark complete"
--     silently failed. Nothing ever moved off not_started.
--
-- Evidence at the time of writing: all 540 hub_lesson_progress rows were
-- not_started, with zero in_progress and zero completed, and none of the 49
-- enrollments had ever reached completed.
--
-- Additive and nullable, so no table rewrite and no lock of consequence. No
-- backfill is needed: nothing has ever been completed, so a null completed_at
-- is already correct for every existing row.
--
-- The upsert's onConflict target (user_id, lesson_id) is already backed by the
-- existing hub_lesson_progress_user_id_lesson_id_key unique constraint.

alter table public.hub_lesson_progress
  add column if not exists completed_at timestamptz;

comment on column public.hub_lesson_progress.completed_at is
  'Timestamp set when status becomes completed. Null while not_started or in_progress.';
