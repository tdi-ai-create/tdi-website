-- ============================================================
-- Mark an account as a TDI voice.
--
-- Posts from a flagged account render a TDI chip beside the
-- author name in the Hub conversation and Q&A tabs, so a
-- member can always tell our voice from another teacher's.
--
-- Ships dark: no account is flagged by this migration, so
-- every byline in the Hub is unchanged until someone is set.
-- Rollback is a single UPDATE, no deploy needed.
-- ============================================================

ALTER TABLE hub_profiles
  ADD COLUMN IF NOT EXISTS is_tdi_voice BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN hub_profiles.is_tdi_voice IS
  'True when this account posts on behalf of TDI. Drives the TDI chip in community bylines.';
