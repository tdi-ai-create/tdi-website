-- Q&A feature: community questions and replies for courses, quick wins, and lessons
CREATE TABLE IF NOT EXISTS hub_qa_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  parent_id UUID REFERENCES hub_qa_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  body TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT chk_content_type CHECK (content_type IN ('lesson', 'course', 'quick_win'))
);

CREATE INDEX IF NOT EXISTS idx_hub_qa_posts_content ON hub_qa_posts(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_hub_qa_posts_parent ON hub_qa_posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_hub_qa_posts_created ON hub_qa_posts(created_at DESC);

-- RLS
ALTER TABLE hub_qa_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view qa posts" ON hub_qa_posts;
CREATE POLICY "Anyone can view qa posts"
  ON hub_qa_posts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert qa posts" ON hub_qa_posts;
CREATE POLICY "Authenticated users can insert qa posts"
  ON hub_qa_posts FOR INSERT
  WITH CHECK (true);
