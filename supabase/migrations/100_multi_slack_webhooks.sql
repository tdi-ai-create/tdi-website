-- Add webhook URL columns for Creator Studio, Sales, and Partner Health Slack notifications
ALTER TABLE funding_notification_settings
  ADD COLUMN IF NOT EXISTS creator_webhook_url text,
  ADD COLUMN IF NOT EXISTS sales_webhook_url text,
  ADD COLUMN IF NOT EXISTS partner_webhook_url text;
