-- Whether a funder still exists, decided once instead of per school.
--
-- Saunemin's Community Schools Budget path went through three QA cycles. Every
-- one of them failed on the same thing, and it was never a writing problem:
-- the likely funder shows non-continuation letters sent December 2025, pending
-- litigation over the programme's future, and no open notice for this cycle.
-- Julie said so on the first pass, said it again on the second, and on the
-- third escalated with a recommendation to stop rather than send it back for a
-- fourth redraft.
--
-- Nobody made that call, and the reason is structural rather than anybody's
-- inattention. Viability was only ever asked as a question about one school's
-- path, so answering it would only have closed one school's path. The same
-- programme is seeded onto every new school by the standard template, so the
-- same dead funder gets re-litigated school by school, forever, and each
-- re-litigation costs three drafting and review cycles.
--
-- A funder being defunct is a fact about the funder. It belongs on the funder.
--
-- Measured while dry running this migration: marking a single funder
-- non_continuing stops four live opportunities at once. That is the leverage
-- the per-pursuit version never had.
--
-- The constraint is the part that matters. 'non_continuing' is the value that
-- kills work across every school simultaneously, so it cannot be set without a
-- reason and a date. A path stopped with no recorded why is how a decision
-- becomes folklore.

alter table funders
  add column if not exists viability text
    check (viability in ('viable', 'non_continuing', 'unknown')),
  add column if not exists viability_note text,
  add column if not exists viability_checked_on date;

alter table funders
  drop constraint if exists funders_non_continuing_needs_a_reason;

alter table funders
  add constraint funders_non_continuing_needs_a_reason
    check (viability is distinct from 'non_continuing'
           or (viability_note is not null and viability_checked_on is not null));

comment on column funders.viability is
  'Whether this funder is still running a cycle we can apply to. Decided once for every school rather than per pursuit, because a defunct programme is a fact about the funder. Null means nobody has asked.';

comment on column funders.viability_note is
  'Why. Required when viability is non_continuing, because that value stops work on every school at once and a stop with no recorded reason becomes folklore.';

comment on column funders.viability_checked_on is
  'When the finding was established. Required alongside non_continuing: a programme can reopen, and a stop from a year ago should not silently hold.';
