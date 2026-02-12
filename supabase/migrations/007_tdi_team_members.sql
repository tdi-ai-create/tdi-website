-- Migration: TDI Team Members
-- Description: Creates the tdi_team_members table for unified admin portal access control

-- ============================================
-- tdi_team_members Table
-- ============================================

CREATE TABLE tdi_team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster email lookups
CREATE INDEX idx_tdi_team_members_email ON tdi_team_members(email);
CREATE INDEX idx_tdi_team_members_user_id ON tdi_team_members(user_id);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE tdi_team_members ENABLE ROW LEVEL SECURITY;

-- Anyone can view team members (needed for auth checks)
CREATE POLICY "Team members can view team"
ON tdi_team_members FOR SELECT
USING (true);

-- Only owners can insert/update/delete team members
CREATE POLICY "Owner can manage team"
ON tdi_team_members FOR ALL
USING (
  auth.uid() IN (SELECT user_id FROM tdi_team_members WHERE role = 'owner')
);

-- ============================================
-- Updated_at Trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_tdi_team_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tdi_team_members_updated_at
  BEFORE UPDATE ON tdi_team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_tdi_team_members_updated_at();

-- ============================================
-- Seed Initial Owner (Rae)
-- ============================================

INSERT INTO tdi_team_members (email, display_name, role, permissions) VALUES
('rae@teachersdeserveit.com', 'Rae Hughart', 'owner', '{
  "learning_hub": {
    "view_enrollments": true,
    "export_reports": true,
    "manage_courses": true,
    "manage_tips": true,
    "manage_quick_wins": true,
    "view_financial": true,
    "manage_certificates": true,
    "bulk_operations": true,
    "view_analytics": true,
    "manage_content": true,
    "email_management": true
  },
  "creator_studio": {
    "view_creators": true,
    "manage_creators": true,
    "content_pipeline": true,
    "financial_payouts": true,
    "approve_content": true
  },
  "leadership": {
    "view_partnerships": true,
    "manage_schools": true,
    "view_diagnostics": true,
    "financial_data": true,
    "export_reports": true
  },
  "team_access": true
}');
