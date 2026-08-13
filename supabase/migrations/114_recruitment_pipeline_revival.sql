-- Creator Recruitment Pipeline Revival
--
-- Context: the recruitment tables have sat empty since creation because the only
-- writer was an agent that never ran its recruitment loop. This migration makes
-- the pipeline safe for automated gap detection and for human entry.
--
-- 1. Dedupe guards so a repeating scan cannot create duplicate candidates.
-- 2. Provenance on gaps so we can tell a scanned gap from a human or agent one.
-- 3. Metric freshness so a stale gap is visibly stale.

-- ─── Candidate dedupe guards ───
-- The tables are empty today, so these can be created without a cleanup pass.
-- Email is matched case insensitively because nominations get typed by hand.

CREATE UNIQUE INDEX IF NOT EXISTS idx_recruitment_candidates_email_unique
  ON creator_recruitment_candidates (lower(email))
  WHERE email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_recruitment_candidates_hub_user_unique
  ON creator_recruitment_candidates (hub_user_id)
  WHERE hub_user_id IS NOT NULL;

-- ─── Gap provenance and freshness ───
-- identified_by already exists and defaults to 'anne-marie'. Widen the meaning:
-- 'system' for the scheduled scan, 'admin' for a human, agent slug otherwise.

ALTER TABLE creator_content_gaps
  ALTER COLUMN identified_by SET DEFAULT 'admin';

ALTER TABLE creator_content_gaps
  ADD COLUMN IF NOT EXISTS metrics_updated_at timestamptz;

-- A category should only ever have one active gap. The scan and the admin UI
-- both upsert on this assumption, so enforce it rather than trusting callers.
CREATE UNIQUE INDEX IF NOT EXISTS idx_content_gaps_active_category_unique
  ON creator_content_gaps (lower(category))
  WHERE status = 'active';

-- ─── Backfill ───
UPDATE creator_content_gaps
  SET metrics_updated_at = updated_at
  WHERE metrics_updated_at IS NULL;

COMMENT ON COLUMN creator_content_gaps.identified_by IS
  'Who created this gap: "system" (scheduled Hub content scan), "admin" (human), or an agent slug.';
COMMENT ON COLUMN creator_content_gaps.metrics_updated_at IS
  'Last time the content counts on this row were refreshed by the scan.';
