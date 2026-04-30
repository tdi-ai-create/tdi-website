-- Staff ID Photo Integration - Phase 1
-- Add photo fields to both staff tables

ALTER TABLE staff_members
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS photo_thumb_url TEXT,
  ADD COLUMN IF NOT EXISTS photo_uploaded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS photo_source TEXT CHECK (photo_source IN ('bulk_import', 'self_upload', 'sis_sync')),
  ADD COLUMN IF NOT EXISTS consent_checked_at TIMESTAMPTZ;

ALTER TABLE partnership_staff
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS photo_thumb_url TEXT,
  ADD COLUMN IF NOT EXISTS photo_uploaded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS photo_source TEXT CHECK (photo_source IN ('bulk_import', 'self_upload', 'sis_sync')),
  ADD COLUMN IF NOT EXISTS consent_checked_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_staff_members_role_title ON staff_members (role_title);
CREATE INDEX IF NOT EXISTS idx_staff_members_photo_url ON staff_members (photo_url) WHERE photo_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_partnership_staff_role_group ON partnership_staff (role_group);
CREATE INDEX IF NOT EXISTS idx_partnership_staff_photo_url ON partnership_staff (photo_url) WHERE photo_url IS NOT NULL;

-- Create storage bucket for staff photos (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('staff-photos', 'staff-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policy: TDI admins can upload/delete staff photos
CREATE POLICY "TDI admin manage staff photos" ON storage.objects
  FOR ALL USING (
    bucket_id = 'staff-photos'
    AND auth.jwt() ->> 'email' LIKE '%@teachersdeserveit.com'
  );

-- Public read access for staff photos
CREATE POLICY "Public read staff photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'staff-photos');
