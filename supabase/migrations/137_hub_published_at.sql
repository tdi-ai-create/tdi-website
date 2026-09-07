-- ============================================================
-- Record WHEN a Quick Win went live.
--
-- hub_quick_wins has recorded published_by since migration 109 but has never
-- recorded published_at. So "what went live in September" has no exact answer
-- for anything published before today, and the monthly recap has to fall back
-- to created_at as a proxy.
--
-- The proxy is defensible for the old era: before the release schedule an item
-- published the moment it was finished, and ten weeks of data ran 23 created
-- and 23 published, 24 and 24, 67 and 67. It is not defensible going forward,
-- because the whole point of the schedule is that those two dates now differ.
--
-- Left NULL for the 269 existing rows rather than backfilled from updated_at.
-- updated_at moves on translation, retagging and community seeding, so a
-- backfill would invent a publish date that is confidently wrong. A null that
-- reads as "unknown, use the proxy" beats a number nobody can trust.
-- ============================================================

BEGIN;

ALTER TABLE public.hub_quick_wins
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

COMMENT ON COLUMN public.hub_quick_wins.published_at IS
  'When this went live. Stamped by every publish path from 7 September 2026. NULL on rows published before that date, where created_at is the best available proxy.';

CREATE INDEX IF NOT EXISTS idx_quick_wins_published_at
  ON public.hub_quick_wins (published_at)
  WHERE published_at IS NOT NULL;

COMMIT;
