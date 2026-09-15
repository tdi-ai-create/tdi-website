-- Somewhere to record the chasing.
--
-- Collections work happens almost entirely outside the portal: Bella calls an
-- accounts payable line, Rae emails a principal, Omar gets told a cheque is in
-- the next board run. None of that could be written down against the invoice it
-- belongs to, so the only record of a fortnight's chasing was in somebody's
-- memory or sent mail. Allenwood went three weeks unnoticed that way.
--
-- There is already an `intelligence_invoices.notes` column and it is NOT this.
-- That column is a single overwritable text field doing two incompatible jobs:
-- on most rows it reads as a line description ("Learning Hub Membership x23 for
-- Saunemin CCSD #438"), and on ANC-00025 it holds TDI's own collections
-- reasoning about PGCPS, naming why the invoice may never have been paid. It
-- was printing on the client-facing PDF until 15 Sep 2026. One field cannot be
-- both a description and a private ledger, and a field that is overwritten
-- cannot be a history.
--
-- So: a separate, append-shaped table. One row per note, attributed, timed, and
-- never rendered onto a document that leaves the building.
--
-- Deletes are soft. A note saying "AP confirmed the cheque was posted on the
-- 3rd" is evidence, and an invoice record you can quietly remove things from is
-- not one you can rely on in a dispute. The author can retract their own note;
-- the row stays.

BEGIN;

CREATE TABLE IF NOT EXISTS public.billing_invoice_notes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id   uuid NOT NULL REFERENCES public.intelligence_invoices(id) ON DELETE CASCADE,

  body         text NOT NULL,
  -- What the follow-up actually was. A phone call and an emailed reminder are
  -- not the same evidence when a client says they were never contacted.
  kind         text NOT NULL DEFAULT 'note',

  author_email text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  -- Set only when a note is edited after the fact, so the UI can say "edited"
  -- rather than silently presenting a rewritten history as the original.
  updated_at   timestamptz,

  deleted_at   timestamptz,
  deleted_by   text,

  CONSTRAINT billing_invoice_notes_body_not_blank
    CHECK (btrim(body) <> ''),
  CONSTRAINT billing_invoice_notes_kind_known
    CHECK (kind IN ('note', 'call', 'email', 'meeting', 'promise'))
);

-- Every read is "the notes on this invoice, newest first".
CREATE INDEX IF NOT EXISTS idx_billing_invoice_notes_invoice
  ON public.billing_invoice_notes (invoice_id, created_at DESC);

-- These notes are the most damaging thing in Billing to leak, because they are
-- TDI's private commentary about the very client who would read them. Nothing
-- but the service role reaches this table: RLS on, no policies, so anon and
-- authenticated get nothing even if a key is exposed. The only reader is
-- /api/tdi-admin/billing/invoice/[id]/notes, behind requireAdminAuth().
ALTER TABLE public.billing_invoice_notes ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.billing_invoice_notes IS
  'Internal follow-up on an invoice: calls, emails, promises to pay. NEVER printed on an invoice PDF or sent to a client. Not to be confused with intelligence_invoices.notes, which is a single overwritable field that some rows use as a line description.';

COMMENT ON COLUMN public.billing_invoice_notes.kind IS
  'note, call, email, meeting or promise. A promise is a client saying when they will pay, which is the one kind worth chasing on a date.';

COMMENT ON COLUMN public.billing_invoice_notes.deleted_at IS
  'Soft delete. Retracted notes stay on the row because collections notes are evidence; the UI hides them.';

COMMIT;
