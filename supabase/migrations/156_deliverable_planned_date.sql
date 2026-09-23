-- When a contract line is going to happen, as opposed to when it did.
--
-- contract_deliverables already carries delivery_date, and that column is a
-- receipt rather than a plan. It is written after the fact by Mark Delivered
-- and by the complete-session route, and if it is still empty when an invoice
-- goes out, send-invoice fills it with today's date. So there has never been a
-- field anywhere in the system meaning "this is going to happen on the 7th".
--
-- On 22 September 2026 that left 43 lines worth $152,447 sitting in
-- delivery_state 'scheduled' with zero dates between them. The word scheduled
-- was set when the contract was signed, not when anything was booked. Omar
-- cannot be shown when invoices are coming because nothing in the database
-- knows.
--
-- The dates do exist, on Rae's calendar, in a shape nothing can read: two
-- different clients both have events titled exactly "TDI In-Person Day",
-- Saunemin's 7 October visit appears twice because the internal travel hold is
-- a separate event, and Saunemin's March date is explicitly unconfirmed with
-- that fact recorded only in the body text. A forecast parsed out of calendar
-- titles would double count one visit and treat a pencilled date as revenue.
--
-- So the portal owns the date and the calendar becomes a mirror of it.
-- calendar_event_id is what makes the two comparable later, so drift can be
-- reported rather than guessed at.
--
-- SHIPPED DARK. Nothing reads these columns yet. Every row is null, no column
-- is NOT NULL, and no default invents a date. The check constraint below can
-- only reject a value that does not exist yet, so it cannot break a write that
-- something is already making. The screens that set these arrive next.

BEGIN;

ALTER TABLE public.contract_deliverables
  -- Null is a real and common answer. A line with no planned date is not an
  -- error, it is the queue of work nobody has booked, and that queue is the
  -- most useful thing the billing calendar will show in its first week.
  ADD COLUMN IF NOT EXISTS planned_date date,

  -- Held and confirmed must never render the same. Saunemin's second
  -- observation day is pencilled for 3 March on Gary's suggestion, subject to
  -- the district calendar and to not landing near spring break. Forecasting
  -- that as though it were booked is how a prediction becomes a promise.
  ADD COLUMN IF NOT EXISTS planned_confidence text,

  -- The Google Calendar event this line produced. A string, not a uuid: these
  -- are Google's ids, not ours.
  ADD COLUMN IF NOT EXISTS calendar_event_id text;

ALTER TABLE public.contract_deliverables
  DROP CONSTRAINT IF EXISTS contract_deliverables_planned_confidence_known;

ALTER TABLE public.contract_deliverables
  ADD CONSTRAINT contract_deliverables_planned_confidence_known
  CHECK (planned_confidence IS NULL OR planned_confidence IN ('held', 'confirmed'));

-- Every read of the billing calendar is "dated lines, in date order". The
-- partial index keeps the undated majority out of it, which today is all 43.
CREATE INDEX IF NOT EXISTS idx_deliverables_planned_date
  ON public.contract_deliverables (planned_date)
  WHERE planned_date IS NOT NULL;

COMMENT ON COLUMN public.contract_deliverables.planned_date IS
  'When the service is expected to happen. A plan, not a record. delivery_date is the record, and is only written after the fact. Null means nobody has booked this line yet, which is a finding rather than a fault.';

COMMENT ON COLUMN public.contract_deliverables.planned_confidence IS
  'held or confirmed. Held means a date is being kept so it does not get taken, and the client has not agreed it. Never render the two alike.';

COMMENT ON COLUMN public.contract_deliverables.calendar_event_id IS
  'The Google Calendar event created from planned_date. The portal owns the date and the calendar mirrors it, never the reverse, so a disagreement between the two is reported as drift rather than silently adopted.';

COMMIT;
