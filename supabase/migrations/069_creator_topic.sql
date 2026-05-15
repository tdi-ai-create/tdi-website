-- Add topic field for about page creator display
ALTER TABLE creators ADD COLUMN IF NOT EXISTS topic TEXT;
