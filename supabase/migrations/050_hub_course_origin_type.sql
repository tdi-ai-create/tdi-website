-- Migration: Add origin_type column to hub_courses for Internal/External tracking
-- Purpose: Enables measurement of the Internal vs External content mix over time.
-- Source: TEA-2380 Course Creation Assignment Framework (Step 4: retroactive tagging)

ALTER TABLE hub_courses
ADD COLUMN IF NOT EXISTS origin_type TEXT CHECK (origin_type IN ('internal', 'external_creator', 'mixed'));

COMMENT ON COLUMN hub_courses.origin_type IS 'Content origin: internal (TDI team/Rae), external_creator (outside creator), or mixed (internal framing + external expertise)';

CREATE INDEX IF NOT EXISTS idx_hub_courses_origin_type ON hub_courses (origin_type);

-- Auto-tag courses where author_name suggests Internal origin
UPDATE hub_courses
SET origin_type = 'internal'
WHERE origin_type IS NULL
  AND (
    author_name IS NULL
    OR author_name ILIKE '%teachers deserve it%'
    OR author_name ILIKE '%tdi%'
    OR author_name ILIKE '%rae%'
  );

-- Remaining courses with a named external author get tagged as external_creator
UPDATE hub_courses
SET origin_type = 'external_creator'
WHERE origin_type IS NULL
  AND author_name IS NOT NULL
  AND author_name != '';
