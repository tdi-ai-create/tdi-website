-- Funding outreach approval queue.
--
-- Agents draft client emails into funding_email_log with status = 'draft'.
-- Until now there was no way for a human to act on them from the portal, so
-- eight drafts had accumulated with no approve or reject path. These columns
-- record the reject side; the approve side already writes sent_at / sent_by.
--
-- Nullable and unconstrained on purpose: the code that populates them ships in
-- the same PR, and nothing should break on rows written before it.

alter table funding_email_log
  add column if not exists rejected_reason text,
  add column if not exists rejected_by     text,
  add column if not exists rejected_at     timestamptz;

-- The queue reads drafts oldest-first and flags anything past 48 hours.
create index if not exists funding_email_log_draft_created_idx
  on funding_email_log (created_at)
  where status = 'draft';

comment on column funding_email_log.rejected_reason is
  'Why a human rejected this drafted email. Free text, shown back to the agent that wrote it.';
