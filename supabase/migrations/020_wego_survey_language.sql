-- Add language column to WEGO survey responses
-- Run this SQL in Supabase SQL Editor

ALTER TABLE wego_survey_responses
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en' CHECK (language IN ('en', 'es'));
