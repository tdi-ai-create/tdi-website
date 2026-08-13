-- Add the missing free_rotation_start column to hub_courses and hub_quick_wins.
--
-- The Free Rotation admin page (app/tdi-admin/hub/production/page.tsx) selects
-- this column on both tables and writes it when toggling an item free. Neither
-- table has it, so PostgREST rejected every one of those statements with 42703
-- ("column ... does not exist"):
--
--   * Both load queries failed, so courseData and quickWinData came back null
--     and the page rendered empty lists. Nothing was ever manageable there.
--   * toggleFreeRotation writes { is_free_rotating, free_rotation_start }, so
--     the write failed too and free rotation could never be toggled at all.
--
-- is_free_rotating already exists on both tables; only the timestamp is
-- missing. The UI shows "Since <date>" from this value, so the column is the
-- intended design rather than something to strip out of the code.
--
-- Additive and nullable, so no table rewrite. Existing rows get null, which
-- renders as "N/A" until an item is next toggled.

alter table public.hub_courses
  add column if not exists free_rotation_start timestamptz;

alter table public.hub_quick_wins
  add column if not exists free_rotation_start timestamptz;

comment on column public.hub_courses.free_rotation_start is
  'When this course entered the free rotation. Null when not rotating.';

comment on column public.hub_quick_wins.free_rotation_start is
  'When this quick win entered the free rotation. Null when not rotating.';
