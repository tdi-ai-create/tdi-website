-- Migration 015: Add dashboard data columns to partnerships table
-- For CCP: ADMIN DETAIL PAGE - MATCH LEGACY DASHBOARD + ADD EDIT LAYER
-- March 2026

-- Add service usage tracking columns
ALTER TABLE partnerships
ADD COLUMN IF NOT EXISTS observation_days_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS virtual_sessions_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS executive_sessions_used INTEGER DEFAULT 0;

-- Add staff and engagement tracking
ALTER TABLE partnerships
ADD COLUMN IF NOT EXISTS staff_enrolled INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hub_login_pct DECIMAL DEFAULT 0;

-- Add momentum indicator
ALTER TABLE partnerships
ADD COLUMN IF NOT EXISTS momentum_status TEXT DEFAULT 'Building',
ADD COLUMN IF NOT EXISTS momentum_detail TEXT;

-- Add investment metrics
ALTER TABLE partnerships
ADD COLUMN IF NOT EXISTS cost_per_educator DECIMAL,
ADD COLUMN IF NOT EXISTS love_notes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS high_engagement_pct DECIMAL DEFAULT 0;

-- Add data tracking timestamp
ALTER TABLE partnerships
ADD COLUMN IF NOT EXISTS data_updated_at TIMESTAMPTZ DEFAULT now();

-- Add comments for documentation
COMMENT ON COLUMN partnerships.observation_days_used IS 'Number of observation days completed';
COMMENT ON COLUMN partnerships.virtual_sessions_used IS 'Number of virtual sessions completed';
COMMENT ON COLUMN partnerships.executive_sessions_used IS 'Number of executive sessions completed';
COMMENT ON COLUMN partnerships.staff_enrolled IS 'Total staff/educators enrolled in partnership';
COMMENT ON COLUMN partnerships.hub_login_pct IS 'Percentage of staff who have logged into Hub';
COMMENT ON COLUMN partnerships.momentum_status IS 'Partnership health: Strong, Building, or Needs Attention';
COMMENT ON COLUMN partnerships.momentum_detail IS 'Detailed momentum status text shown on dashboard';
COMMENT ON COLUMN partnerships.cost_per_educator IS 'Investment per educator calculation';
COMMENT ON COLUMN partnerships.love_notes_count IS 'Total personalized Love Notes delivered';
COMMENT ON COLUMN partnerships.high_engagement_pct IS 'Percentage of educators showing high Hub engagement';
COMMENT ON COLUMN partnerships.data_updated_at IS 'When dashboard data was last updated';

-- Create timeline_events table if not exists
CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  event_title TEXT NOT NULL,
  event_date DATE,
  event_type TEXT CHECK (event_type IN ('milestone', 'observation', 'coaching', 'virtual_session', 'executive_session', 'other')),
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('completed', 'in_progress', 'upcoming')),
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for timeline lookups
CREATE INDEX IF NOT EXISTS idx_timeline_events_partnership ON timeline_events(partnership_id, status, event_date);

-- Enable RLS on timeline_events
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- TDI admin full access to timeline_events
CREATE POLICY IF NOT EXISTS "TDI admin full access timeline_events" ON timeline_events FOR ALL
  USING (auth.jwt() ->> 'email' LIKE '%@teachersdeserveit.com');

-- Partners can view their own timeline events
CREATE POLICY IF NOT EXISTS "Partners view own timeline_events" ON timeline_events FOR SELECT
  USING (partnership_id IN (SELECT partnership_id FROM partnership_users WHERE user_id = auth.uid()));
