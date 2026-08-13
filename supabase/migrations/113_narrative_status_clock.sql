-- Narrative state clock
--
-- Until now the only way to ask "how long has this narrative been stuck?" was
-- last_activity_at, which the sync API refreshes on every agent write whether or
-- not anything changed. An agent re-touching a stalled narrative reset its own
-- stall clock, so rows sat in qa_review for over a week reporting zero days idle.
--
-- narrative_status_changed_at is stamped ONLY when narrative_status actually
-- changes. Nothing reads this column yet — the alert rules that depend on it
-- ship in a later phase, once real timestamps have accumulated. Backfilled
-- values are approximate by construction and would make untrustworthy alerts.

ALTER TABLE funding_opportunities
  ADD COLUMN IF NOT EXISTS narrative_status_changed_at TIMESTAMPTZ;

-- Approximate seed: the last time the row was written at all. Wrong for any row
-- touched after its last real state change, which is why nothing reads it yet.
UPDATE funding_opportunities
   SET narrative_status_changed_at = COALESCE(updated_at, created_at)
 WHERE narrative_status_changed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_funding_opps_narrative_status_changed
  ON funding_opportunities (narrative_status, narrative_status_changed_at);

COMMENT ON COLUMN funding_opportunities.narrative_status_changed_at IS
  'Set only when narrative_status changes. Use this for state-age and stall detection, never last_activity_at, which any write refreshes.';
