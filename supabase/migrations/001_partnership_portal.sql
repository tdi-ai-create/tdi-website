-- Partnership Portal Schema
-- Run this SQL in Supabase SQL Editor

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Partnerships (created by Rae when generating invite)
CREATE TABLE IF NOT EXISTS partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_type TEXT NOT NULL CHECK (partnership_type IN ('district', 'school')),
  slug TEXT UNIQUE,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contract_phase TEXT NOT NULL CHECK (contract_phase IN ('IGNITE', 'ACCELERATE', 'SUSTAIN')),
  contract_start DATE,
  contract_end DATE,
  building_count INTEGER DEFAULT 1,
  observation_days_total INTEGER DEFAULT 0,
  virtual_sessions_total INTEGER DEFAULT 0,
  executive_sessions_total INTEGER DEFAULT 0,
  invite_token UUID UNIQUE DEFAULT gen_random_uuid(),
  invite_sent_at TIMESTAMPTZ,
  invite_accepted_at TIMESTAMPTZ,
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'setup_in_progress', 'active', 'paused', 'completed')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Partnership Users (links Supabase auth users to partnerships)
CREATE TABLE IF NOT EXISTS partnership_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'viewer', 'champion')),
  first_name TEXT,
  last_name TEXT,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Organizations (district or school details from intake)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  org_type TEXT NOT NULL CHECK (org_type IN ('district', 'school')),
  address_street TEXT,
  address_city TEXT,
  address_state TEXT,
  address_zip TEXT,
  website TEXT,
  superintendent_name TEXT,
  superintendent_email TEXT,
  principal_name TEXT,
  principal_email TEXT,
  school_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Buildings (for district partnerships)
CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  building_type TEXT,
  lead_name TEXT,
  lead_email TEXT,
  estimated_staff_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Staff Members
CREATE TABLE IF NOT EXISTS staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role_title TEXT,
  hub_enrolled BOOLEAN DEFAULT FALSE,
  hub_login_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Action Items
CREATE TABLE IF NOT EXISTS action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('onboarding', 'data', 'scheduling', 'documentation', 'engagement')),
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'paused')),
  sort_order INTEGER DEFAULT 0,
  due_date DATE,
  paused_at TIMESTAMPTZ,
  paused_reason TEXT,
  completed_at TIMESTAMPTZ,
  evidence_url TEXT,
  evidence_file_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- ANALYTICS TABLES
-- ============================================================================

-- Activity Log
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activity_log_partnership ON activity_log(partnership_id, created_at DESC);

-- Dashboard Views
CREATE TABLE IF NOT EXISTS dashboard_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  tab_name TEXT NOT NULL,
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dashboard_views_partnership ON dashboard_views(partnership_id, created_at DESC);

-- Metric Snapshots (point-in-time data for showing change over time)
CREATE TABLE IF NOT EXISTS metric_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL NOT NULL,
  snapshot_date DATE NOT NULL,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_metric_snapshots_lookup ON metric_snapshots(partnership_id, metric_name, snapshot_date DESC);

-- Survey Responses
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  staff_member_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
  survey_type TEXT NOT NULL CHECK (survey_type IN ('baseline', 'mid_year', 'end_of_year', 'custom')),
  stress_level DECIMAL,
  planning_hours DECIMAL,
  retention_intent DECIMAL,
  implementation_confidence DECIMAL,
  feeling_valued DECIMAL,
  additional_data JSONB,
  submitted_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_survey_responses_partnership ON survey_responses(partnership_id, survey_type);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on ALL tables
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TDI ADMIN POLICIES (full access)
-- ============================================================================

CREATE POLICY "TDI admin full access partnerships" ON partnerships FOR ALL
  USING (auth.jwt() ->> 'email' LIKE '%@teachersdeserveit.com');

CREATE POLICY "TDI admin full access partnership_users" ON partnership_users FOR ALL
  USING (auth.jwt() ->> 'email' LIKE '%@teachersdeserveit.com');

CREATE POLICY "TDI admin full access organizations" ON organizations FOR ALL
  USING (auth.jwt() ->> 'email' LIKE '%@teachersdeserveit.com');

CREATE POLICY "TDI admin full access buildings" ON buildings FOR ALL
  USING (auth.jwt() ->> 'email' LIKE '%@teachersdeserveit.com');

CREATE POLICY "TDI admin full access staff_members" ON staff_members FOR ALL
  USING (auth.jwt() ->> 'email' LIKE '%@teachersdeserveit.com');

CREATE POLICY "TDI admin full access action_items" ON action_items FOR ALL
  USING (auth.jwt() ->> 'email' LIKE '%@teachersdeserveit.com');

CREATE POLICY "TDI admin full access activity_log" ON activity_log FOR ALL
  USING (auth.jwt() ->> 'email' LIKE '%@teachersdeserveit.com');

CREATE POLICY "TDI admin full access dashboard_views" ON dashboard_views FOR ALL
  USING (auth.jwt() ->> 'email' LIKE '%@teachersdeserveit.com');

CREATE POLICY "TDI admin full access metric_snapshots" ON metric_snapshots FOR ALL
  USING (auth.jwt() ->> 'email' LIKE '%@teachersdeserveit.com');

