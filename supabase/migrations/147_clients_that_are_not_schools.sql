-- Room for a client that is not a school, and a line description for an invoice
-- that has no contract behind it.
--
-- Both exist because of one real invoice. TDI-2608-007, $2,500, went to the
-- Attachment and Trauma Network on 30 Aug 2026 for a conference plenary. It
-- could not be recorded at all:
--
--   1. intelligence_invoices.district_id is NOT NULL, so every invoice needs a
--      client, and districts.segment allowed only district, single_school or
--      charter_network. A nonprofit that runs a conference is none of those, and
--      filing it as a school would have put it in every school count and report.
--
--   2. An invoice's line items live in contract_deliverables, which requires
--      both quote_id and quote_package_id. A speaking engagement has no quote
--      and no package, so it can have no line items, and the PDF fell back to
--      the words "Services rendered". That is not what anyone agreed to pay for.
--
-- The second one is the gap left open on 15 Sep, when intelligence_invoices.notes
-- was removed from the invoice PDF for printing TDI's private collections
-- reasoning about PGCPS onto a page addressed to PGCPS. The fix then was that
-- client-facing wording needs its own field. This is that field. It is the only
-- free text on the document, it is written to be read by the client, and nothing
-- else from the invoice row is printed.

BEGIN;

-- Widening, not narrowing: every existing row already satisfies the new check,
-- so nothing can fail while the application catches up.
ALTER TABLE public.districts
  DROP CONSTRAINT IF EXISTS districts_segment_check;

ALTER TABLE public.districts
  ADD CONSTRAINT districts_segment_check
  CHECK (segment IN ('district', 'single_school', 'charter_network', 'organization'));

COMMENT ON COLUMN public.districts.segment IS
  'district, single_school, charter_network, or organization. An organization is a client that is not a school at all: a conference, a nonprofit, an association. Kept distinct so school counts stay school counts.';

ALTER TABLE public.intelligence_invoices
  ADD COLUMN IF NOT EXISTS line_description text;

COMMENT ON COLUMN public.intelligence_invoices.line_description IS
  'Client-facing description of what is being billed, used as the single line on the PDF when an invoice has no contract_deliverables behind it (speaking fees, one-off work). Written to be read by the client. This is NOT the notes column, which is internal and never printed.';

COMMIT;
