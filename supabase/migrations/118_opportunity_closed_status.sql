-- 'closed' opportunity status
--
-- When Bella decides to stop pursuing a grant, the honest record is that we
-- closed it, not that the funder denied it. The phase computation in
-- app/api/funding/opportunities/route.ts already treats 'closed' as decided;
-- the constraint just never allowed the value to be written.
--
-- Widening only. Safe against currently-deployed code.

ALTER TABLE funding_opportunities
  DROP CONSTRAINT IF EXISTS funding_opportunities_status_check;

ALTER TABLE funding_opportunities
  ADD CONSTRAINT funding_opportunities_status_check
  CHECK (status = ANY (ARRAY[
    'researching', 'applied', 'waiting', 'awarded', 'denied',
    'stalled', 'backup', 'not_started', 'closed'
  ]));