CREATE POLICY "TDI admin full access survey_responses" ON survey_responses FOR ALL
  USING (auth.jwt() ->> 'email' LIKE '%@teachersdeserveit.com');

-- ============================================================================
-- PARTNERSHIP USER POLICIES (own data access)
-- ============================================================================

-- View own partnership
CREATE POLICY "Users view own partnership" ON partnerships FOR SELECT
  USING (id IN (SELECT partnership_id FROM partnership_users WHERE user_id = auth.uid()));

-- Update own partnership status
CREATE POLICY "Users update own partnership status" ON partnerships FOR UPDATE
  USING (id IN (SELECT partnership_id FROM partnership_users WHERE user_id = auth.uid()));

-- View own partnership_users
CREATE POLICY "Users view own partnership_users" ON partnership_users FOR SELECT
  USING (partnership_id IN (SELECT partnership_id FROM partnership_users WHERE user_id = auth.uid()));

-- Insert own partnership_users during signup
CREATE POLICY "Users can insert own partnership_users" ON partnership_users FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- View own organizations
CREATE POLICY "Users view own organizations" ON organizations FOR SELECT
  USING (partnership_id IN (SELECT partnership_id FROM partnership_users WHERE user_id = auth.uid()));

-- Insert own organizations during intake
CREATE POLICY "Users insert own organizations" ON organizations FOR INSERT
  WITH CHECK (partnership_id IN (SELECT partnership_id FROM partnership_users WHERE user_id = auth.uid()));

-- Update own organizations
CREATE POLICY "Users update own organizations" ON organizations FOR UPDATE
  USING (partnership_id IN (SELECT partnership_id FROM partnership_users WHERE user_id = auth.uid()));

-- View own buildings
CREATE POLICY "Users view own buildings" ON buildings FOR SELECT
  USING (organization_id IN (SELECT o.id FROM organizations o JOIN partnership_users pu ON o.partnership_id = pu.partnership_id WHERE pu.user_id = auth.uid()));

-- Insert own buildings during intake
CREATE POLICY "Users insert own buildings" ON buildings FOR INSERT
  WITH CHECK (organization_id IN (SELECT o.id FROM organizations o JOIN partnership_users pu ON o.partnership_id = pu.partnership_id WHERE pu.user_id = auth.uid()));

-- View own staff
CREATE POLICY "Users view own staff" ON staff_members FOR SELECT
  USING (partnership_id IN (SELECT partnership_id FROM partnership_users WHERE user_id = auth.uid()));

-- Insert own staff
CREATE POLICY "Users insert own staff" ON staff_members FOR INSERT
  WITH CHECK (partnership_id IN (SELECT partnership_id FROM partnership_users WHERE user_id = auth.uid()));

-- View own action_items
CREATE POLICY "Users view own action_items" ON action_items FOR SELECT
  USING (partnership_id IN (SELECT partnership_id FROM partnership_users WHERE user_id = auth.uid()));

-- Update own action_items
CREATE POLICY "Users update own action_items" ON action_items FOR UPDATE
  USING (partnership_id IN (SELECT partnership_id FROM partnership_users WHERE user_id = auth.uid()));

-- View own activity_log
CREATE POLICY "Users view own activity_log" ON activity_log FOR SELECT
  USING (partnership_id IN (SELECT partnership_id FROM partnership_users WHERE user_id = auth.uid()));

-- Insert own activity_log
CREATE POLICY "Users insert own activity_log" ON activity_log FOR INSERT
  WITH CHECK (partnership_id IN (SELECT partnership_id FROM partnership_users WHERE user_id = auth.uid()));

-- Insert own dashboard_views
CREATE POLICY "Users insert own dashboard_views" ON dashboard_views FOR INSERT
  WITH CHECK (partnership_id IN (SELECT partnership_id FROM partnership_users WHERE user_id = auth.uid()));

-- View own metric_snapshots
CREATE POLICY "Users view own metric_snapshots" ON metric_snapshots FOR SELECT
  USING (partnership_id IN (SELECT partnership_id FROM partnership_users WHERE user_id = auth.uid()));

-- View own survey_responses
CREATE POLICY "Users view own survey_responses" ON survey_responses FOR SELECT
  USING (partnership_id IN (SELECT partnership_id FROM partnership_users WHERE user_id = auth.uid()));

-- ============================================================================
-- PUBLIC POLICIES (for invite flow)
-- ============================================================================

-- Allow invite token lookup without auth (for partner-setup page)
CREATE POLICY "Public invite token lookup" ON partnerships FOR SELECT
  USING (invite_token IS NOT NULL AND invite_accepted_at IS NULL);

-- ============================================================================
-- STORAGE BUCKET (run in Supabase Dashboard > Storage)
-- ============================================================================
-- Create bucket: partnership-evidence
-- Public: NO (private)
-- File size limit: 10MB
-- Allowed MIME types:
--   application/pdf
--   application/vnd.openxmlformats-officedocument.wordprocessingml.document
--   application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
--   text/csv
--   image/png
--   image/jpeg
