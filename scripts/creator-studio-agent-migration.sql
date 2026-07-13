-- Creator Studio Agent Integration -- Database Migration
-- Adds columns for Paperclip agent (Anne Marie) integration
-- Run against Creator Studio Supabase instance

-- 1. Add agent tracking columns to creators table
ALTER TABLE public.creators
ADD COLUMN IF NOT EXISTS agent_flag TEXT,
ADD COLUMN IF NOT EXISTS agent_flag_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS agent_flag_cleared BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS assigned_agent TEXT,
ADD COLUMN IF NOT EXISTS last_agent_activity_at TIMESTAMPTZ;

-- 2. Add draft tracking columns to creator_notes table
ALTER TABLE public.creator_notes
ADD COLUMN IF NOT EXISTS draft_status TEXT DEFAULT 'published',
ADD COLUMN IF NOT EXISTS drafted_by TEXT,
ADD COLUMN IF NOT EXISTS draft_reason TEXT;

-- 3. Create index for efficient agent draft queries
CREATE INDEX IF NOT EXISTS idx_creator_notes_draft_status
ON public.creator_notes (draft_status)
WHERE draft_status = 'pending_approval';

-- 4. Create index for agent flag queries
CREATE INDEX IF NOT EXISTS idx_creators_agent_flag
ON public.creators (agent_flag)
WHERE agent_flag IS NOT NULL;
