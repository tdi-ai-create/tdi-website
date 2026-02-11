-- Migration: 004_reminders
-- Description: Create reminders table for the notification system

CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE,
  reminder_type TEXT CHECK (reminder_type IN ('action_item_nudge', 'hub_login_reminder', 'session_reminder', 'custom')),
  subject TEXT,
  body TEXT,
  recipient_email TEXT NOT NULL,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed')),
  scheduled_for TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- TDI admins have full access to reminders
CREATE POLICY "TDI admin full access" ON reminders FOR ALL
  USING (auth.jwt() ->> 'email' LIKE '%@teachersdeserveit.com');

-- Create index for faster lookups by partnership
CREATE INDEX IF NOT EXISTS idx_reminders_partnership_id ON reminders(partnership_id);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_for ON reminders(scheduled_for);
