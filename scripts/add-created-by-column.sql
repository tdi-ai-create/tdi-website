-- Add created_by column to creator_notes table
-- Run this in Supabase SQL Editor

ALTER TABLE public.creator_notes
ADD COLUMN IF NOT EXISTS created_by text NULL;
