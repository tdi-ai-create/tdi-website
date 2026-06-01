-- Migration 071: Community Engagement Features
-- Adds: Q&A helpful votes, post reports, community notification preferences

-- ─── QA POST HELPFULS ──────────────────────────────────────────────────────
-- Tracks which users marked Q&A posts as helpful (one per user per post)

CREATE TABLE IF NOT EXISTS hub_qa_post_helpfuls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES hub_qa_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES hub_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE hub_qa_post_helpfuls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view qa helpfuls"
  ON hub_qa_post_helpfuls FOR SELECT USING (true);

CREATE POLICY "Users can mark qa helpful"
  ON hub_qa_post_helpfuls FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can unmark qa helpful"
  ON hub_qa_post_helpfuls FOR DELETE USING (true);

-- ─── COMMUNITY REPORTS ─────────────────────────────────────────────────────
-- Tracks user reports on community posts (Q&A or Conversation)

CREATE TABLE IF NOT EXISTS hub_community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES hub_profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- 'qa_post' or 'conversation_post'
  content_id UUID NOT NULL,
  reason TEXT, -- optional reason
  status TEXT NOT NULL DEFAULT 'pending', -- pending, reviewed, removed, dismissed
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES hub_profiles(id),
  UNIQUE(reporter_id, content_type, content_id)
);

ALTER TABLE hub_community_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON hub_community_reports FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own reports"
  ON hub_community_reports FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_community_reports_content
  ON hub_community_reports(content_type, content_id);

CREATE INDEX IF NOT EXISTS idx_community_reports_status
  ON hub_community_reports(status);

-- ─── ADD COMMUNITY NOTIFICATION PREFERENCE ─────────────────────────────────
-- Add column for community reply notifications (defaults to on)

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hub_notification_preferences') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hub_notification_preferences' AND column_name = 'community_replies') THEN
      ALTER TABLE hub_notification_preferences ADD COLUMN community_replies BOOLEAN DEFAULT true;
    END IF;
  END IF;
END $$;

COMMENT ON TABLE hub_qa_post_helpfuls IS 'Tracks helpful marks on Q&A posts. One mark per user per post.';
COMMENT ON TABLE hub_community_reports IS 'User reports on community posts for moderation. One report per user per content item.';
