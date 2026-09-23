-- 155: Section assignment for the buyer facing "What's inside the Hub" page.
--
-- The page at /for-schools/whats-inside renders ONLY rows that a person has
-- assigned to a section. Tag based sorting was tried and misfiles material:
-- a welding heat input lab and a cosmetology lab card both sort into behavior
-- because they carry a safety tag. On a sales page that reads as carelessness.
--
-- Deliberately NO check constraint on hub_section. Enforcement that outruns the
-- code breaks every client instantly (see migration 109). An unrecognised value
-- means the item quietly does not appear, and the weekly unassigned report is
-- what surfaces it. Worst case is a missing item, never a wrong one.
--
-- Recognised values, matched in app/for-schools/whats-inside/sections.ts:
--   behavior, instructional_planning, paras, first_weeks,
--   families, leading, teacher_load, ai_technology

alter table hub_quick_wins
  add column if not exists hub_section text,
  add column if not exists hub_section_pin integer,
  add column if not exists hub_badge text;

alter table hub_courses
  add column if not exists hub_section text,
  add column if not exists hub_section_pin integer,
  add column if not exists hub_badge text;

comment on column hub_quick_wins.hub_section is
  'Section on /for-schools/whats-inside. Null means the item does not appear there. Set by a person during QA, never by tag inference.';
comment on column hub_quick_wins.hub_section_pin is
  'Lower sorts first among the four items shown at rest. Null means order by recent openers. At most two pinned per section.';
comment on column hub_quick_wins.hub_badge is
  'Editorial badge only. Currently start_here. Most used, trending, popular and new are computed and never stored.';

comment on column hub_courses.hub_section is
  'Section on /for-schools/whats-inside. Null means the item does not appear there.';
comment on column hub_courses.hub_section_pin is
  'Lower sorts first among the four items shown at rest.';
comment on column hub_courses.hub_badge is
  'Editorial badge only. Currently start_here.';

create index if not exists hub_quick_wins_whats_inside_idx
  on hub_quick_wins (hub_section, hub_section_pin)
  where is_published and hub_section is not null;

create index if not exists hub_courses_whats_inside_idx
  on hub_courses (hub_section, hub_section_pin)
  where is_published and hub_section is not null;
