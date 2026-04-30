-- Practice Notes MVP Hardening
-- Adds moderation columns and replaces permissive RLS policies with spec-compliant ones

-- Add moderation and staff seed columns
ALTER TABLE hub_practice_notes
  ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS hidden_by UUID REFERENCES hub_profiles(id),
  ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_staff_seed BOOLEAN DEFAULT false;

-- Drop existing over-permissive RLS policies
DROP POLICY IF EXISTS "Anyone can read practice notes" ON hub_practice_notes;
DROP POLICY IF EXISTS "Users can create own practice notes" ON hub_practice_notes;
DROP POLICY IF EXISTS "Users can update own practice notes" ON hub_practice_notes;
DROP POLICY IF EXISTS "Users can delete own practice notes" ON hub_practice_notes;

-- SELECT: hidden notes invisible to everyone except the author and admins
CREATE POLICY "Read visible practice notes"
ON hub_practice_notes FOR SELECT
USING (
  NOT is_hidden
  OR user_id = auth.uid()
  OR (
    auth.jwt() ->> 'email' ILIKE '%@teachersdeserveit.com'
  )
);

-- INSERT: must be the authenticated user AND enrolled AND course not archived
CREATE POLICY "Enrolled users can create practice notes"
ON hub_practice_notes FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM hub_enrollments
    WHERE hub_enrollments.user_id = auth.uid()
      AND hub_enrollments.course_id = hub_practice_notes.course_id
  )
  AND NOT EXISTS (
    SELECT 1 FROM hub_courses
    WHERE hub_courses.id = hub_practice_notes.course_id
      AND hub_courses.archived_at IS NOT NULL
  )
);

-- UPDATE (author): must own the note AND still be enrolled
CREATE POLICY "Authors can update own practice notes while enrolled"
ON hub_practice_notes FOR UPDATE
USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM hub_enrollments
    WHERE hub_enrollments.user_id = auth.uid()
      AND hub_enrollments.course_id = hub_practice_notes.course_id
  )
)
WITH CHECK (
  user_id = auth.uid()
  AND is_hidden = false
  AND is_staff_seed = is_staff_seed
);

-- UPDATE (admin hide): TDI staff can toggle is_hidden
CREATE POLICY "TDI admin can hide practice notes"
ON hub_practice_notes FOR UPDATE
USING (
  auth.jwt() ->> 'email' ILIKE '%@teachersdeserveit.com'
);

-- DELETE: must own the note AND still be enrolled
CREATE POLICY "Authors can delete own practice notes while enrolled"
ON hub_practice_notes FOR DELETE
USING (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM hub_enrollments
    WHERE hub_enrollments.user_id = auth.uid()
      AND hub_enrollments.course_id = hub_practice_notes.course_id
  )
);
