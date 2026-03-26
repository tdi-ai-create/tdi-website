-- Add partnership_id to hub_org_members
-- This bridges Hub users directly to TDI partnerships (the source of truth)
ALTER TABLE hub_org_members
ADD COLUMN IF NOT EXISTS partnership_id uuid REFERENCES partnerships(id) ON DELETE SET NULL;

-- Index for fast lookups by partnership
CREATE INDEX IF NOT EXISTS idx_hub_org_members_partnership_id
ON hub_org_members(partnership_id);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_hub_org_members_user_id
ON hub_org_members(user_id);

-- RLS: admins can read all, users can read their own membership
ALTER TABLE hub_org_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hub_org_members_admin_all" ON hub_org_members;
CREATE POLICY "hub_org_members_admin_all" ON hub_org_members
FOR ALL
USING (auth.email() IN (SELECT email FROM admin_users));

DROP POLICY IF EXISTS "hub_org_members_user_read_own" ON hub_org_members;
CREATE POLICY "hub_org_members_user_read_own" ON hub_org_members
FOR SELECT
USING (user_id = auth.uid());
