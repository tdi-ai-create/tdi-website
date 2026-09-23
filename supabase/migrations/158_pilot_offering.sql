-- PILOT is not a fifth thing to sell. It is what legacy Hub-only contracts
-- actually were, signed before the four offering model existed. Adding it here
-- lets those accounts stop being mislabelled as something a school could buy
-- today.
--
-- Roosevelt School is the first: a Hub pilot on a March 2026 contract carrying
-- no observation days, no virtual sessions and no exec sessions, which had been
-- sitting under a BLUEPRINT label against a $1,499 deal. Blueprint is $30,000
-- to $39,000 and is the only offering that puts people in buildings, so the
-- label was a leftover rather than what was sold.
--
-- Deliberately NOT applied to sales_opportunities.offering. A pilot is never
-- sold, so the sales pickers and the create-partnership form stay restricted to
-- the four sellable offerings, while partnership filters and edit pickers carry
-- all five so accounts like this one can be found and relabelled.
--
-- Applied to the live database on 23 September 2026.

alter table partnerships drop constraint if exists partnerships_offering_check;

alter table partnerships add constraint partnerships_offering_check
  check (
    offering is null
    or offering = any (array['PULSE'::text, 'FOCUS'::text, 'COHORT'::text, 'BLUEPRINT'::text, 'PILOT'::text])
  );
