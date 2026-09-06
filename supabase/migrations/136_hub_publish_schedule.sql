-- ============================================================
-- Hub publish schedule
--
-- Today an approved Quick Win goes live the moment someone publishes it. The
-- measured effect: in the week of 17 August 2026, 67 Quick Wins were created
-- and all 67 published, while whole weeks either side published nothing. Ten
-- weeks of creation ran 23, 20, 24, 33, 67, 8 with created almost exactly
-- equalling published every week. There is no spacing anywhere in the system.
--
-- This adds a release date so approved content takes the next open weekday slot
-- instead. Rae set the cap at three a day, weekdays only, on 6 September 2026.
--
-- Additive and nullable on purpose. Nothing reads these columns until the
-- scheduler ships, so adding them cannot change any existing behaviour. Every
-- existing row gets null, meaning "not scheduled", which is accurate: all 269
-- published items went live immediately and are not affected by this.
--
-- The daily job publishes due rows through the same publish path everything
-- else uses, so check_quick_win_tags() still refuses anything missing its tags,
-- its lift, its domains or either PDF. Automation gets no side door.
-- ============================================================

BEGIN;

ALTER TABLE public.hub_quick_wins
  ADD COLUMN IF NOT EXISTS scheduled_publish_date date,
  ADD COLUMN IF NOT EXISTS scheduled_by           text,
  ADD COLUMN IF NOT EXISTS scheduled_at           timestamptz;

COMMENT ON COLUMN public.hub_quick_wins.scheduled_publish_date IS
  'The weekday this item is due to go live. Null means not scheduled. A date in '
  'the past on an unpublished row means the scheduled publisher has not run or '
  'could not publish it, which the daily job reports rather than swallows.';
COMMENT ON COLUMN public.hub_quick_wins.scheduled_by IS
  'Who scheduled it. Same convention as reviewed_by and published_by.';
COMMENT ON COLUMN public.hub_quick_wins.scheduled_at IS
  'When the slot was taken, as distinct from the day it is due to publish.';

-- Only the pending ones are ever queried by the scheduler, so the index is
-- partial. Published rows keep their date for the calendar's history view but
-- are never scanned by the job.
CREATE INDEX IF NOT EXISTS idx_quick_wins_scheduled_pending
  ON public.hub_quick_wins (scheduled_publish_date)
  WHERE scheduled_publish_date IS NOT NULL AND is_published = false;

COMMIT;
