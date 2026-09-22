-- Goal measurement tooltip: per goal overrides.
--
-- The tooltip on each partner goal card is built from text that already
-- existed. `benchmark_label` explains the instrument and has never been
-- rendered where a partner could see it. These two columns are the escape
-- hatch for the half that is otherwise derived from the contract.
--
-- Both are nullable and both stay null in the normal case. Leaving them null
-- means "work it out from what this school bought", which is what we want for
-- every partnership by default, so that a new school gets a sensible tooltip
-- the moment goals are set without anyone writing copy for it.

alter table public.partnership_kpis
  add column if not exists deeper_measurement text,
  add column if not exists suggested_offering text;

comment on column public.partnership_kpis.deeper_measurement is
  'Optional override for the "what this does not show" line on the goal card. Null derives it from the contract shape.';

comment on column public.partnership_kpis.suggested_offering is
  'Optional override for which offering the goal card points at. Null derives it from the goal and the contract shape.';

-- Guard the override rather than trusting free text, because this value is
-- used to look up copy and a typo would render a goal card with no suggestion
-- at all and no error anywhere.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'partnership_kpis_suggested_offering_check'
  ) then
    alter table public.partnership_kpis
      add constraint partnership_kpis_suggested_offering_check
      check (suggested_offering is null or suggested_offering in ('pulse', 'focus', 'cohort', 'blueprint'));
  end if;
end $$;
