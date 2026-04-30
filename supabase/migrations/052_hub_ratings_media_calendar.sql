-- Migration 052: hub_course_ratings, hub_media_library, hub_content_calendar

-- ============================================================
-- HUB COURSE RATINGS
-- ============================================================
CREATE TABLE hub_course_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES hub_courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(course_id, user_id)
);

CREATE INDEX ON hub_course_ratings (course_id);
CREATE INDEX ON hub_course_ratings (user_id);
CREATE INDEX ON hub_course_ratings (created_at DESC);

ALTER TABLE hub_course_ratings ENABLE ROW LEVEL SECURITY;

-- Users can read all ratings (anonymous aggregate views are fine)
CREATE POLICY "ratings_select_all" ON hub_course_ratings
  FOR SELECT USING (true);

-- Users can insert/update their own rating
CREATE POLICY "ratings_insert_own" ON hub_course_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ratings_update_own" ON hub_course_ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- HUB MEDIA LIBRARY
-- ============================================================
CREATE TABLE hub_media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('video', 'image', 'pdf', 'audio', 'other')),
  mime_type TEXT,
  size_bytes BIGINT,
  tags TEXT[],
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON hub_media_library (media_type);
CREATE INDEX ON hub_media_library (created_at DESC);

ALTER TABLE hub_media_library ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read
CREATE POLICY "media_select_auth" ON hub_media_library
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins write — handled at API layer with service role key

-- ============================================================
-- HUB CONTENT CALENDAR
-- ============================================================
CREATE TABLE hub_content_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('course', 'quick-win', 'download', 'announcement', 'other')),
  content_id UUID,
  scheduled_date DATE NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON hub_content_calendar (scheduled_date);
CREATE INDEX ON hub_content_calendar (content_type);

ALTER TABLE hub_content_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "calendar_select_auth" ON hub_content_calendar
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Admin writes handled at API layer
