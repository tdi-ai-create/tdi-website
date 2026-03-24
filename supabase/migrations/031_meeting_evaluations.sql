-- Meeting Evaluations: AI-powered meeting transcript analysis
-- Phase 8: Meeting AI Evaluation

CREATE TABLE IF NOT EXISTS meeting_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES district_meetings(id) ON DELETE CASCADE,
  district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
  evaluated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Overall scores (1-10 scale)
  overall_score INT CHECK (overall_score >= 1 AND overall_score <= 10),

  -- 7 Dimension Scores (1-10 scale)
  relationship_score INT CHECK (relationship_score >= 1 AND relationship_score <= 10),
  value_demonstration_score INT CHECK (value_demonstration_score >= 1 AND value_demonstration_score <= 10),
  next_steps_score INT CHECK (next_steps_score >= 1 AND next_steps_score <= 10),
  stakeholder_engagement_score INT CHECK (stakeholder_engagement_score >= 1 AND stakeholder_engagement_score <= 10),
  objection_handling_score INT CHECK (objection_handling_score >= 1 AND objection_handling_score <= 10),
  expansion_signals_score INT CHECK (expansion_signals_score >= 1 AND expansion_signals_score <= 10),
  risk_indicators_score INT CHECK (risk_indicators_score >= 1 AND risk_indicators_score <= 10),

  -- Dimension feedback text
  relationship_feedback TEXT,
  value_demonstration_feedback TEXT,
  next_steps_feedback TEXT,
  stakeholder_engagement_feedback TEXT,
  objection_handling_feedback TEXT,
  expansion_signals_feedback TEXT,
  risk_indicators_feedback TEXT,

  -- Dimension quotes from transcript
  relationship_quotes JSONB DEFAULT '[]',
  value_demonstration_quotes JSONB DEFAULT '[]',
  next_steps_quotes JSONB DEFAULT '[]',
  stakeholder_engagement_quotes JSONB DEFAULT '[]',
  objection_handling_quotes JSONB DEFAULT '[]',
  expansion_signals_quotes JSONB DEFAULT '[]',
  risk_indicators_quotes JSONB DEFAULT '[]',

  -- Summary fields
  executive_summary TEXT,
  key_wins JSONB DEFAULT '[]',
  areas_for_improvement JSONB DEFAULT '[]',
  action_items JSONB DEFAULT '[]',
  renewal_likelihood TEXT, -- 'high', 'medium', 'low', 'at_risk'

  -- Metadata
  transcript_word_count INT,
  model_used TEXT DEFAULT 'claude-sonnet-4-20250514',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_meeting_evaluations_meeting_id ON meeting_evaluations(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_evaluations_district_id ON meeting_evaluations(district_id);

-- RLS policies
ALTER TABLE meeting_evaluations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (internal admin tool)
CREATE POLICY "Allow authenticated users full access to meeting_evaluations"
ON meeting_evaluations FOR ALL TO authenticated
USING (true) WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Allow service role full access to meeting_evaluations"
ON meeting_evaluations FOR ALL TO service_role
USING (true) WITH CHECK (true);
