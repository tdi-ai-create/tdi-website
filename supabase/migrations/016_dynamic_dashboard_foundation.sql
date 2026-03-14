-- ============================================================
-- MIGRATION 016: Dynamic Dashboard Foundation
-- March 2026
-- Adds columns and tables required for the master dashboard
-- template system described in TDI-DYNAMIC-DASHBOARD-SYSTEM-SPEC.md
-- Builds on migration 015 which added basic dashboard columns
-- ============================================================

-- PART 1: ADDITIONAL COLUMNS ON partnerships TABLE
-- Only adds columns not already present from migration 015

ALTER TABLE partnerships
ADD COLUMN IF NOT EXISTS partnership_goal             TEXT,
ADD COLUMN IF NOT EXISTS teacher_stress_score         DECIMAL(4,2),
ADD COLUMN IF NOT EXISTS strategy_implementation_pct  DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS retention_intent_score       DECIMAL(4,2),
ADD COLUMN IF NOT EXISTS next_steps_notes             TEXT,
ADD COLUMN IF NOT EXISTS year2_planning_notes         TEXT,
ADD COLUMN IF NOT EXISTS per_educator_value_note      TEXT;

-- Update momentum_status constraint if it doesn't have CHECK
-- Note: IF NOT EXISTS not supported for constraints, so this is idempotent via DO block
DO $$
BEGIN
  -- Add check constraint if not exists (safe to fail if exists)
  BEGIN
    ALTER TABLE partnerships
    ADD CONSTRAINT partnerships_momentum_status_check
    CHECK (momentum_status IN ('Strong', 'Building', 'Needs Attention'));
  EXCEPTION WHEN duplicate_object THEN
    NULL; -- Constraint already exists, ignore
  END;
END $$;

-- PART 2: dashboard_defaults TABLE
-- Stores TDI benchmark values used as example data
-- when a school's real data hasn't been entered yet

CREATE TABLE IF NOT EXISTS dashboard_defaults (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name   TEXT        NOT NULL UNIQUE,
  example_value TEXT        NOT NULL,
  example_label TEXT,
  data_source   TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for this table - it's read-only reference data
ALTER TABLE dashboard_defaults ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist, then recreate
DROP POLICY IF EXISTS "Anyone authenticated can read dashboard defaults" ON dashboard_defaults;
DROP POLICY IF EXISTS "Only TDI admins can modify dashboard defaults" ON dashboard_defaults;

CREATE POLICY "Anyone authenticated can read dashboard defaults"
  ON dashboard_defaults FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only TDI admins can modify dashboard defaults"
  ON dashboard_defaults FOR ALL
  USING (auth.email() LIKE '%@teachersdeserveit.com')
  WITH CHECK (auth.email() LIKE '%@teachersdeserveit.com');

-- Seed with TDI benchmark values
INSERT INTO dashboard_defaults (metric_name, example_value, example_label, data_source)
VALUES
  ('hub_login_pct',               '87',
   '87% hub login rate',
   'TDI partner average'),

  ('staff_enrolled',              '42',
   '42 educators enrolled',
   'TDI partner average'),

  ('love_notes_count',            '127',
   '127 Love Notes delivered',
   'TDI partner average'),

  ('high_engagement_pct',         '65',
   '65% high engagement',
   'TDI 65% vs 10% industry average'),

  ('cost_per_educator',           '892',
   '$892 per educator',
   'TDI average investment'),

  ('teacher_stress',              '6.0',
   '6.0/10 stress score (vs 8-9 industry avg)',
   'TDI partner surveys - RAND 2025, Learning Policy Institute'),

  ('strategy_implementation',     '65',
   '65% implementation rate (vs 10% industry avg)',
   'TDI partner surveys'),

  ('retention_intent',            '7.2',
   '7.2/10 retention intent (vs 2-4 industry avg)',
   'TDI partner surveys'),

  ('momentum_status',             'Building',
   'Partnership building momentum',
   'TDI default for new partnerships'),

  ('momentum_detail',             'Your partnership is getting started. These details will update as we work together.',
   'Default momentum detail',
   'TDI default'),

  ('observation_days_used',       '0',
   '0 observation days completed',
   'Default'),

  ('virtual_sessions_used',       '0',
   '0 virtual sessions completed',
   'Default'),

  ('executive_sessions_used',     '0',
   '0 executive sessions completed',
   'Default'),

  ('deliverables_pct',            '73',
   '73% deliverables complete',
   'TDI partner average mid-year'),

  ('per_educator_value_note',     'per educator - obs days, coaching, Hub + weekly subgroups',
   'Value breakdown note',
   'TDI default')

ON CONFLICT (metric_name) DO NOTHING;

-- PART 3: ADDITIONAL timeline_events COLUMNS
-- Add if not present from migration 015

ALTER TABLE timeline_events
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- PART 4: DEFAULT TIMELINE EVENTS FUNCTION
-- Auto-creates starter timeline events when a partnership
-- is first activated. Call this from the app when status
-- changes to 'active'.

CREATE OR REPLACE FUNCTION create_default_timeline_events(p_partnership_id UUID)
RETURNS void AS $$
BEGIN
  -- Only create if no events exist yet
  IF NOT EXISTS (
    SELECT 1 FROM timeline_events WHERE partnership_id = p_partnership_id
  ) THEN
    INSERT INTO timeline_events (partnership_id, event_title, event_type, status, sort_order)
    VALUES
      (p_partnership_id, 'Partnership launched', 'milestone', 'completed', 1),
      (p_partnership_id, 'Staff onboarding to Learning Hub', 'milestone', 'in_progress', 2),
      (p_partnership_id, 'First Observation Day - date TBD', 'observation', 'upcoming', 3);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PART 5: DEFAULT ACTION ITEMS FUNCTION
-- Auto-creates starter action items when a partnership activates

CREATE OR REPLACE FUNCTION create_default_action_items(p_partnership_id UUID)
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM action_items WHERE partnership_id = p_partnership_id
  ) THEN
    INSERT INTO action_items (partnership_id, title, category, priority, status, sort_order)
    VALUES
      (p_partnership_id,
       'Complete staff onboarding to Learning Hub',
       'onboarding', 'high', 'pending', 1),

      (p_partnership_id,
       'Confirm observation day schedule with TDI team',
       'scheduling', 'high', 'pending', 2),

      (p_partnership_id,
       'Schedule Year 1 Celebration + Year 2 Planning',
       'scheduling', 'medium', 'pending', 3),

      (p_partnership_id,
       'Virtual sessions 4-6 content preparation',
       'onboarding', 'high', 'pending', 4),

      (p_partnership_id,
       'Weekly subgroup facilitation ongoing',
       'engagement', 'high', 'in_progress', 5);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PART 6: INDEXES FOR DASHBOARD QUERIES
