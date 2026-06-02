-- Phase 0: Tier Override Foundation (TEA-4829)
-- Adds active_tier_overrides table alongside hub_memberships.
-- Allows any mechanic (streak reward, fast-track, admin grant, etc.)
-- to temporarily elevate a user's tier without touching hub_memberships.

CREATE TABLE IF NOT EXISTS active_tier_overrides (
  user_id UUID PRIMARY KEY REFERENCES hub_profiles(id) ON DELETE CASCADE,
  tier_granted TEXT NOT NULL CHECK (tier_granted IN ('free', 'essentials', 'professional', 'all_access')),
  granted_by_mechanic TEXT NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Index for the hourly cleanup sweep
CREATE INDEX idx_tier_overrides_expires_at ON active_tier_overrides(expires_at);

-- RLS
ALTER TABLE active_tier_overrides ENABLE ROW LEVEL SECURITY;

-- Users can read their own override
CREATE POLICY "Users can read own override"
  ON active_tier_overrides FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything (admin operations, cron cleanup)
CREATE POLICY "Service role full access"
  ON active_tier_overrides FOR ALL
  USING (auth.role() = 'service_role');
