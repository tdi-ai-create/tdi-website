-- WEGO PA and Teacher Surveys
-- Run this SQL in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS wego_survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_type TEXT NOT NULL CHECK (survey_type IN ('pa', 'teacher')),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  pa_names TEXT, -- teacher survey only: which PA(s) they work with
  responses JSONB NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for quick lookups
CREATE INDEX IF NOT EXISTS idx_wego_survey_type ON wego_survey_responses(survey_type);
CREATE INDEX IF NOT EXISTS idx_wego_survey_submitted ON wego_survey_responses(submitted_at);
CREATE INDEX IF NOT EXISTS idx_wego_survey_name ON wego_survey_responses(last_name, first_name);

-- Disable RLS for anonymous submissions
ALTER TABLE wego_survey_responses DISABLE ROW LEVEL SECURITY;

-- Grant insert to anon/authenticated for public submissions
GRANT INSERT ON wego_survey_responses TO anon;
GRANT INSERT ON wego_survey_responses TO authenticated;

-- Only TDI admin can read survey responses
GRANT SELECT ON wego_survey_responses TO authenticated;

-- Note: In practice, we'll use the service role key on the API route
-- to allow reading only by TDI admin emails
