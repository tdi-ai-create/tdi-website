-- Migration: Hub Partnership Attribution [TEA-79]
-- Adds partnership_id to hub_profiles and creates hub_partners registry table.
-- Supports the ?partnership_id= invite link flow for partner-referred signups.

ALTER TABLE hub_profiles ADD COLUMN IF NOT EXISTS partnership_id TEXT;
CREATE INDEX IF NOT EXISTS idx_hub_profiles_partnership_id ON hub_profiles(partnership_id);

CREATE TABLE IF NOT EXISTS hub_partners (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  webhook_url  TEXT,
  active       BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
