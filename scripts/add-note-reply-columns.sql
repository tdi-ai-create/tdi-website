-- Migration: Add reply tracking columns to creator_notes
-- This enables the creator reply feature for notes

-- Add is_reply column to track which notes are replies
ALTER TABLE creator_notes
ADD COLUMN IF NOT EXISTS is_reply BOOLEAN DEFAULT FALSE;

-- Add parent_note_id to link replies to original notes
ALTER TABLE creator_notes
ADD COLUMN IF NOT EXISTS parent_note_id UUID REFERENCES creator_notes(id) ON DELETE SET NULL;

-- Create index for efficient reply queries
CREATE INDEX IF NOT EXISTS idx_creator_notes_parent_id ON creator_notes(parent_note_id);

-- Verify columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'creator_notes'
AND column_name IN ('is_reply', 'parent_note_id');
