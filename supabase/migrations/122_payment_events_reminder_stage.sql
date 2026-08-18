-- Invoice reminders were emailing the same schools every single morning.
--
-- The followup cron logs each reminder to payment_events and skips invoices it
-- has already contacted. That log never worked: the cron wrote event_type
-- values ('reminder_14d', 'reminder_due', 'escalation_45d', 'escalation_60d')
-- that the payment_events_event_type_check constraint rejects, and the insert
-- result was never checked. Every insert failed silently, the table stayed
-- empty, and the guard found nothing to skip. Tidioute and St. Peter Chanel
-- were emailed daily from Aug 5 to Aug 17.
--
-- The guard was also scoped to event_date = today, so even a working log would
-- only have stopped a same-day double send, not tomorrow's repeat.
--
-- This adds a stage marker so a reminder can be deduped for the life of the
-- invoice, not just for the day. Reminders keep the existing allowed
-- event_type values ('email_sent' / 'escalated') so they read correctly in the
-- billing timeline alongside calls, voicemails and check receipts.

ALTER TABLE payment_events
  ADD COLUMN IF NOT EXISTS reminder_stage text;

COMMENT ON COLUMN payment_events.reminder_stage IS
  'Set by the invoice-followup cron to mark which automated stage this event records (reminder_14d, reminder_due, escalation_45d, escalation_60d). NULL for events logged by a human.';

-- One row per invoice per automated stage. This is what actually stops the
-- repeat: the cron writes the row before sending, so a duplicate send cannot
-- get past the database even if the application guard is bypassed.
CREATE UNIQUE INDEX IF NOT EXISTS payment_events_invoice_reminder_stage_key
  ON payment_events (invoice_id, reminder_stage)
  WHERE reminder_stage IS NOT NULL;

-- Backfill the three invoices that have already been reminded, so the next run
-- does not send a fourteenth email. Dated Aug 5, the day the first (and only
-- intended) reminder went out.
INSERT INTO payment_events (invoice_id, event_type, event_date, summary, reminder_stage)
SELECT i.id,
       'email_sent',
       DATE '2026-08-05',
       '14-day reminder sent (backfilled: cron repeated this send daily Aug 5-17 due to a broken dedup log)',
       'reminder_14d'
FROM intelligence_invoices i
WHERE i.invoice_number IN ('TDI-2607-001', 'TDI-2607-002', 'TDI-2607-003')
ON CONFLICT DO NOTHING;
