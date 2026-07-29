-- Migration 107: Partnership Semester Data
-- Stores semester-specific snapshots for partner dashboard history toggle

CREATE TABLE IF NOT EXISTS partnership_semester_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID NOT NULL REFERENCES partnerships(id) ON DELETE CASCADE,
  semester TEXT NOT NULL, -- e.g. 'spring-2026', 'fall-2026'
  semester_label TEXT NOT NULL, -- e.g. 'Spring 2026', 'Fall 2026'
  is_current BOOLEAN DEFAULT false,
  metrics JSONB DEFAULT '{}',
  highlights JSONB DEFAULT '[]',
  observation_notes JSONB DEFAULT '[]',
  para_quotes JSONB DEFAULT '[]',
  building_data JSONB DEFAULT '[]',
  timeline_events JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (partnership_id, semester)
);

-- Index for fast lookups by partnership
CREATE INDEX IF NOT EXISTS idx_partnership_semester_data_partnership_id
  ON partnership_semester_data (partnership_id);

-- Index for current semester lookup
CREATE INDEX IF NOT EXISTS idx_partnership_semester_data_current
  ON partnership_semester_data (partnership_id, is_current)
  WHERE is_current = true;

-- RLS: partners can read their own semester data
ALTER TABLE partnership_semester_data ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read semester data (partnership-level access is enforced by API)
CREATE POLICY "partners_read_semester_data"
  ON partnership_semester_data
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can insert/update/delete
CREATE POLICY "service_manage_semester_data"
  ON partnership_semester_data
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_partnership_semester_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_partnership_semester_data_updated_at
  BEFORE UPDATE ON partnership_semester_data
  FOR EACH ROW
  EXECUTE FUNCTION update_partnership_semester_data_updated_at();
