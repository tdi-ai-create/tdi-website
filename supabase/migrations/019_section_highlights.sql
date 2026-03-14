-- Migration 019: Section Highlights
-- Allows TDI admins to add callouts, NEW badges, and pinned highlights to dashboard sections

CREATE TABLE IF NOT EXISTS section_highlights (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID        REFERENCES partnerships(id) ON DELETE CASCADE,
  section_key    TEXT        NOT NULL,
  highlight_type TEXT        NOT NULL CHECK (highlight_type IN ('callout', 'new_badge', 'pinned')),
  callout_text   TEXT,
  callout_style  TEXT        DEFAULT 'info' CHECK (callout_style IN ('info', 'success', 'celebration', 'action')),
  is_active      BOOLEAN     DEFAULT true,
  created_by     TEXT        NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT now(),
  expires_at     TIMESTAMPTZ,
  UNIQUE(partnership_id, section_key, highlight_type)
);

-- Enable RLS
ALTER TABLE section_highlights ENABLE ROW LEVEL SECURITY;

-- Service role can manage everything
CREATE POLICY "Service role full access on section_highlights"
  ON section_highlights
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_section_highlights_partnership
  ON section_highlights(partnership_id, is_active);
