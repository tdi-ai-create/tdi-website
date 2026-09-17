-- Why something came off the calendar.
--
-- Runs against the Learning Hub project (asdwpkcsbcnpknklchdq).
--
-- `unschedule` on /api/hub/content-sync accepts a `reason`, echoes it back in
-- the response, and never writes it anywhere. It then clears
-- scheduled_publish_date, scheduled_by and scheduled_at, so the piece loses its
-- date and every trace of who had planned it.
--
-- On 16 September at 03:34 and 03:35 two reviewed Quick Wins came off the
-- September calendar: "Signs You're Seeing: When to Refer, Not Diagnose" and
-- "Noticing Your Own Compassion Fatigue". Both are Phase 3 student-support
-- items that policy holds for a credentialed human sign-off rather than letting
-- an agent review publish them, so pulling them off the schedule was correct and
-- protective. Nothing in the database said so. From the data it looked like
-- content had silently disappeared from a month, and the only way to find out
-- was to read agent tickets in Paperclip.
--
-- Nullable and additive. Existing rows stay null, which honestly reads as "this
-- happened before anyone recorded it" rather than inventing a reason.

BEGIN;

ALTER TABLE public.hub_quick_wins
  ADD COLUMN IF NOT EXISTS unscheduled_at     timestamptz,
  ADD COLUMN IF NOT EXISTS unscheduled_by     text,
  ADD COLUMN IF NOT EXISTS unschedule_reason  text;

COMMENT ON COLUMN public.hub_quick_wins.unschedule_reason IS
  'Why this was pulled off the release calendar. A piece losing its date and nobody being able to say why is the failure this exists to prevent.';

COMMENT ON COLUMN public.hub_quick_wins.unscheduled_by IS
  'Who pulled it. Null on rows unscheduled before 16 September 2026, when nothing was recorded.';

COMMIT;
