-- Community Tool Requests
-- Educators can request new Quick Win topics through the Hub.
-- Feeds into the Hub content creation pipeline (Dr. Jasmine Cole drafts, Julie Lynn QA, Rae approves).

CREATE TABLE IF NOT EXISTS hub_tool_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES hub_profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  roles TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'in_progress', 'published', 'declined')),
  admin_notes TEXT,
  published_quick_win_id UUID REFERENCES hub_quick_wins(id),
  upvote_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Track who upvoted which request (one per user per request)
CREATE TABLE IF NOT EXISTS hub_tool_request_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES hub_tool_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES hub_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(request_id, user_id)
);

-- RLS
ALTER TABLE hub_tool_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_tool_request_upvotes ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read requests
CREATE POLICY "hub_tool_requests_select" ON hub_tool_requests
  FOR SELECT USING (true);

-- Users can insert their own requests
CREATE POLICY "hub_tool_requests_insert" ON hub_tool_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Upvotes: anyone can read, users can insert their own
CREATE POLICY "hub_tool_request_upvotes_select" ON hub_tool_request_upvotes
  FOR SELECT USING (true);

CREATE POLICY "hub_tool_request_upvotes_insert" ON hub_tool_request_upvotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for sorting by popularity
CREATE INDEX idx_tool_requests_upvotes ON hub_tool_requests(upvote_count DESC, created_at DESC);
CREATE INDEX idx_tool_requests_status ON hub_tool_requests(status);
