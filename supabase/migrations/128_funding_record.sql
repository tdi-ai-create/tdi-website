-- Runs against the CREATOR PORTAL project (tauzahhnawejouvtbvuw).
--
-- Every note anyone has written about grant work, in one chronological record.
--
-- Nothing was being lost. 221 records exist across seven separate places, and
-- not one screen or query reads them together:
--
--   funding_pursuit_timeline          162  what happened, system and people
--   funding_action_items.notes         15  Bella and Rae, on individual tasks
--   funding_narrative_qa_reviews       15  Julie's full review history
--   cancel_reason / denial_reason      13  why something was stopped
--   funding_pursuits.internal_notes     8  free text per school
--   funding_opportunities.qa_notes      5  Julie's verdict summary
--   funding_opportunity_notes           3  free notes on a path
--
-- So "what did we say about this school, and when" could only be answered by
-- opening seven tables and merging them by hand. That is the same shape as
-- every other failure here: the information exists and nothing surfaces it.
--
-- A view rather than a table, deliberately. Copying notes into a new store
-- would create a second source of truth that drifts, and drift is what this
-- codebase keeps being bitten by. This reads through to wherever each note
-- actually lives, so it can never disagree with the original.

create or replace view public.funding_record
with (security_invoker = true) as

-- What happened, including everything the system narrates about itself
select
  t.pursuit_id,
  null::uuid                                   as opportunity_id,
  (t.event_date::timestamptz)                  as occurred_at,
  'system'::text                               as author,
  'event'::text                                as kind,
  t.event_title                                as subject,
  t.event_detail                               as body
from public.funding_pursuit_timeline t

union all

-- Notes a person left on a task
select
  a.pursuit_id, a.opportunity_id, a.updated_at,
  coalesce(a.completed_by, a.owner_email, 'unknown'),
  'task note', a.title, a.notes
from public.funding_action_items a
where a.notes is not null and btrim(a.notes) <> ''

union all

-- Why a task was cancelled
select
  a.pursuit_id, a.opportunity_id, coalesce(a.completed_at, a.updated_at),
  coalesce(a.completed_by, 'unknown'),
  'cancelled', a.title, a.cancel_reason
from public.funding_action_items a
where a.cancel_reason is not null and btrim(a.cancel_reason) <> ''

union all

-- What a question was actually answered with. New, and the point of the
-- decision records: "done" now carries what we learned.
select
  a.pursuit_id, a.opportunity_id, coalesce(a.answered_at, a.updated_at),
  coalesce(a.answered_by, 'unknown'),
  'answer', a.title,
  a.answer || case when a.outcome is not null then ' — ' || a.outcome else '' end
from public.funding_action_items a
where a.answer is not null and btrim(a.answer) <> ''

union all

-- Free notes written against a funding path
select
  o.pursuit_id, n.opportunity_id, n.created_at,
  coalesce(n.author, 'unknown'), 'path note', o.name, n.content
from public.funding_opportunity_notes n
join public.funding_opportunities o on o.id = n.opportunity_id

union all

-- Julie's full review history, every attempt, not just the last verdict
select
  o.pursuit_id, q.opportunity_id, q.created_at,
  coalesce(q.reviewer, 'julie'), 'qa review',
  o.name || ' — attempt ' || q.attempt || case when q.passed then ', passed' else ', failed' end,
  q.summary
from public.funding_narrative_qa_reviews q
join public.funding_opportunities o on o.id = q.opportunity_id

union all

-- Why a funder said no
select
  o.pursuit_id, o.id, coalesce(o.decision_date::timestamptz, o.updated_at),
  'funder', 'denied', o.name, o.denial_reason
from public.funding_opportunities o
where o.denial_reason is not null and btrim(o.denial_reason) <> ''

union all

-- Why the stop rule refused a path
select
  o.pursuit_id, o.id, o.eligibility_checked_at,
  'eligibility screen', 'stopped', o.name, o.eligibility_reason
from public.funding_opportunities o
where o.eligibility_reason is not null and o.eligibility_verdict <> 'clear'

union all

-- The free-text block kept per school
select
  p.id, null::uuid, p.updated_at, 'unknown', 'school note', p.district_name, p.internal_notes
from public.funding_pursuits p
where p.internal_notes is not null and btrim(p.internal_notes) <> '';

comment on view public.funding_record is
  'Every note, event, review, answer and reason written about grant work, from all seven places they live, in one chronological record. A view rather than a table so it can never drift from the originals.';
