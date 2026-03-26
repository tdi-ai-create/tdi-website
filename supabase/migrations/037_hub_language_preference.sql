-- Add preferred language to hub_profiles
ALTER TABLE hub_profiles
ADD COLUMN IF NOT EXISTS preferred_language text
  DEFAULT 'en'
  CHECK (preferred_language IN ('en', 'es'));

-- Add Spanish content to hub_courses (if not already added by Transcripts CCP)
ALTER TABLE hub_courses
ADD COLUMN IF NOT EXISTS title_es text,
ADD COLUMN IF NOT EXISTS description_es text;

-- Add Spanish content to hub_quick_wins (if not already added by Transcripts CCP)
ALTER TABLE hub_quick_wins
ADD COLUMN IF NOT EXISTS title_es text,
ADD COLUMN IF NOT EXISTS description_es text,
ADD COLUMN IF NOT EXISTS content_es text;

-- Index for language preference queries
CREATE INDEX IF NOT EXISTS idx_hub_profiles_language
ON hub_profiles(preferred_language);
