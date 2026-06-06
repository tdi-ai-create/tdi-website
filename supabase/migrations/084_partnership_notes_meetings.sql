-- Migration 084: Partnership notes and meetings for internal operations
-- These power the "Internal" tab on the Leadership partnership detail page

-- Internal notes per partnership (TDI team only by default)
CREATE TABLE IF NOT EXISTS partnership_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'strategy', 'concern', 'win', 'follow_up')),
  visible_to_partner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partnership_notes_partnership
ON partnership_notes(partnership_id, created_at DESC);

-- Meeting logs per partnership
CREATE TABLE IF NOT EXISTS partnership_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  meeting_date TIMESTAMPTZ NOT NULL,
  meeting_type TEXT DEFAULT 'check_in' CHECK (meeting_type IN ('check_in', 'onboarding', 'observation_debrief', 'renewal', 'strategy', 'escalation', 'other')),
  attendees TEXT,
  summary TEXT,
  action_items TEXT,
  logged_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partnership_meetings_partnership
ON partnership_meetings(partnership_id, meeting_date DESC);

-- RLS policies
ALTER TABLE partnership_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_meetings ENABLE ROW LEVEL SECURITY;

-- TDI admin full access
CREATE POLICY "TDI admin full access partnership_notes" ON partnership_notes FOR ALL
  USING (TRUE);

CREATE POLICY "TDI admin full access partnership_meetings" ON partnership_meetings FOR ALL
  USING (TRUE);
