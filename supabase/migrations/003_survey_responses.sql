-- Phase D-2: Survey Response Intake System
-- Run this SQL in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  staff_member_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
  survey_type TEXT NOT NULL CHECK (survey_type IN ('baseline', 'mid_year', 'end_of_year', 'custom')),
  custom_label TEXT, -- For custom survey type
  stress_level DECIMAL,
  planning_hours DECIMAL,
  retention_intent DECIMAL,
  implementation_confidence DECIMAL,
  feeling_valued DECIMAL,
  additional_data JSONB,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_survey_responses_partnership ON survey_responses(partnership_id, survey_type);
CREATE INDEX IF NOT EXISTS idx_survey_responses_staff ON survey_responses(staff_member_id);

ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- TDI admin full access
CREATE POLICY "TDI admin full access" ON survey_responses FOR ALL
  USING (auth.jwt() ->> 'email' LIKE '%@teachersdeserveit.com');

-- Users can view survey data for their partnerships
CREATE POLICY "Users view own survey data" ON survey_responses FOR SELECT
  USING (partnership_id IN (
    SELECT partnership_id FROM partnership_users WHERE user_id = auth.uid()
  ));
