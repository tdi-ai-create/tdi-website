-- Creator Milestone Feedback Portal
-- Adds feedback loop: creators submit work, Anne Marie drafts feedback, Bella approves

-- New table: creator_milestone_feedback
CREATE TABLE IF NOT EXISTS creator_milestone_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_record_id uuid NOT NULL REFERENCES creator_milestones(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  submission_version integer NOT NULL DEFAULT 1,
  submitted_value text,
  submission_notes text,
  submitted_at timestamptz DEFAULT now(),
  feedback_content text,
  feedback_drafted_by text, -- 'anne-marie' or null for direct human feedback
  feedback_draft_status text CHECK (feedback_draft_status IN ('pending_review', 'approved', 'rejected')),
  feedback_approved_by text,
  feedback_approved_at timestamptz,
  visible_to_creator boolean NOT NULL DEFAULT false,
  call_requested boolean NOT NULL DEFAULT false,
  call_requested_at timestamptz,
  call_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_cmf_milestone_record_id ON creator_milestone_feedback(milestone_record_id);
CREATE INDEX idx_cmf_creator_id ON creator_milestone_feedback(creator_id);
CREATE INDEX idx_cmf_draft_status ON creator_milestone_feedback(feedback_draft_status);
CREATE INDEX idx_cmf_visible ON creator_milestone_feedback(visible_to_creator);

-- Add review_status and submission_notes to creator_milestones
ALTER TABLE creator_milestones
  ADD COLUMN IF NOT EXISTS review_status text
  CHECK (review_status IS NULL OR review_status IN ('submitted', 'under_review', 'feedback_ready', 'revised', 'approved'));

ALTER TABLE creator_milestones
  ADD COLUMN IF NOT EXISTS submission_notes text;

-- RLS policies
ALTER TABLE creator_milestone_feedback ENABLE ROW LEVEL SECURITY;

-- Service role: full access (implicit via service_role key bypass)

-- Authenticated users: can read own feedback where visible_to_creator = true
CREATE POLICY "Creators can view their own visible feedback"
  ON creator_milestone_feedback
  FOR SELECT
  TO authenticated
  USING (
    visible_to_creator = true
    AND creator_id IN (
      SELECT id FROM creators WHERE email = auth.email()
    )
  );

-- Public: no access (default with RLS enabled and no public policy)

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_creator_milestone_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_creator_milestone_feedback_updated_at
  BEFORE UPDATE ON creator_milestone_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_creator_milestone_feedback_updated_at();
