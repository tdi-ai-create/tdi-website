-- Community Practice Space - educators share how they used/adapted course content
-- This is distinct from reviews - it's a practitioner adaptation log

CREATE TABLE IF NOT EXISTS hub_practice_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES hub_courses(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES hub_lessons(id) ON DELETE SET NULL,
  module_id uuid REFERENCES hub_modules(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES hub_profiles(id) ON DELETE CASCADE,

  -- Structured prompts (what I tried is required, others optional)
  what_i_tried text NOT NULL,
  what_i_changed text,
  what_happened text,

  -- Tags for filtering (grade levels, adaptation types)
  tags text[] DEFAULT '{}',

  -- Engagement metrics
  helpful_count integer DEFAULT 0,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table to track which users marked a note as helpful
CREATE TABLE IF NOT EXISTS hub_practice_note_helpful (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_note_id uuid NOT NULL REFERENCES hub_practice_notes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES hub_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(practice_note_id, user_id)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_hub_practice_notes_course
ON hub_practice_notes(course_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hub_practice_notes_lesson
ON hub_practice_notes(lesson_id, created_at DESC) WHERE lesson_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_hub_practice_notes_module
ON hub_practice_notes(module_id, created_at DESC) WHERE module_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_hub_practice_notes_user
ON hub_practice_notes(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hub_practice_notes_helpful
ON hub_practice_notes(helpful_count DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hub_practice_note_helpful_user
ON hub_practice_note_helpful(user_id, practice_note_id);

-- Row Level Security
ALTER TABLE hub_practice_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_practice_note_helpful ENABLE ROW LEVEL SECURITY;

-- Anyone can read practice notes (public within the learning hub)
CREATE POLICY "Anyone can read practice notes"
ON hub_practice_notes FOR SELECT
USING (true);

-- Users can create their own practice notes
CREATE POLICY "Users can create own practice notes"
ON hub_practice_notes FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update/delete their own practice notes
CREATE POLICY "Users can update own practice notes"
ON hub_practice_notes FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own practice notes"
ON hub_practice_notes FOR DELETE
USING (user_id = auth.uid());

-- Anyone can read helpful marks
CREATE POLICY "Anyone can read helpful marks"
ON hub_practice_note_helpful FOR SELECT
USING (true);

-- Users can mark notes as helpful
CREATE POLICY "Users can mark notes helpful"
ON hub_practice_note_helpful FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can unmark their own helpful marks
CREATE POLICY "Users can remove own helpful marks"
ON hub_practice_note_helpful FOR DELETE
USING (user_id = auth.uid());

-- Function to update helpful_count when helpful marks change
CREATE OR REPLACE FUNCTION update_practice_note_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE hub_practice_notes
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.practice_note_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE hub_practice_notes
    SET helpful_count = GREATEST(helpful_count - 1, 0)
    WHERE id = OLD.practice_note_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_practice_note_helpful_count
AFTER INSERT OR DELETE ON hub_practice_note_helpful
FOR EACH ROW EXECUTE FUNCTION update_practice_note_helpful_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_practice_note_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_practice_note_timestamp
BEFORE UPDATE ON hub_practice_notes
FOR EACH ROW EXECUTE FUNCTION update_practice_note_timestamp();