-- Ensure fast lookups for dashboard data fetching

CREATE INDEX IF NOT EXISTS idx_partnerships_slug
  ON partnerships(slug);

CREATE INDEX IF NOT EXISTS idx_partnerships_status
  ON partnerships(status);

CREATE INDEX IF NOT EXISTS idx_timeline_events_partnership_id
  ON timeline_events(partnership_id);

CREATE INDEX IF NOT EXISTS idx_timeline_events_partnership_status
  ON timeline_events(partnership_id, status);

CREATE INDEX IF NOT EXISTS idx_action_items_partnership
  ON action_items(partnership_id, status);

-- Check if metric_snapshots table exists before creating index
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'metric_snapshots'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_metric_snapshots_partnership
      ON metric_snapshots(partnership_id, metric_name, snapshot_date DESC)';
  END IF;
END $$;

-- PART 7: UPDATE EXISTING PARTNERSHIPS
-- Set momentum_status default for already-seeded partnerships

UPDATE partnerships
SET momentum_status = 'Building',
    data_updated_at = now()
WHERE momentum_status IS NULL
  AND status = 'active';

-- Call default timeline events for any active partnership
-- that has no timeline events yet
DO $$
DECLARE
  p_record RECORD;
BEGIN
  FOR p_record IN
    SELECT p.id
    FROM partnerships p
    WHERE p.status = 'active'
    AND NOT EXISTS (
      SELECT 1 FROM timeline_events t WHERE t.partnership_id = p.id
    )
  LOOP
    PERFORM create_default_timeline_events(p_record.id);
  END LOOP;
END $$;

-- Same for action items
DO $$
DECLARE
  p_record RECORD;
BEGIN
  FOR p_record IN
    SELECT p.id
    FROM partnerships p
    WHERE p.status = 'active'
    AND NOT EXISTS (
      SELECT 1 FROM action_items a WHERE a.partnership_id = p.id
    )
  LOOP
    PERFORM create_default_action_items(p_record.id);
  END LOOP;
END $$;

-- Comments for documentation
COMMENT ON TABLE dashboard_defaults IS 'TDI benchmark values used as example data when real data not yet entered';
COMMENT ON COLUMN partnerships.partnership_goal IS 'Main partnership goal/objective';
COMMENT ON COLUMN partnerships.teacher_stress_score IS 'Teacher stress level from surveys (0-10 scale)';
COMMENT ON COLUMN partnerships.strategy_implementation_pct IS 'Strategy implementation percentage from surveys';
COMMENT ON COLUMN partnerships.retention_intent_score IS 'Teacher retention intent from surveys (0-10 scale)';
COMMENT ON COLUMN partnerships.next_steps_notes IS 'Next steps notes for admin tracking';
COMMENT ON COLUMN partnerships.year2_planning_notes IS 'Year 2 planning notes for renewal tracking';
COMMENT ON COLUMN partnerships.per_educator_value_note IS 'Custom value breakdown note for dashboard';
