-- Migration 072: Community Features
-- Adds: conversation replies, bookmarks, pinned posts

-- ─── CONVERSATION REPLIES ──────────────────────────────────────────────────
-- Add parent_id to lesson_responses for threaded replies

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lesson_responses' AND column_name = 'parent_id') THEN
    ALTER TABLE lesson_responses ADD COLUMN parent_id UUID REFERENCES lesson_responses(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_lesson_responses_parent_id ON lesson_responses(parent_id);
  END IF;
END $$;

-- ─── PINNED POSTS ──────────────────────────────────────────────────────────
-- Add pinning columns to lesson_responses and hub_qa_posts

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lesson_responses' AND column_name = 'is_pinned') THEN
    ALTER TABLE lesson_responses ADD COLUMN is_pinned BOOLEAN DEFAULT false;
    ALTER TABLE lesson_responses ADD COLUMN pinned_by UUID REFERENCES hub_profiles(id);
    ALTER TABLE lesson_responses ADD COLUMN pinned_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hub_qa_posts' AND column_name = 'is_pinned') THEN
    ALTER TABLE hub_qa_posts ADD COLUMN is_pinned BOOLEAN DEFAULT false;
    ALTER TABLE hub_qa_posts ADD COLUMN pinned_by UUID REFERENCES hub_profiles(id);
    ALTER TABLE hub_qa_posts ADD COLUMN pinned_at TIMESTAMPTZ;
  END IF;
END $$;

-- ─── BOOKMARKS ─────────────────────────────────────────────────────────────
-- Users can bookmark Q&A posts, conversation posts, quick wins, courses, lessons

CREATE TABLE IF NOT EXISTS hub_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES hub_profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- 'qa_post', 'conversation_post', 'quick_win', 'course', 'lesson'
  content_id TEXT NOT NULL, -- UUID or slug
  title TEXT, -- cached title for display
  context_label TEXT, -- e.g. "Lesson Flow Checklist > Q&A"
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

ALTER TABLE hub_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" ON hub_bookmarks FOR SELECT USING (true);
CREATE POLICY "Users can create bookmarks" ON hub_bookmarks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete own bookmarks" ON hub_bookmarks FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON hub_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_content ON hub_bookmarks(content_type, content_id);

COMMENT ON TABLE hub_bookmarks IS 'User bookmarks for saving community posts, courses, quick wins, and lessons.';
