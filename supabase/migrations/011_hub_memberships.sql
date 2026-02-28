-- Hub Memberships Table
-- Tracks user subscription tiers for the Learning Hub
-- Created: 2025-02-28

-- Create hub_memberships table
CREATE TABLE IF NOT EXISTS hub_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES hub_profiles(id) ON DELETE CASCADE,
  tier text NOT NULL CHECK (tier IN ('free', 'essentials', 'professional', 'all_access')),
  source text NOT NULL CHECK (source IN ('self', 'district_partner', 'admin_assigned', 'stripe')),
  status text NOT NULL CHECK (status IN ('active', 'expired', 'cancelled', 'trial')) DEFAULT 'active',
  org_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  stripe_subscription_id text,
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Indexes for fast membership lookups
CREATE INDEX IF NOT EXISTS idx_hub_memberships_user_id ON hub_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_hub_memberships_tier ON hub_memberships(tier);
CREATE INDEX IF NOT EXISTS idx_hub_memberships_status ON hub_memberships(status);
CREATE INDEX IF NOT EXISTS idx_hub_memberships_org_id ON hub_memberships(org_id);

-- RLS policies
ALTER TABLE hub_memberships ENABLE ROW LEVEL SECURITY;

-- Users can read their own membership
CREATE POLICY "Users can view own membership"
  ON hub_memberships FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all memberships (for API routes)
CREATE POLICY "Service role can manage memberships"
  ON hub_memberships FOR ALL
  USING (true)
  WITH CHECK (true);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_hub_memberships_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hub_memberships_updated_at
  BEFORE UPDATE ON hub_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_hub_memberships_updated_at();

-- Add access_tier column to hub_courses
ALTER TABLE hub_courses
  ADD COLUMN IF NOT EXISTS access_tier text NOT NULL DEFAULT 'all_access';

-- Add check constraint separately (more compatible)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'hub_courses_access_tier_check'
  ) THEN
    ALTER TABLE hub_courses
      ADD CONSTRAINT hub_courses_access_tier_check
      CHECK (access_tier IN ('free_rotating', 'essentials', 'professional', 'all_access'));
  END IF;
END $$;

-- Add is_free_rotating flag for admin rotation tool
ALTER TABLE hub_courses
  ADD COLUMN IF NOT EXISTS is_free_rotating boolean NOT NULL DEFAULT false;

-- Add free_rotation_start to track when it entered rotation
ALTER TABLE hub_courses
  ADD COLUMN IF NOT EXISTS free_rotation_start timestamptz;

-- Add access_tier column to hub_quick_wins
ALTER TABLE hub_quick_wins
  ADD COLUMN IF NOT EXISTS access_tier text NOT NULL DEFAULT 'essentials';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'hub_quick_wins_access_tier_check'
  ) THEN
    ALTER TABLE hub_quick_wins
      ADD CONSTRAINT hub_quick_wins_access_tier_check
      CHECK (access_tier IN ('free_rotating', 'essentials', 'professional', 'all_access'));
  END IF;
END $$;

-- Add is_free_rotating flag for admin rotation tool
ALTER TABLE hub_quick_wins
  ADD COLUMN IF NOT EXISTS is_free_rotating boolean NOT NULL DEFAULT false;

-- Add free_rotation_start to track when it entered rotation
ALTER TABLE hub_quick_wins
  ADD COLUMN IF NOT EXISTS free_rotation_start timestamptz;

-- Indexes for filtering by access tier
CREATE INDEX IF NOT EXISTS idx_hub_courses_access_tier ON hub_courses(access_tier);
CREATE INDEX IF NOT EXISTS idx_hub_quick_wins_access_tier ON hub_quick_wins(access_tier);
CREATE INDEX IF NOT EXISTS idx_hub_courses_free_rotating ON hub_courses(is_free_rotating) WHERE is_free_rotating = true;
CREATE INDEX IF NOT EXISTS idx_hub_quick_wins_free_rotating ON hub_quick_wins(is_free_rotating) WHERE is_free_rotating = true;

-- Comment on table
COMMENT ON TABLE hub_memberships IS 'Tracks user subscription tiers for the Learning Hub. Tiers: free, essentials ($5/mo), professional ($10/mo), all_access ($25/mo). Source indicates how membership was acquired.';
