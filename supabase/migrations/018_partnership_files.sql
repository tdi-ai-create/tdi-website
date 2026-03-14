-- Migration 018: Partnership Files Table
-- Stores uploaded files for AI extraction

CREATE TABLE IF NOT EXISTS partnership_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID NOT NULL REFERENCES partnerships(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  content_type TEXT,
  file_size INTEGER,
  uploaded_by TEXT,
  extracted_data JSONB,
  extracted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by partnership
CREATE INDEX IF NOT EXISTS idx_partnership_files_partnership_id
  ON partnership_files(partnership_id);

-- Index for ordering by upload date
CREATE INDEX IF NOT EXISTS idx_partnership_files_created_at
  ON partnership_files(created_at DESC);

-- Enable RLS
ALTER TABLE partnership_files ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
CREATE POLICY "Service role full access on partnership_files"
  ON partnership_files
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_partnership_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER partnership_files_updated_at
  BEFORE UPDATE ON partnership_files
  FOR EACH ROW
  EXECUTE FUNCTION update_partnership_files_updated_at();

-- Create storage bucket for partnership files if it doesn't exist
-- Note: This needs to be done via Supabase dashboard or API
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('partnership-files', 'partnership-files', false)
-- ON CONFLICT (id) DO NOTHING;
