-- CMO Dashboard Schema
-- Weekly marketing funnel metrics: Attract → Warm → Convert

-- ============================================================================
-- WEEKLY SNAPSHOT (top-line KPIs per week)
-- ============================================================================
CREATE TABLE IF NOT EXISTS cmo_weekly_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL UNIQUE,
  tiktok_views INTEGER DEFAULT 0,
  tiktok_followers INTEGER DEFAULT 0,
  substack_subscribers INTEGER DEFAULT 0,
  substack_paid_subscribers INTEGER DEFAULT 0,
  substack_arr_cents INTEGER DEFAULT 0,
  form_clicks INTEGER DEFAULT 0,
  applications_received INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- TIKTOK POSTS (per-post breakdown)
-- ============================================================================
CREATE TABLE IF NOT EXISTS cmo_tiktok_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL REFERENCES cmo_weekly_metrics(week_start) ON DELETE CASCADE,
  post_date DATE NOT NULL,
  topic TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  engagement_pct NUMERIC(5,2) DEFAULT 0,
  shares INTEGER DEFAULT 0,
  stage TEXT NOT NULL CHECK (stage IN ('attract', 'warm', 'mixed', 'off-topic')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SUBSTACK POSTS (per-post breakdown)
-- ============================================================================
CREATE TABLE IF NOT EXISTS cmo_substack_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL REFERENCES cmo_weekly_metrics(week_start) ON DELETE CASCADE,
  post_date DATE NOT NULL,
  title TEXT NOT NULL,
  is_paid BOOLEAN DEFAULT FALSE,
  new_subscribers INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  open_rate NUMERIC(5,2) DEFAULT 0,
  stage TEXT NOT NULL CHECK (stage IN ('attract', 'warm', 'convert')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- UTM LINK TRACKING (per-source weekly)
-- ============================================================================
CREATE TABLE IF NOT EXISTS cmo_utm_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL REFERENCES cmo_weekly_metrics(week_start) ON DELETE CASCADE,
  source TEXT NOT NULL,
  utm_link TEXT,
  clicks INTEGER DEFAULT 0,
  form_submissions INTEGER DEFAULT 0,
  dm_triggers INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(week_start, source)
);

-- ============================================================================
-- RAE'S BRIEF (strategic notes per week, one per column)
-- ============================================================================
CREATE TABLE IF NOT EXISTS cmo_rae_brief (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL REFERENCES cmo_weekly_metrics(week_start) ON DELETE CASCADE,
  column_type TEXT NOT NULL CHECK (column_type IN ('attract', 'warm', 'convert')),
  whats_working TEXT,
  make_more TEXT,
  format_to_use TEXT,
  drop_or_missing TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(week_start, column_type)
);

-- ============================================================================
-- SUBSCRIBER SOURCES (monthly breakdown)
-- ============================================================================
CREATE TABLE IF NOT EXISTS cmo_subscriber_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('direct', 'substack_network', 'search', 'social', 'email', 'import')),
  count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(month, source)
);

-- ============================================================================
-- PAID ARR GROWTH (monthly)
-- ============================================================================
CREATE TABLE IF NOT EXISTS cmo_paid_arr (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE NOT NULL UNIQUE,
  arr_cents INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_cmo_tiktok_week ON cmo_tiktok_posts(week_start);
CREATE INDEX IF NOT EXISTS idx_cmo_substack_week ON cmo_substack_posts(week_start);
CREATE INDEX IF NOT EXISTS idx_cmo_utm_week ON cmo_utm_tracking(week_start);
CREATE INDEX IF NOT EXISTS idx_cmo_brief_week ON cmo_rae_brief(week_start);
CREATE INDEX IF NOT EXISTS idx_cmo_sub_sources_month ON cmo_subscriber_sources(month);
