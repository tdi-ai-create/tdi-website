-- Put the content queue's Slack alerts where every other Slack alert already is.
--
-- Runs against the main project (tauzahhnawejouvtbvuw), which owns
-- funding_notification_settings. The content queue itself lives in the Hub
-- project; only the webhook configuration is here, because this is the table
-- the admin settings page already edits.
--
-- lib/content-queue/notify.ts read SLACK_WEBHOOK_KRISTIN and SLACK_WEBHOOK_RAE
-- from the environment. Neither has ever been set in Vercel, so every content
-- queue Slack notification ever written returned attempted: false. Meanwhile
-- partner, billing, sales, creator and funding alerts all work, because they
-- read their webhook out of this table at call time. The content queue was the
-- only one using environment variables, and it was the only dead one.
--
-- Two columns rather than one, because the two messages go to two people:
-- "needs approving" is Kristin's, and "ready to publish" is Rae's.
--
-- Both are nullable and both start null. Nothing changes until someone pastes a
-- URL into the admin settings page. An unset webhook is reported in the item's
-- feedback_log as "nobody was told" rather than passing silently.

BEGIN;

ALTER TABLE public.funding_notification_settings
  ADD COLUMN IF NOT EXISTS content_approval_webhook_url text,
  ADD COLUMN IF NOT EXISTS content_publish_webhook_url  text;

COMMENT ON COLUMN public.funding_notification_settings.content_approval_webhook_url IS
  'Where the content queue says a piece needs approving. Kristin approves content, so this is normally #kristin-actions.';

COMMENT ON COLUMN public.funding_notification_settings.content_publish_webhook_url IS
  'Where the content queue says an approved piece is ready to publish. Normally #rae-actions, since Rae publishes Substack and email.';

COMMIT;
