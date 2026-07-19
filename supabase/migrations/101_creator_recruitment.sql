-- Creator Recruitment System Phase 1
-- Tracks content gaps, recruitment pipeline candidates, and activity notes

-- ─── Table 1: creator_content_gaps ───
CREATE TABLE IF NOT EXISTS creator_content_gaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  demand_signal text,
  hub_course_count integer DEFAULT 0,
  hub_quick_win_count integer DEFAULT 0,
  active_creator_count integer DEFAULT 0,
  sales_mentions integer DEFAULT 0,
  recommended_content_path text CHECK (recommended_content_path IS NULL OR recommended_content_path IN ('course', 'download', 'blog')),
  notes text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'filled', 'monitoring')),
  identified_by text DEFAULT 'anne-marie',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Table 2: creator_recruitment_candidates ───
CREATE TABLE IF NOT EXISTS creator_recruitment_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  school_org text,
  role text,
  expertise_area text,
  gap_id uuid REFERENCES creator_content_gaps(id) ON DELETE SET NULL,
  content_path text CHECK (content_path IS NULL OR content_path IN ('course', 'download', 'blog')),
  source text CHECK (source IS NULL OR source IN ('hub_user', 'substack', 'social_media', 'sales_nomination', 'referral', 'inbound', 'other')),
  source_detail text,
  why_good_fit text,
  social_url text,
  hub_user_id uuid,
  evaluation_status text CHECK (evaluation_status IS NULL OR evaluation_status IN ('not_started', 'sent', 'received', 'passed', 'failed')) DEFAULT 'not_started',
  evaluation_submission text,
  evaluation_notes text,
  stage text NOT NULL DEFAULT 'suggested' CHECK (stage IN ('suggested', 'outreach_approved', 'outreach_sent', 'interested', 'evaluation', 'call_scheduled', 'committed', 'revisit', 'declined', 'no_response', 'archived')),
  outreach_draft text,
  outreach_drafted_by text DEFAULT 'anne-marie',
  outreach_approved_by text,
  outreach_sent_at timestamptz,
  outreach_follow_up_1_at timestamptz,
  outreach_follow_up_2_at timestamptz,
  response_received_at timestamptz,
  response_notes text,
  call_scheduled_at timestamptz,
  call_notes text,
  revisit_date date,
  revisit_reason text,
  declined_reason text,
  converted_creator_id uuid REFERENCES creators(id) ON DELETE SET NULL,
  nominated_by text,
  nominated_from text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Table 3: creator_recruitment_notes ───
CREATE TABLE IF NOT EXISTS creator_recruitment_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES creator_recruitment_candidates(id) ON DELETE CASCADE,
  content text NOT NULL,
  author text NOT NULL,
  note_type text DEFAULT 'note' CHECK (note_type IN ('note', 'outreach_sent', 'follow_up', 'response', 'call_log', 'evaluation', 'stage_change', 'system')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Indexes ───
CREATE INDEX idx_recruitment_candidates_stage ON creator_recruitment_candidates(stage);
CREATE INDEX idx_recruitment_candidates_gap_id ON creator_recruitment_candidates(gap_id);
CREATE INDEX idx_recruitment_candidates_source ON creator_recruitment_candidates(source);
CREATE INDEX idx_recruitment_candidates_email ON creator_recruitment_candidates(email);
CREATE INDEX idx_recruitment_notes_candidate_id ON creator_recruitment_notes(candidate_id);
CREATE INDEX idx_content_gaps_priority ON creator_content_gaps(priority);
CREATE INDEX idx_content_gaps_status ON creator_content_gaps(status);

-- ─── RLS ───
ALTER TABLE creator_content_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_recruitment_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_recruitment_notes ENABLE ROW LEVEL SECURITY;

-- No public access policies -- service role bypasses RLS implicitly

-- ─── Updated_at triggers ───
CREATE OR REPLACE FUNCTION update_creator_content_gaps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_creator_content_gaps_updated_at
  BEFORE UPDATE ON creator_content_gaps
  FOR EACH ROW
  EXECUTE FUNCTION update_creator_content_gaps_updated_at();

CREATE OR REPLACE FUNCTION update_creator_recruitment_candidates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_creator_recruitment_candidates_updated_at
  BEFORE UPDATE ON creator_recruitment_candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_creator_recruitment_candidates_updated_at();
