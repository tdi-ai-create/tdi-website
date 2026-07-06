-- Creator Re-engagement Sequences
-- Tracks automated email sequences for creators who stall (15+ days inactive)
-- State machine: step 0 (check-in) → steps 1-5 (weekly nudges) → step 6 (pause notice) → auto-pause

CREATE TABLE IF NOT EXISTS creator_reengagement_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_step INT NOT NULL DEFAULT 0,
  last_email_sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  cancelled_at TIMESTAMPTZ,
  cancelled_reason TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups: active sequences per creator
CREATE INDEX idx_reengagement_creator_status ON creator_reengagement_sequences(creator_id, status);

-- Index for cron job: find all active sequences efficiently
CREATE INDEX idx_reengagement_active ON creator_reengagement_sequences(status) WHERE status = 'active';

-- Only one active sequence per creator at a time
CREATE UNIQUE INDEX idx_reengagement_one_active_per_creator
  ON creator_reengagement_sequences(creator_id)
  WHERE status = 'active';

-- Enable RLS
ALTER TABLE creator_reengagement_sequences ENABLE ROW LEVEL SECURITY;

-- Admin-only access (service role bypasses RLS)
CREATE POLICY "Admin access to reengagement sequences"
  ON creator_reengagement_sequences
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );
