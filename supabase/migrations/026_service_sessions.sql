-- ============================================================
-- Migration 026: Service Sessions (Intelligence Hub Phase 3)
-- ============================================================

CREATE TABLE IF NOT EXISTS service_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES intelligence_contracts(id) ON DELETE SET NULL,
  session_type TEXT CHECK (session_type IN (
    'observation', 'virtual_session', 'executive_impact',
    'love_notes', 'keynote', 'custom'
  )) NOT NULL,
  session_date DATE NOT NULL,
  title TEXT,
  attendees_count INTEGER,
  buildings_visited TEXT[],
  notes TEXT,
  evidence_urls TEXT[] DEFAULT '{}',
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_sessions_district ON service_sessions(district_id);
CREATE INDEX IF NOT EXISTS idx_service_sessions_contract ON service_sessions(contract_id);
CREATE INDEX IF NOT EXISTS idx_service_sessions_type ON service_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_service_sessions_date ON service_sessions(session_date);

-- Note: Assumes update_intelligence_updated_at() function exists from previous migrations
-- If not, use this generic trigger function:
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = NOW();
--   RETURN NEW;
-- END;
-- $$ language 'plpgsql';

CREATE TRIGGER trg_service_sessions_updated BEFORE UPDATE ON service_sessions
  FOR EACH ROW EXECUTE FUNCTION update_intelligence_updated_at();

ALTER TABLE service_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access_service_sessions" ON service_sessions
  FOR ALL USING (auth.email() IN (SELECT email FROM admin_users));
