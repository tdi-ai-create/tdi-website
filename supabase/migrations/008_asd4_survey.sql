-- ASD4 Paraprofessional Survey - February 2025
-- Run this SQL in Supabase SQL Editor IMMEDIATELY

CREATE TABLE IF NOT EXISTS asd4_survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  school TEXT NOT NULL,
  grade_levels TEXT[] NOT NULL,
  confidence_asking INTEGER CHECK (confidence_asking BETWEEN 1 AND 5),
  confidence_feedback INTEGER CHECK (confidence_feedback BETWEEN 1 AND 5),
  tried_asking TEXT NOT NULL,
  tried_feedback TEXT NOT NULL,
  hub_login TEXT NOT NULL,
  hub_help TEXT[],
  hub_help_other TEXT,
  best_game TEXT NOT NULL,
  commitment TEXT NOT NULL,
  open_feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_asd4_survey_submitted ON asd4_survey_responses(submitted_at);
CREATE INDEX IF NOT EXISTS idx_asd4_survey_school ON asd4_survey_responses(school);

-- Disable RLS for this table (simple public survey, no auth needed)
ALTER TABLE asd4_survey_responses DISABLE ROW LEVEL SECURITY;

-- Grant insert to anon/authenticated for public submissions
GRANT INSERT ON asd4_survey_responses TO anon;
GRANT INSERT ON asd4_survey_responses TO authenticated;
GRANT SELECT ON asd4_survey_responses TO authenticated;
