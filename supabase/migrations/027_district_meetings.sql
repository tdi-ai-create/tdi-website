-- ============================================================
-- Migration 027: District Meetings + Decision Log
-- Part of Intelligence Hub Phase 5
-- ============================================================

-- District Meetings table
-- Tracks exec impact reviews, renewal conversations, check-ins, board presentations
CREATE TABLE IF NOT EXISTS district_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  meeting_type TEXT CHECK (meeting_type IN (
    'exec_impact', 'renewal', 'check_in', 'board_presentation'
  )) NOT NULL,
  meeting_date DATE NOT NULL,
  attendees_json JSONB DEFAULT '[]',
  summary TEXT,
  score INTEGER CHECK (score >= 0 AND score <= 10),
  follow_up_notes TEXT,
  next_meeting_date DATE,
  logged_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Decision Log table (JSONB array inside meetings or separate - going with separate for flexibility)
CREATE TABLE IF NOT EXISTS district_decision_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES district_meetings(id) ON DELETE SET NULL,
  decision_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT CHECK (category IN (
    'renewal', 'scope_change', 'pricing', 'scheduling', 'escalation', 'other'
  )) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  decided_by TEXT,
  outcome TEXT CHECK (outcome IN ('approved', 'rejected', 'pending', 'deferred')),
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_district_meetings_district
  ON district_meetings(district_id);
CREATE INDEX IF NOT EXISTS idx_district_meetings_date
  ON district_meetings(meeting_date DESC);
CREATE INDEX IF NOT EXISTS idx_district_meetings_type
  ON district_meetings(meeting_type);

CREATE INDEX IF NOT EXISTS idx_district_decision_log_district
  ON district_decision_log(district_id);
CREATE INDEX IF NOT EXISTS idx_district_decision_log_meeting
  ON district_decision_log(meeting_id);
CREATE INDEX IF NOT EXISTS idx_district_decision_log_date
  ON district_decision_log(decision_date DESC);

-- RLS Policies
ALTER TABLE district_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE district_decision_log ENABLE ROW LEVEL SECURITY;

-- Admin users can do everything
CREATE POLICY "Admin full access to district_meetings"
  ON district_meetings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin full access to district_decision_log"
  ON district_decision_log FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_district_meetings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_district_meetings_timestamp
  BEFORE UPDATE ON district_meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_district_meetings_timestamp();

CREATE TRIGGER set_district_decision_log_timestamp
  BEFORE UPDATE ON district_decision_log
  FOR EACH ROW
  EXECUTE FUNCTION update_district_meetings_timestamp();

-- ============================================================
-- Comments for documentation
-- ============================================================
COMMENT ON TABLE district_meetings IS 'Tracks meetings with district stakeholders - exec impact reviews, renewal conversations, check-ins, board presentations';
COMMENT ON TABLE district_decision_log IS 'Log of key decisions made regarding district partnerships';

COMMENT ON COLUMN district_meetings.meeting_type IS 'exec_impact = Executive Impact Review, renewal = Renewal Conversation, check_in = Regular Check-in, board_presentation = Board Presentation';
COMMENT ON COLUMN district_meetings.score IS 'Meeting sentiment/outcome score 0-10 (10 = excellent)';
COMMENT ON COLUMN district_meetings.attendees_json IS 'Array of attendee objects: [{name, role, email?}]';

COMMENT ON COLUMN district_decision_log.category IS 'Type of decision: renewal, scope_change, pricing, scheduling, escalation, other';
COMMENT ON COLUMN district_decision_log.outcome IS 'Result: approved, rejected, pending, deferred';
