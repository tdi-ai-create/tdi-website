-- 166: which goals may be measured by what staff report on an assignment.
--
-- A9.3, agreed with Rae on 2 October 2026. A goal reads a number from
-- assignments only when TDI has turned that on for it, one goal at a time,
-- defaulting to off.
--
-- A9.2 had asked for the waiting goals to be checked one at a time before any
-- of this was wired, because a goal whose wording does not mean "in use in my
-- classroom" must not be measured as though it does. This column is the answer
-- to that. Thirty goals exist, so it is twenty minutes of judgement once rather
-- than a rule to build and maintain.
--
-- Every automatic rule considered failed. Matching on a percentage unit would
-- have let "Positive parent engagement" read a figure derived from classroom
-- assignments, which is nonsense with a plausible shape, and that is exactly
-- the bug class docs/leadership-dashboard-standard.md exists to stop. Wording
-- heuristics were worse.
--
-- Default false on purpose. A goal that nobody has judged shows a sentence
-- saying assignments do not move this number, per A9.4, rather than a figure
-- nobody at TDI has stood behind. Turning it on is deliberate, per goal, and
-- reversible with one update.
--
-- Known today to need it left off, read from the live database on 2 October:
--   Roosevelt   "Staff supported on stress and burnout"       scored 3.5 of 5
--   Tidioute    "Every para-educator in the building has access"  a count, 2 of 2
--   Addison     "Para and teacher working relationship"       no target at all
--   Roosevelt   "Positive parent engagement"                  no target at all
--   St Peter Chanel "Positive parent engagement"              no target at all

alter table partnership_kpis
  add column if not exists measured_by_assignment boolean not null default false;

comment on column partnership_kpis.measured_by_assignment is
  'A9.3. True only when TDI has judged that the share of assigned staff at "used it with students" or above is a fair reading of this goal. Default false. A goal with this false still carries the reason for an assignment, it just never shows a figure derived from one.';
