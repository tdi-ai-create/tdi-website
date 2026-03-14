-- Creator Studio Enhancements Migration
-- Enhancement 1: Multi-type Publication Dates
-- Enhancement 3: Stalled Creator Flow Redesign
-- Enhancement 4: Target Timeline + Countdown

-- ============================================
-- ENHANCEMENT 1: Publication Dates
-- ============================================

-- Blog publish date and overview
ALTER TABLE creators ADD COLUMN IF NOT EXISTS blog_publish_date DATE;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS blog_publish_overview TEXT;

-- Course publish date and overview
ALTER TABLE creators ADD COLUMN IF NOT EXISTS course_publish_date DATE;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS course_publish_overview TEXT;

-- Download publish date and overview
ALTER TABLE creators ADD COLUMN IF NOT EXISTS download_publish_date DATE;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS download_publish_overview TEXT;

-- Add comments for documentation
COMMENT ON COLUMN creators.blog_publish_date IS 'Date when blog content was/will be published';
COMMENT ON COLUMN creators.blog_publish_overview IS 'Brief description of blog content (1-2 sentences)';
COMMENT ON COLUMN creators.course_publish_date IS 'Date when course was/will be published';
COMMENT ON COLUMN creators.course_publish_overview IS 'Brief description of course content (1-2 sentences)';
COMMENT ON COLUMN creators.download_publish_date IS 'Date when download was/will be published';
COMMENT ON COLUMN creators.download_publish_overview IS 'Brief description of download content (1-2 sentences)';

-- ============================================
-- ENHANCEMENT 3: Stalled Creator Flow Redesign
-- ============================================

-- Add followed_up status tracking columns
ALTER TABLE creators ADD COLUMN IF NOT EXISTS last_followed_up_at TIMESTAMPTZ;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS followed_up_by TEXT;

-- Add comments
COMMENT ON COLUMN creators.last_followed_up_at IS 'Timestamp when TDI team last followed up with stalled creator';
COMMENT ON COLUMN creators.followed_up_by IS 'Email of TDI team member who performed the follow-up';

-- ============================================
-- ENHANCEMENT 4: Target Timeline + Countdown
-- ============================================

-- Add target completion date columns to creators table
ALTER TABLE creators ADD COLUMN IF NOT EXISTS target_completion_date DATE;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS target_date_set_at TIMESTAMPTZ;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS target_date_set_by TEXT;

-- Add comments
COMMENT ON COLUMN creators.target_completion_date IS 'Creator target completion/launch date';
COMMENT ON COLUMN creators.target_date_set_at IS 'When the target date was last set';
COMMENT ON COLUMN creators.target_date_set_by IS 'Email of who set the target date (creator or admin)';

-- Create target date history table
CREATE TABLE IF NOT EXISTS creator_target_date_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  target_date DATE NOT NULL,
  set_at TIMESTAMPTZ DEFAULT now(),
  set_by TEXT NOT NULL,
  notes TEXT
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_target_date_history_creator_id ON creator_target_date_history(creator_id);
CREATE INDEX IF NOT EXISTS idx_target_date_history_set_at ON creator_target_date_history(set_at);

-- Add comments
COMMENT ON TABLE creator_target_date_history IS 'Tracks all target date changes for creators';
COMMENT ON COLUMN creator_target_date_history.set_by IS 'Email of person who set this target date';

-- Create reminder log table
CREATE TABLE IF NOT EXISTS creator_reminder_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL, -- '60_days', '30_days', '14_days', '7_days', '3_days'
  sent_at TIMESTAMPTZ DEFAULT now(),
  target_date DATE NOT NULL
);

-- Create indexes for faster lookups and duplicate prevention
CREATE INDEX IF NOT EXISTS idx_reminder_log_creator_id ON creator_reminder_log(creator_id);
CREATE INDEX IF NOT EXISTS idx_reminder_log_type_target ON creator_reminder_log(creator_id, reminder_type, target_date);

-- Add comments
COMMENT ON TABLE creator_reminder_log IS 'Tracks sent reminders to prevent duplicates';
COMMENT ON COLUMN creator_reminder_log.reminder_type IS 'Reminder interval: 60_days, 30_days, 14_days, 7_days, 3_days';

-- ============================================
-- ENSURE RACHEL HAS ADMIN ACCESS
-- ============================================

-- Insert Rachel if not already in admin_users (uses ON CONFLICT to avoid duplicates)
INSERT INTO admin_users (email, name)
VALUES ('rachel@teachersdeserveit.com', 'Rachel Patragas')
ON CONFLICT (email) DO NOTHING;

-- Verify Rae also has admin access
INSERT INTO admin_users (email, name)
VALUES ('rae@teachersdeserveit.com', 'Rae Hughart')
ON CONFLICT (email) DO NOTHING;
