-- Add Spanish transcript column to hub_lessons
ALTER TABLE hub_lessons
ADD COLUMN IF NOT EXISTS transcript_text_es text;

-- Add language columns to hub_courses for future bilingual metadata
ALTER TABLE hub_courses
ADD COLUMN IF NOT EXISTS title_es text,
ADD COLUMN IF NOT EXISTS description_es text;

-- Add language columns to hub_quick_wins
ALTER TABLE hub_quick_wins
ADD COLUMN IF NOT EXISTS title_es text,
ADD COLUMN IF NOT EXISTS description_es text,
ADD COLUMN IF NOT EXISTS content_es text;
