-- 160: Follow-up alert on a sales lead.
--
-- One live alert per lead: what has to happen next, who is doing it, and by
-- when. Editable by anyone on the board, readable by everyone. Every change is
-- also written into the note history, so the alert stays a current instruction
-- while the notes stay the record.
--
-- All columns nullable, no constraints, no defaults. A lead with no follow-up
-- is the normal state and must not be made invalid by this migration.
-- Applied to production 24 September 2026.
alter table sales_opportunities
  add column if not exists followup_text   text,
  add column if not exists followup_kind   text,
  add column if not exists followup_owner  text,
  add column if not exists followup_due    date,
  add column if not exists followup_set_by text,
  add column if not exists followup_set_at timestamptz;

comment on column sales_opportunities.followup_text is
  'The live follow-up alert. Null means nothing is owed on this lead.';
comment on column sales_opportunities.followup_kind is
  'call | email | meeting | other. Free text on purpose, no constraint.';
comment on column sales_opportunities.followup_owner is
  'Email of the person tasked with the follow-up. Separate from assigned_to_email, which is who owns the lead.';
comment on column sales_opportunities.followup_due is
  'Date the follow-up is owed by. Null means no date was set.';

-- Reading "everything owed this week, across the board" is the query this
-- feature exists for, so it gets an index rather than a sequential scan.
create index if not exists sales_opportunities_followup_due_idx
  on sales_opportunities (followup_due)
  where followup_text is not null;
