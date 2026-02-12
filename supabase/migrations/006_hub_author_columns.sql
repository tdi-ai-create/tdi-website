-- Migration: Add author columns to hub_courses
-- Description: Add author_name, author_bio, and author_avatar_url columns to hub_courses table

-- Add author columns to hub_courses
ALTER TABLE hub_courses
ADD COLUMN IF NOT EXISTS author_name TEXT,
ADD COLUMN IF NOT EXISTS author_bio TEXT,
ADD COLUMN IF NOT EXISTS author_avatar_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN hub_courses.author_name IS 'Name of the course instructor/author';
COMMENT ON COLUMN hub_courses.author_bio IS 'Short biography of the instructor (max ~300 chars recommended)';
COMMENT ON COLUMN hub_courses.author_avatar_url IS 'URL to the instructor avatar/headshot image';

-- Set default author for existing courses (TDI Team)
-- Uncomment and run if you want to set defaults:
-- UPDATE hub_courses
-- SET author_name = 'Teachers Deserve It Team',
--     author_bio = 'Built by educators who believe every teacher deserves support, growth, and a community that gets it.'
-- WHERE author_name IS NULL;
