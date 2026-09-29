-- The school's own next step, shown as a second badge on its offering card on
-- the partner dashboard ("To get the most from this: consider a second visit in
-- the winter or spring").
--
-- Why this is stored per partnership rather than derived from contract_phase:
-- a phase default is wrong more often than it is right. Oak Grove is IGNITE
-- with three observation days already bought and nothing scheduled, so an
-- "add a visit" default would be telling them to buy something they already own.
-- Glen Ellyn is IGNITE with one, where a second visit is exactly right and had
-- already been discussed with the district on 22 September 2026.
--
-- Null means no badge. That is the correct output for a school that already has
-- every component of its offering (Allenwood, St. Peter Chanel), and for schools
-- whose next step is a live commercial conversation rather than a dashboard
-- nudge (Addison renewal, Oak Grove paused contract).
--
-- Never put a price or a raw count in this field. Prices appear only on
-- /for-schools, and absolute counts must not reach anyone outside TDI.

alter table partnerships add column if not exists next_step_suggestion text;

comment on column partnerships.next_step_suggestion is
  'Client-facing next step shown as a second badge on the offering card on the partner dashboard. Null means no badge. Set per partnership, not derived from contract_phase. No prices, no raw counts.';

update partnerships set next_step_suggestion = v.txt
from (values
  ('Glen Ellyn School District 41',          'consider a second visit in the winter or spring.'),
  ('St. Mary Catholic School',               'consider adding an on-campus observation day, so we can see the strategies land in classrooms.'),
  ('Tidioute Community Charter School',      'consider opening Hub access to more of your team.'),
  ('Saunemin CCSD #438',                     'consider adding virtual strategy sessions between your visits.')
) as v(org, txt)
where partnerships.org_name = v.org;
