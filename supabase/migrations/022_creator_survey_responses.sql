-- Creator Survey Responses table
-- Run this SQL in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS creator_survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES creators(id) ON DELETE SET NULL,
  name TEXT,
  email TEXT,
  content_path TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),

  -- Section 1: Getting Started
  q1_referral TEXT,
  q1_clarity_score INTEGER,
  q1_clarity_followup TEXT,
  q1_reason TEXT,

  -- Section 2: Onboarding and the Portal
  q2_portal_clarity_score INTEGER,
  q2_portal_clarity_followup TEXT,
  q2_stuck BOOLEAN,
  q2_stuck_detail TEXT,
  q2_support_score INTEGER,
  q2_support_followup TEXT,
  q2_improvement TEXT,

  -- Section 3: The Creation Process
  q3_workload_score INTEGER,
  q3_workload_followup TEXT,
  q3_hard_stage TEXT,
  q3_production_score INTEGER,
  q3_production_followup TEXT,
  q3_feedback_score INTEGER,
  q3_feedback_followup TEXT,

  -- Section 4: Compensation and Expectations
  q4_comp_clarity_score INTEGER,
  q4_comp_clarity_followup TEXT,
  q4_revshare_clear TEXT,
  q4_revshare_clear_followup TEXT,
  q4_revshare_fair_score INTEGER,
  q4_revshare_fair_followup TEXT,
  q4_payment_score INTEGER,
  q4_payment_followup TEXT,

  -- Section 5: Communication and Team Responsiveness
  q5_responsiveness_score INTEGER,
  q5_responsiveness_followup TEXT,
  q5_comms_channel TEXT,
  q5_fell_through BOOLEAN,
  q5_fell_through_detail TEXT,

  -- Section 6: Overall Experience and Future
  q6_overall_score INTEGER,
  q6_overall_followup TEXT,
  q6_return_score INTEGER,
  q6_return_followup TEXT,
  q6_nps INTEGER,
  q6_nps_followup TEXT,
  q6_open_feedback TEXT
);

-- Enable RLS
ALTER TABLE creator_survey_responses ENABLE ROW LEVEL SECURITY;

-- Policy for inserting (anonymous submissions allowed)
CREATE POLICY "Allow anonymous survey submissions" ON creator_survey_responses
  FOR INSERT WITH CHECK (true);

-- Policy for admin reading
CREATE POLICY "Allow authenticated users to read surveys" ON creator_survey_responses
  FOR SELECT USING (true);

-- Grant permissions
GRANT INSERT ON creator_survey_responses TO anon;
GRANT INSERT ON creator_survey_responses TO authenticated;
GRANT SELECT ON creator_survey_responses TO authenticated;

-- Create index for faster lookups
CREATE INDEX idx_creator_survey_responses_creator_id ON creator_survey_responses(creator_id);
CREATE INDEX idx_creator_survey_responses_submitted_at ON creator_survey_responses(submitted_at DESC);
