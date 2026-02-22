-- Add course_description and author_bio columns to creators table
-- These fields are used for Thinkific course listing and creator website profiles

-- Course description: Marketing description for the Thinkific course listing
ALTER TABLE creators ADD COLUMN IF NOT EXISTS course_description TEXT;

-- Author bio: Creator's bio for course listings and TDI website
ALTER TABLE creators ADD COLUMN IF NOT EXISTS author_bio TEXT;

-- Add comments for documentation
COMMENT ON COLUMN creators.course_description IS 'Marketing description for the Thinkific course listing';
COMMENT ON COLUMN creators.author_bio IS 'Creator bio for course listings and TDI website profile';
