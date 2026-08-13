-- ============================================================
-- Alert state, so a repeating problem escalates instead of repeating.
--
-- The Hub content health warning fired an identical email every morning for
-- seven days. Identical daily mail is indistinguishable from noise, so it was
-- correctly ignored, and the underlying problem aged unnoticed the entire time.
--
-- Repetition is not urgency. This table lets the cron recognise "same problem
-- as yesterday", report how many days it has been unresolved, and back off the
-- send cadence rather than restating itself at the same volume forever.
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS hub_alert_state (
  fingerprint  TEXT PRIMARY KEY,
  source       TEXT NOT NULL,
  first_seen   TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_sent    TIMESTAMPTZ,
  send_count   INTEGER NOT NULL DEFAULT 0,
  sample       TEXT
);

COMMENT ON TABLE hub_alert_state IS
  'One row per distinct alert content fingerprint. Drives escalation and send backoff so a recurring alert reads as aging rather than as noise.';

CREATE INDEX IF NOT EXISTS hub_alert_state_source_idx ON hub_alert_state (source, last_seen DESC);

COMMIT;
