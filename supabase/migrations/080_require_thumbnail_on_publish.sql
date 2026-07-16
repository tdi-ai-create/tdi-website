-- 080_require_thumbnail_on_publish.sql
-- TEA-8420 / TEA-8431: prevent any published Quick Win or Course from being
-- published without a thumbnail_url. This is the enforcement gate that stops
-- the "blank product card" regression from recurring.
--
-- Apply AFTER backfilling all null thumbnail_url values on published rows.
-- TEA-8431 backfill (July 2026) filled the last 20 published Quick Wins.
--
-- Semantics:
--   - Any INSERT/UPDATE that sets is_published = true while thumbnail_url IS NULL
--     is rejected by the CHECK constraint.
--   - Unpublished drafts may keep null thumbnails (authors add them on publish).
--   - Empty-string thumbnails are also rejected (defense in depth).

BEGIN;

-- 1. Sanity guard: fail loudly if any published row still has a null thumbnail.
DO $$
DECLARE
  qw_missing INT;
  crs_missing INT;
BEGIN
  SELECT COUNT(*) INTO qw_missing
    FROM public.hub_quick_wins
   WHERE is_published = true AND (thumbnail_url IS NULL OR thumbnail_url = '');

  SELECT COUNT(*) INTO crs_missing
    FROM public.hub_courses
   WHERE is_published = true AND (thumbnail_url IS NULL OR thumbnail_url = '');

  IF qw_missing > 0 OR crs_missing > 0 THEN
    RAISE EXCEPTION 'Cannot install thumbnail gate: % published quick_wins and % published courses still have null/empty thumbnail_url. Backfill first.',
      qw_missing, crs_missing;
  END IF;
END$$;

-- 2. Quick Wins: block publish without thumbnail.
ALTER TABLE public.hub_quick_wins
  DROP CONSTRAINT IF EXISTS hub_quick_wins_thumbnail_required_when_published;

ALTER TABLE public.hub_quick_wins
  ADD CONSTRAINT hub_quick_wins_thumbnail_required_when_published
  CHECK (
    is_published = false
    OR (thumbnail_url IS NOT NULL AND length(trim(thumbnail_url)) > 0)
  );

-- 3. Courses: mirror the same gate so the whole product surface is protected.
ALTER TABLE public.hub_courses
  DROP CONSTRAINT IF EXISTS hub_courses_thumbnail_required_when_published;

ALTER TABLE public.hub_courses
  ADD CONSTRAINT hub_courses_thumbnail_required_when_published
  CHECK (
    is_published = false
    OR (thumbnail_url IS NOT NULL AND length(trim(thumbnail_url)) > 0)
  );

COMMIT;

-- Rollback:
-- ALTER TABLE public.hub_quick_wins DROP CONSTRAINT hub_quick_wins_thumbnail_required_when_published;
-- ALTER TABLE public.hub_courses    DROP CONSTRAINT hub_courses_thumbnail_required_when_published;
