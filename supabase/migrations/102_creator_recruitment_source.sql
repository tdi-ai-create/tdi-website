-- Track recruitment source on creators for feedback loop analytics
ALTER TABLE creators ADD COLUMN IF NOT EXISTS recruitment_source text;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS recruitment_candidate_id uuid REFERENCES creator_recruitment_candidates(id) ON DELETE SET NULL;
