-- Polaroid vision board: 3 personal photos on the dashboard
-- Slots: 'love' (something you love), 'proud' (something you're proud of), 'goal' (a goal in life)

CREATE TABLE IF NOT EXISTS hub_polaroids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  slot TEXT NOT NULL CHECK (slot IN ('love', 'proud', 'goal')),
  image_url TEXT NOT NULL,
  caption TEXT,  -- optional custom caption (defaults to slot prompt)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, slot)
);

CREATE INDEX idx_hub_polaroids_user_id ON hub_polaroids (user_id);

-- RLS
ALTER TABLE hub_polaroids ENABLE ROW LEVEL SECURITY;

-- Users can read/write their own polaroids
CREATE POLICY "Users manage own polaroids" ON hub_polaroids
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Service role full access (for admin)
CREATE POLICY "Service role full access" ON hub_polaroids
  FOR ALL USING (true) WITH CHECK (true);

-- Storage bucket for polaroid images (if not exists)
-- Run manually in Supabase dashboard: create bucket 'polaroids' with public access
