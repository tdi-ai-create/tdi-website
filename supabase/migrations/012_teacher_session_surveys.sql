-- Teacher Session Surveys - Universal table for all partner schools
-- Run this SQL in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS teacher_session_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  school TEXT NOT NULL,
  session_date DATE NOT NULL,
  respondent_type TEXT,
  hub_useful TEXT,
  tools_applied TEXT[],
  confidence TEXT,
  stress_level TEXT,
  overall_feeling TEXT,
  biggest_win TEXT,
  biggest_challenge TEXT,
  support_requests TEXT[],
  who_they_turn_to TEXT[],
  tdi_as_resource TEXT,
  para_support_satisfaction TEXT,
  para_support_gaps TEXT[],
  more_para_support_interest TEXT,
  retention_likelihood TEXT,
  retention_reason TEXT,
  session_topics TEXT[],
  support_type TEXT,
  next_year_interest TEXT,
  next_year_details TEXT,
  open_note TEXT
);

-- Indexes for quick lookups
CREATE INDEX IF NOT EXISTS idx_teacher_session_surveys_school ON teacher_session_surveys(school);
CREATE INDEX IF NOT EXISTS idx_teacher_session_surveys_date ON teacher_session_surveys(session_date);
CREATE INDEX IF NOT EXISTS idx_teacher_session_surveys_created ON teacher_session_surveys(created_at);

-- Disable RLS for simple public survey submissions (enable after testing)
ALTER TABLE teacher_session_surveys DISABLE ROW LEVEL SECURITY;

-- Grant permissions for public submissions
GRANT INSERT ON teacher_session_surveys TO anon;
GRANT INSERT ON teacher_session_surveys TO authenticated;
GRANT SELECT ON teacher_session_surveys TO authenticated;
